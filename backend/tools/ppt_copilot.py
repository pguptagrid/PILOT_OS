"""PPT tools — navigate + jump to slide by number or title + summarize."""

import asyncio
import logging

logger = logging.getLogger("pilot.tools.ppt")

from backend.core.slide_store import _current_slide, _slide_store, resolve_sid


async def ppt_navigate(args: dict, session_id: str) -> dict:
    direction = args.get("direction", "next")
    from backend.queues.bus import bus

    effective_sid = resolve_sid(session_id)
    slides = _slide_store.get(effective_sid, [])
    total = len(slides)
    current = _current_slide.get(effective_sid, 0)

    if direction == "next":
        if total > 0 and current >= total - 1:
            return {
                "spoken_reply": f"You've reached the last slide — slide {total} of {total}. That's the end of the presentation."
            }
        _current_slide[effective_sid] = min(current + 1, max(total - 1, 0))
    elif direction == "prev":
        if current <= 0:
            return {"spoken_reply": "You're already on the first slide."}
        _current_slide[effective_sid] = max(current - 1, 0)
    elif direction == "first":
        _current_slide[effective_sid] = 0
    elif direction == "last":
        _current_slide[effective_sid] = max(total - 1, 0)

    await bus.emit_event("ppt_command", {"action": direction}, session_id)
    return {"status": "ok", "direction": direction, "index": _current_slide.get(effective_sid, 0)}


async def ppt_jump_to_title(args: dict, session_id: str) -> dict:
    query = args.get("query", "")
    slide_number = args.get("slide_number")  # already 0-indexed if from keyword fallback
    import re

    from backend.queues.bus import bus

    effective_sid = resolve_sid(session_id)
    slides = _slide_store.get(effective_sid, [])

    # If explicit slide number given, use directly
    if slide_number is not None:
        idx = int(slide_number)
        _current_slide[effective_sid] = idx
        await bus.emit_event("ppt_command", {"action": "goto", "index": idx}, session_id)
        return {"status": "ok", "index": idx, "title": f"Slide {idx + 1}"}

    q = query.lower()

    # Numeric match in query — only allow within actual deck bounds
    m = re.search(r"\b(\d+)\b", q)
    if m:
        idx = int(m.group(1)) - 1
        if 0 <= idx < len(slides):
            _current_slide[effective_sid] = idx
            await bus.emit_event("ppt_command", {"action": "goto", "index": idx}, session_id)
            return {"status": "ok", "index": idx}

    # Title fuzzy match
    best_idx, best_score = 0, 0
    for s in slides:
        score = sum(1 for w in q.split() if w in s.get("title", "").lower())
        if score > best_score:
            best_score = score
            best_idx = s["index"]

    _current_slide[effective_sid] = best_idx
    await bus.emit_event("ppt_command", {"action": "goto", "index": best_idx}, session_id)
    return {"status": "ok", "index": best_idx}


async def ppt_delete_slide(args: dict, session_id: str) -> dict:
    from backend.api.ppt import _current_slide, _slide_store, resolve_sid, save_and_render_pptx
    from backend.queues.bus import bus

    effective_sid = resolve_sid(session_id)
    slides = list(_slide_store.get(effective_sid, []))
    if not slides:
        return {"status": "error", "spoken_reply": "There are no slides in the presentation to delete."}

    current_idx = _current_slide.get(effective_sid, 0)
    if current_idx < 0 or current_idx >= len(slides):
        current_idx = 0

    slides.pop(current_idx)

    # Re-build slide list preserving images
    slides_to_save = []
    for s in slides:
        slides_to_save.append(
            {
                "title": s.get("title", ""),
                "bullets": s.get("bullets", []),
                "notes": s.get("notes", ""),
                "images": s.get("images", []),
            }
        )

    try:
        rendered = save_and_render_pptx(slides_to_save, effective_sid, topic="Presentation")
        new_idx = min(current_idx, max(len(rendered) - 1, 0))
        _current_slide[effective_sid] = new_idx

        # Emit reload event
        await bus.emit_event(
            "ppt_command",
            {
                "action": "reload",
                "slides": rendered,
                "filename": f"Presentation ({len(rendered)} slides)",
                "index": new_idx,
                "preserveCurrent": False,
            },
            session_id,
        )

        return {"status": "ok", "spoken_reply": "I have deleted the current slide."}
    except Exception as e:
        return {"status": "error", "spoken_reply": f"Failed to delete slide: {e}"}


async def ppt_create_slides(args: dict, session_id: str) -> dict:
    import re

    from backend.api.ppt import create_presentation_from_prompt
    from backend.queues.bus import bus

    query = args.get("query", "presentation")

    # ── DYNAMIC SLIDE COUNT PARSING ──
    # Default is 5 slides
    slide_count = 5

    word_to_num = {
        "one": 1,
        "two": 2,
        "three": 3,
        "four": 4,
        "five": 5,
        "six": 6,
        "seven": 7,
        "eight": 8,
        "nine": 9,
        "ten": 10,
        "eleven": 11,
        "twelve": 12,
        "thirteen": 13,
        "fourteen": 14,
        "fifteen": 15,
        "sixteen": 16,
        "seventeen": 17,
        "eighteen": 18,
        "nineteen": 19,
        "twenty": 20,
    }

    # Try digit match first, e.g., "10 slides" or "10 slide" or "10 page" or "10 pages"
    m_digit = re.search(r"(\d+)\s*(?:slide|page)s?", query.lower())
    if m_digit:
        slide_count = int(m_digit.group(1))
    else:
        # Try word match, e.g., "ten slides" or "ten slide"
        m_word = re.search(r"\b(" + "|".join(word_to_num.keys()) + r")\b\s*(?:slide|page)s?", query.lower())
        if m_word:
            slide_count = word_to_num[m_word.group(1)]

    # Keep slide count in a safe, reasonable range (1 to 20) to avoid timeouts
    slide_count = max(1, min(slide_count, 20))

    # Clean the topic string by removing the slide count specification so that the LLM only generates on the topic itself
    topic = query
    topic = re.sub(
        r"\b(?:with|having|of|containing)?\s*\d+\s*(?:slide|page)s?\b", "", topic, flags=re.IGNORECASE
    )
    topic = re.sub(
        r"\b(?:with|having|of|containing)?\s*(?:" + "|".join(word_to_num.keys()) + r")\s*(?:slide|page)s?\b",
        "",
        topic,
        flags=re.IGNORECASE,
    )
    topic = re.sub(r"\s+", " ", topic).strip(" .?!")

    if not topic:
        topic = "Presentation"

    logger.info(f"Generating presentation on topic: '{topic}' with slide count: {slide_count} via voice...")
    slides = await create_presentation_from_prompt(
        prompt=topic, session_id=session_id, slide_count=slide_count
    )

    await bus.emit_event(
        "ppt_command", {"action": "reload", "slides": slides, "filename": f"AI: {topic}"}, session_id
    )

    return {
        "status": "ok",
        "spoken_reply": f"I have generated a new widescreen presentation on {topic} containing {len(slides)} slides. It is now loaded on your screen.",
    }


async def ppt_summarize(args: dict, session_id: str) -> dict:
    effective_sid = resolve_sid(session_id)
    slides = _slide_store.get(effective_sid, []) or _slide_store.get("default", [])
    if not slides:
        return {"spoken_reply": "No presentation is loaded yet. Please upload a PowerPoint file first."}

    lines = []
    for s in slides:
        title = s.get("title", f"Slide {s['index'] + 1}")
        notes = s.get("notes", "")
        lines.append(f"Slide {s['index'] + 1}: {title}" + (f" — {notes}" if notes else ""))

    content = "\n".join(lines)
    logger.info(f"📡 [PPT TOOL] Requesting presentation summary from Ollama ({len(slides)} slides)...")
    summary = await _summarize_ollama(content)
    logger.info("📡 [PPT TOOL] Ollama summary completed successfully.")
    return {"spoken_reply": summary}


async def _summarize_ollama(content: str) -> str:
    def _call() -> str:
        import ollama

        from backend.core.config import settings

        resp = ollama.chat(
            model=settings.OLLAMA_MODEL,
            messages=[
                {
                    "role": "system",
                    "content": "You are a helpful voice assistant. Summarize the presentation in 4-6 natural spoken sentences. "
                    "Mention the main topics and key points. No markdown, no bullet points — plain conversational speech only.",
                },
                {"role": "user", "content": f"Summarize this presentation:\n\n{content[:30000]}"},
            ],
            think=False,
            options={"num_predict": 220},
            stream=False,
        )
        if isinstance(resp, dict):
            return resp["message"]["content"].strip()
        return resp.message.content.strip()

    try:
        return await asyncio.to_thread(_call)
    except Exception as e:
        logger.error(f"ppt_summarize ollama error: {e}")
        return "I wasn't able to summarize the presentation right now. Please try again."


async def ppt_qa(args: dict, session_id: str) -> dict:
    import re

    query = args.get("query", "").strip()
    if not query:
        return {"spoken_reply": "I'm here! What would you like to know about the slides?", "status": "ok"}

    effective_sid = resolve_sid(session_id)
    slides = _slide_store.get(effective_sid, []) or _slide_store.get("default", [])
    if not slides:
        return {
            "spoken_reply": "I don't have any presentation slides loaded yet. Please upload a PowerPoint file first.",
            "status": "ok",
        }

    # Extract slide number/index
    # Supports word equivalents of numbers as well
    word_to_num = {
        "one": 1,
        "two": 2,
        "three": 3,
        "four": 4,
        "five": 5,
        "six": 6,
        "seven": 7,
        "eight": 8,
        "nine": 9,
        "ten": 10,
        "eleven": 11,
        "twelve": 12,
        "thirteen": 13,
        "fourteen": 14,
        "fifteen": 15,
        "sixteen": 16,
        "seventeen": 17,
        "eighteen": 18,
        "nineteen": 19,
        "twenty": 20,
    }

    slide_index = None
    num_match = re.search(r"slide\s+(\d+)", query.lower())
    if num_match:
        slide_index = int(num_match.group(1)) - 1
    else:
        for word, num in word_to_num.items():
            if re.search(rf"\bslide\s+{word}\b", query.lower()):
                slide_index = num - 1
                break

    # If no explicit slide number was matched, check if the user refers to the current/active slide
    if slide_index is None:
        current_keywords = [
            "current slide",
            "this slide",
            "active slide",
            "present slide",
            "current page",
            "this page",
        ]
        if any(kw in query.lower() for kw in current_keywords):
            slide_index = _current_slide.get(effective_sid, 0)

    # If explicit or resolved slide index was matched and is valid
    if slide_index is not None and 0 <= slide_index < len(slides):
        slide = slides[slide_index]
        title = slide.get("title", f"Slide {slide_index + 1}")
        bullets_text = " ".join(slide.get("bullets", []))
        notes = slide.get("notes", "")
        img_b64 = slide.get("img_b64")

        slide_desc = f"Slide {slide_index + 1}: {title}. Content: {bullets_text}."
        if notes:
            slide_desc += f" Speaker Notes: {notes}."

        logger.info(f"Answering PPT Q&A for slide {slide_index + 1} using slide data.")

        prompt = (
            f"The user is asking: '{query}'. This is regarding slide {slide_index + 1} "
            f"of the presentation, which is titled '{title}'. "
            f"The text content on this slide is: '{bullets_text}'. "
            f"Speaker notes for this slide say: '{notes}'.\n"
            f"Please write a friendly, clear, and comprehensive spoken response of 2-3 sentences answering the user's question directly based on this slide content."
        )

        # If image is available and we have a vision-capable provider
        if img_b64:
            logger.info("Slide image is available. Calling Vision LLM.")
            reply = await _call_vision_llm(prompt, img_b64)
            if reply:
                return {"spoken_reply": reply, "status": "ok", "slide_index": slide_index}

        # Text-only fallback
        reply = await _call_text_llm(prompt)
        return {"spoken_reply": reply, "status": "ok", "slide_index": slide_index}

    else:
        # General presentation Q&A
        all_content = []
        for s in slides:
            bullets_str = ", ".join(s.get("bullets", []))
            all_content.append(f"Slide {s['index'] + 1} (Title: {s.get('title', '')}): {bullets_str}")
        full_structure = "\n".join(all_content)

        prompt = (
            f"The user is asking a question about the PowerPoint presentation: '{query}'. "
            f"Here is the text structure extracted from the presentation:\n"
            f"{full_structure[:30000]}\n"
            f"Please write a friendly, concise spoken response of 2-3 sentences answering their question directly based on the presentation slides."
        )

        logger.info("General PPT Q&A. Answering using full presentation text structure.")
        reply = await _call_text_llm(prompt)
        return {"spoken_reply": reply, "status": "ok"}


async def _call_vision_llm(prompt: str, img_b64: str) -> str | None:
    from backend.core.config import settings

    # Try Gemini Vision first (always preferred)
    if settings.GEMINI_API_KEY:
        try:
            import base64

            import google.generativeai as genai

            genai.configure(api_key=settings.GEMINI_API_KEY)
            # Use gemini-2.5-flash as it is the absolute latest and highest-capability Gemini model for vision and MCP Q&A
            model = genai.GenerativeModel("gemini-2.5-flash")
            img_bytes = base64.b64decode(img_b64)
            resp = await model.generate_content_async([prompt, {"mime_type": "image/png", "data": img_bytes}])
            if resp.text:
                return resp.text.strip()
        except Exception as e:
            logger.warning(f"Gemini vision PPT Q&A failed: {e}")

    # Try Groq vision if key is active
    if settings.GROQ_API_KEY:
        try:
            from groq import AsyncGroq

            client = AsyncGroq(api_key=settings.GROQ_API_KEY)
            resp = await client.chat.completions.create(
                model="llama-3.2-11b-vision-preview",
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": prompt},
                            {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{img_b64}"}},
                        ],
                    }
                ],
                max_tokens=200,
            )
            if resp.choices[0].message.content:
                return resp.choices[0].message.content.strip()
        except Exception as e:
            logger.warning(f"Groq vision PPT Q&A failed: {e}")

    return None


async def _call_text_llm(prompt: str) -> str:
    from backend.core.config import settings

    # Try Groq first
    if settings.GROQ_API_KEY:
        try:
            from groq import AsyncGroq

            client = AsyncGroq(api_key=settings.GROQ_API_KEY)
            resp = await client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=[
                    {
                        "role": "system",
                        "content": "You are a helpful voice assistant. Answer concisely in 1-3 spoken sentences.",
                    },
                    {"role": "user", "content": prompt},
                ],
                max_tokens=200,
            )
            if resp.choices[0].message.content:
                return resp.choices[0].message.content.strip()
        except Exception as e:
            logger.warning(f"Groq PPT text Q&A failed: {e}")

    # Try Gemini
    if settings.GEMINI_API_KEY:
        try:
            import google.generativeai as genai

            genai.configure(api_key=settings.GEMINI_API_KEY)
            # Use gemini-2.5-flash as it is the absolute latest and highest-capability Gemini model for text Q&A
            model = genai.GenerativeModel("gemini-2.5-flash")
            resp = await model.generate_content_async(prompt)
            if resp.text:
                return resp.text.strip()
        except Exception as e:
            logger.warning(f"Gemini PPT text Q&A failed: {e}")

    # Fallback to local Ollama
    try:
        import httpx

        url = f"{settings.OLLAMA_BASE_URL.rstrip('/')}/api/generate"
        async with httpx.AsyncClient(timeout=25.0) as client:
            resp = await client.post(
                url,
                json={
                    "model": settings.OLLAMA_MODEL,
                    "prompt": f"System: You are a helpful voice assistant. Answer concisely in 1-3 spoken sentences.\n\nUser: {prompt}",
                    "stream": False,
                },
            )
            if resp.status_code == 200:
                return resp.json().get("response", "").strip()
    except Exception as e:
        logger.error(f"Ollama local PPT text Q&A failed: {e}")

    return "I analyzed the presentation slide but was unable to generate a response. Please check your AI API keys."


async def _generate_single_slide_content(topic: str) -> dict:
    import json
    import re

    import httpx

    from backend.core.config import settings

    system_content = (
        "You are an expert presentation designer. Create a SINGLE highly professional slide based on the user's topic.\n"
        "You MUST respond ONLY with a valid JSON object. Do not write any markdown, "
        "explanations, or backticks outside the JSON. The JSON must follow this exact schema:\n"
        "{\n"
        '  "title": "Slide Title",\n'
        '  "bullets": ["Detailed, informative bullet point 1", "Detailed, informative bullet point 2"],\n'
        '  "notes": "Comprehensive speaker notes detailing the slide concepts"\n'
        "}\n"
        "Keep bullets concise and professional (under 12 words each, max 4 bullets per slide)."
    )

    parsed = None

    # 1. Try Gemini
    if settings.GEMINI_API_KEY:
        try:
            import google.generativeai as genai

            genai.configure(api_key=settings.GEMINI_API_KEY)
            model = genai.GenerativeModel("gemini-2.5-flash")
            response = await model.generate_content_async(
                f"Create a single professional slide on the topic: '{topic}'",
                generation_config={
                    "response_mime_type": "application/json",
                    "system_instruction": system_content,
                },
            )
            parsed = json.loads(response.text.strip())
        except Exception as e:
            logger.warning(f"Cloud Gemini single slide generation failed: {e}")

    # 2. Try Groq
    if not parsed and settings.GROQ_API_KEY:
        try:
            from groq import AsyncGroq

            client = AsyncGroq(api_key=settings.GROQ_API_KEY)
            resp = await client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": system_content},
                    {"role": "user", "content": f"Create a single slide on: '{topic}'"},
                ],
                response_format={"type": "json_object"},
            )
            parsed = json.loads(resp.choices[0].message.content)
        except Exception as e:
            logger.warning(f"Cloud Groq single slide generation failed: {e}")

    # 3. Fallback to local Ollama
    if not parsed:
        try:
            url = f"{settings.OLLAMA_BASE_URL.rstrip('/')}/api/chat"
            payload = {
                "model": settings.OLLAMA_MODEL,
                "stream": False,
                "messages": [
                    {"role": "system", "content": system_content},
                    {"role": "user", "content": f"Create a single slide on: '{topic}'"},
                ],
                "options": {"temperature": 0.3, "num_predict": 500},
                "format": "json",
            }
            async with httpx.AsyncClient(timeout=40.0) as client:
                resp = await client.post(url, json=payload)
                if resp.status_code == 200:
                    result_data = resp.json()
                    raw_content = result_data.get("message", {}).get("content", "").strip()
                    try:
                        parsed = json.loads(raw_content)
                    except Exception:
                        json_match = re.search(r"(\{.*\})", raw_content, re.DOTALL)
                        if json_match:
                            parsed = json.loads(json_match.group(1))
        except Exception as e:
            logger.error(f"Local Ollama single slide generation failed: {e}")

    # Normalize output
    if parsed and isinstance(parsed, dict):
        title = parsed.get("title", topic.title())
        bullets = parsed.get("bullets", [])
        if isinstance(bullets, str):
            bullets = [bullets]
        elif not isinstance(bullets, list):
            bullets = []
        notes = parsed.get("notes", "")
        return {"title": str(title), "bullets": [str(b) for b in bullets], "notes": str(notes)}

    # Fallback template slide
    return {
        "title": topic.title(),
        "bullets": [
            f"Overview of {topic}",
            "Key definitions and background concepts",
            "Primary challenges and modern implications",
        ],
        "notes": f"This slide presents key details about {topic}.",
    }


async def ppt_add_slide(args: dict, session_id: str) -> dict:
    from backend.api.ppt import save_and_render_pptx
    from backend.core.slide_store import resolve_sid
    from backend.queues.bus import bus

    effective_sid = resolve_sid(session_id)
    slides = list(_slide_store.get(effective_sid, []))

    topic = args.get("topic", "").strip(" .?!")
    if not topic:
        topic = "New Slide"

    logger.info(f"Adding a slide on topic '{topic}' via voice...")

    # Generate content
    if topic != "New Slide":
        new_slide = await _generate_single_slide_content(topic)
    else:
        new_slide = {
            "title": "New Slide",
            "bullets": ["Write content or use voice to edit this slide"],
            "notes": "",
        }

    # Recompile plain slide data
    slides_to_save = []
    for s in slides:
        slides_to_save.append(
            {"title": s.get("title", ""), "bullets": s.get("bullets", []), "notes": s.get("notes", "")}
        )
    slides_to_save.append(new_slide)

    # Save and render
    rendered = save_and_render_pptx(slides_to_save, effective_sid, topic=topic)
    new_idx = len(rendered) - 1
    _current_slide[effective_sid] = new_idx

    await bus.emit_event(
        "ppt_command",
        {
            "action": "reload",
            "slides": rendered,
            "filename": f"Presentation ({len(rendered)} slides)",
            "index": new_idx,
            "preserveCurrent": False,
        },
        session_id,
    )

    return {
        "status": "ok",
        "spoken_reply": f"I've added a slide about {new_slide['title']} and navigated to it.",
    }


async def ppt_edit_slide(args: dict, session_id: str) -> dict:
    from backend.api.ppt import save_and_render_pptx
    from backend.core.slide_store import resolve_sid
    from backend.queues.bus import bus

    effective_sid = resolve_sid(session_id)
    slides = list(_slide_store.get(effective_sid, []))
    if not slides:
        return {"status": "error", "spoken_reply": "There is no active presentation to edit."}

    current_idx = _current_slide.get(effective_sid, 0)
    if current_idx < 0 or current_idx >= len(slides):
        current_idx = 0

    title = args.get("title")
    bullets = args.get("bullets")
    add_bullet = args.get("add_bullet")
    notes = args.get("notes")

    spoken_reply = "Updated the slide successfully."

    if title is not None:
        slides[current_idx]["title"] = title
        spoken_reply = f"I have updated the slide title to '{title}'."
    if bullets is not None:
        slides[current_idx]["bullets"] = bullets
        spoken_reply = "I have updated the bullet points on this slide."
    elif add_bullet is not None:
        if "bullets" not in slides[current_idx] or not isinstance(slides[current_idx]["bullets"], list):
            slides[current_idx]["bullets"] = []
        slides[current_idx]["bullets"].append(add_bullet)
        spoken_reply = f"I've added a bullet point about '{add_bullet}' to this slide."
    if notes is not None:
        slides[current_idx]["notes"] = notes
        spoken_reply = "I have updated the speaker notes for this slide."

    # Recompile plain slide data
    slides_to_save = []
    for s in slides:
        slides_to_save.append(
            {"title": s.get("title", ""), "bullets": s.get("bullets", []), "notes": s.get("notes", "")}
        )

    rendered = save_and_render_pptx(slides_to_save, effective_sid, topic="Presentation")
    _current_slide[effective_sid] = current_idx

    await bus.emit_event(
        "ppt_command",
        {
            "action": "reload",
            "slides": rendered,
            "filename": f"Presentation ({len(rendered)} slides)",
            "index": current_idx,
            "preserveCurrent": True,
        },
        session_id,
    )

    return {"status": "ok", "spoken_reply": spoken_reply}


async def ppt_clear_presentation(args: dict, session_id: str) -> dict:
    from backend.api.ppt import save_and_render_pptx
    from backend.core.slide_store import resolve_sid
    from backend.queues.bus import bus

    effective_sid = resolve_sid(session_id)
    default_slides = [
        {
            "title": "New Presentation",
            "bullets": ["Voice-Driven Interactive Presentation", "Start speaking or clicking to add slides"],
            "notes": "Welcome to your new interactive presentation deck.",
        }
    ]

    rendered = save_and_render_pptx(default_slides, effective_sid, topic="New Presentation")
    _current_slide[effective_sid] = 0

    await bus.emit_event(
        "ppt_command",
        {
            "action": "reload",
            "slides": rendered,
            "filename": "New Presentation",
            "index": 0,
            "preserveCurrent": False,
        },
        session_id,
    )

    return {
        "status": "ok",
        "spoken_reply": "I have started a new presentation deck with a blank title slide. What topic would you like to add a slide about?",
    }


async def ppt_improvise_slide(args: dict, session_id: str) -> dict:
    from backend.api.ppt import improvise_slide_content, save_and_render_pptx
    from backend.core.slide_store import resolve_sid
    from backend.queues.bus import bus

    effective_sid = resolve_sid(session_id)
    slides = list(_slide_store.get(effective_sid, []))
    if not slides:
        return {"status": "error", "spoken_reply": "There is no active presentation to improvise."}

    current_idx = _current_slide.get(effective_sid, 0)
    if current_idx < 0 or current_idx >= len(slides):
        current_idx = 0

    prompt = args.get("prompt", "").strip(" .?!")
    if not prompt:
        return {"status": "error", "spoken_reply": "What would you like me to improve on this slide?"}

    logger.info(f"Improvising slide {current_idx + 1} with prompt: '{prompt}' via voice...")

    try:
        current_slide = slides[current_idx]
        improved = await improvise_slide_content(current_slide, prompt)

        # Update text fields but preserve any images!
        slides[current_idx]["title"] = improved["title"]
        slides[current_idx]["bullets"] = improved["bullets"]
        slides[current_idx]["notes"] = improved["notes"]

        # Recompile plain slide data
        slides_to_save = []
        for s in slides:
            slides_to_save.append(
                {
                    "title": s.get("title", ""),
                    "bullets": s.get("bullets", []),
                    "notes": s.get("notes", ""),
                    "images": s.get("images", []),
                }
            )

        rendered = save_and_render_pptx(slides_to_save, effective_sid, topic="Presentation")
        _current_slide[effective_sid] = current_idx

        await bus.emit_event(
            "ppt_command",
            {
                "action": "reload",
                "slides": rendered,
                "filename": f"Presentation ({len(rendered)} slides)",
                "index": current_idx,
                "preserveCurrent": True,
            },
            session_id,
        )

        return {
            "status": "ok",
            "spoken_reply": f"I've improvised this slide according to your request: {prompt}.",
        }
    except Exception as e:
        logger.error(f"Error improvising slide via voice: {e}")
        return {
            "status": "error",
            "spoken_reply": "I encountered an error trying to improvise the slide. Please try again.",
        }
