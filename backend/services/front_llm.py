"""
Front LLM — Ollama primary, keyword fallback with full PPT navigation.
"""
import json, logging, time, re
from backend.core.config import settings

logger = logging.getLogger("pilot.front_llm")

SYSTEM_PROMPT = """You are PILOT — a real-time voice AI copilot routing engine.

Output ONLY valid JSON — no other text:
{
  "action": "ignore" | "respond_now" | "delegate",
  "preamble": "<spoken reply ≤12 words, warm and human>",
  "tool": "<tool_name or null>",
  "args": {},
  "mode": "queue" | "interrupt"
}

PREAMBLE must sound human: "On it!", "Sure!", "Let me check.", "Got it!", "Right away!"

PPT TOOLS: ppt_navigate(direction:next|prev|first|last), ppt_jump_to_title(query,slide_number), ppt_qa(query,slide_number), ppt_summarize(), ppt_delete_slide(), ppt_create_slides(query)
CARE TOOLS: kb_search(query), crm_lookup, flight_search, flight_book, database_query(query), write_file(query), system_check(query), complex_calculation(query), general_qa(query)

INSTRUCTIONS: Route short greetings, simple chit-chat, or quick comments DIRECTLY as "respond_now" (no tool, preamble contains the actual complete answer to the query). For general knowledge questions, coding/programming requests, detailed explanations, or research queries, use "delegate" with the tool "general_qa" to generate a detailed structured response in the background. Only use other tools for slide control, flight operations, file writing, system checks, database querying, etc.

Keep direct answers friendly and brief (1-3 sentences max)."""

# IGNORE: filler, noise, unclear, confidence<0.6, negated commands

_KEYWORDS = [
    # PPT navigation
    (["next slide","go forward","advance","next one"],
     {"action":"delegate","preamble":"Moving forward!","tool":"ppt_navigate","args":{"direction":"next"},"mode":"queue"}),
    (["previous slide","go back","back one","prev slide"],
     {"action":"delegate","preamble":"Going back!","tool":"ppt_navigate","args":{"direction":"prev"},"mode":"queue"}),
    (["first slide","go to start","beginning"],
     {"action":"delegate","preamble":"Back to the start!","tool":"ppt_navigate","args":{"direction":"first"},"mode":"queue"}),
    (["last slide","go to end","final slide","end slide"],
     {"action":"delegate","preamble":"Jumping to the end!","tool":"ppt_navigate","args":{"direction":"last"},"mode":"queue"}),
    # Greetings
    (["hello","hi pilot","hey pilot","good morning","good afternoon","hi there"],
     {"action":"respond_now","preamble":"Hey! I'm listening — what can I help with?","tool":None,"args":{},"mode":"queue"}),
    (["thank you","thanks","great","good job","well done"],
     {"action":"respond_now","preamble":"Happy to help! What else can I do?","tool":None,"args":{},"mode":"queue"}),
    # Knowledge / search
    (["search","look up","find","tell me about","what is","explain","describe"],
     {"action":"delegate","preamble":"Let me look that up!","tool":"general_qa","args":{},"mode":"queue"}),

    # Flights and Travel
    (["book flight","find flight","search flight","fly to","flights from","hotel","room","stay","booking","lodging","train","rail","irctc","cab","taxi","uber","ola","rapido"],
     {"action":"delegate","preamble":"Checking that travel information for you!","tool":"flight_search","args":{},"mode":"queue"}),
    # CRM
    (["look up customer","find customer","customer details","crm"],
     {"action":"delegate","preamble":"Looking up that customer.","tool":"crm_lookup","args":{},"mode":"queue"}),
    # Database
    (["database","recordings","query database","show recordings","how many files in database"],
     {"action":"delegate","preamble":"Querying the database for you.","tool":"database_query","args":{},"mode":"queue"}),
    # Write File
    (["write python","write a python","write file","create a file","write script","generate code"],
     {"action":"delegate","preamble":"On it! Writing that file and generating the code in the background. Please wait while I process the script.","tool":"write_file","args":{},"mode":"queue"}),
    # Write Email
    (["write email","draft email","email template","create email","write an email","draft an email","create an email"],
     {"action":"delegate","preamble":"On it! Drafting that email for you in the background. Let me compile the template.","tool":"write_email","args":{},"mode":"queue"}),
    # Send Email
    (["send email","send this email","send the email","send the mail","send mail","dispatch email","dispatch mail"],
     {"action":"delegate","preamble":"On it! Sending that drafted email for you in real-time. Please wait while I dispatch the SMTP message.","tool":"send_email","args":{},"mode":"queue"}),
    # System Check
    (["workspace files","system check","project files","list directory","check cpu","system stats"],
     {"action":"delegate","preamble":"Running a system check now.","tool":"system_check","args":{},"mode":"queue"}),
    # Complex Calculation
    (["calculate","math","calculation","prime number"],
     {"action":"delegate","preamble":"Starting that complex calculation now.","tool":"complex_calculation","args":{},"mode":"queue"}),
    # Interrupt Trigger Keywords
    (["stop current task","cancel background","stop process","abort task","cancel task","stop current","cancel background agent"],
     {"action":"delegate","preamble":"Canceling active process immediately.","tool":"cancel_task","args":{},"mode":"interrupt"}),
]


class FrontLLMProvider:
    def __init__(self):
        self._client = None

    def load(self):
        try:
            from groq import AsyncGroq
            if settings.GROQ_API_KEY:
                self._client = AsyncGroq(api_key=settings.GROQ_API_KEY)
                logger.info("Groq FrontLLM provider ready ✓ (using llama-3.1-8b-instant)")
            else:
                logger.warning("No GROQ_API_KEY found, FrontLLM fallback active")
        except Exception as e:
            logger.warning(f"Failed to load Groq FrontLLM: {e} — keyword fallback active")

    async def classify(self, text: str, speaker_id: str, role: str, context: list, session_id: str = "") -> dict:
        # Check Case 2: Verification matching
        
        is_verified = (speaker_id is not None) and (speaker_id != "You") and (speaker_id != "unknown")

        print(f"\n⚡ [FRONT LLM] Classifying utterance: \"{text}\"")

        # ── Fast slide Q&A / Summarization quick-intercept ──
        user_clean = re.sub(r"[^\w\s]", "", text.lower()).strip()
        
        # ── Fast slide clear/reset quick-intercept ──
        if any(q in user_clean for q in ("start a new presentation", "clear the presentation", "clear presentation", "start a new deck", "create a new blank deck", "create blank deck", "start fresh", "new blank deck")):
            result = {
                "action": "delegate",
                "preamble": "On it! Clearing the slides and starting a fresh presentation deck.",
                "tool": "ppt_clear_presentation",
                "args": {},
                "mode": "queue"
            }
            if is_verified:
                result["preamble"] = f"Hello {speaker_id}! " + result["preamble"]
            else:
                result["preamble"] = "Hello there! " + result["preamble"]
            print(f"⚡ [FRONT LLM INTERCEPT] Clear presentation action: '{result['action']}' | Tool: '{result['tool']}'")
            return result

        # ── Fast slide add quick-intercept ──
        if any(q in user_clean for q in ("add a slide", "add slide", "insert a slide", "insert slide", "create a slide", "create slide", "add another slide", "insert another slide")):
            topic = ""
            for phrase in ("add a slide about ", "add slide about ", "insert a slide on ", "insert slide on ", "create a slide about ", "create slide about ", "add a slide explaining ", "add slide explaining ", "add slide ", "add a slide ", "insert slide ", "insert a slide "):
                if phrase in user_clean:
                    idx = text.lower().find(phrase)
                    if idx != -1:
                        topic = text[idx + len(phrase):].strip(" .?!")
                        break
            if not topic:
                topic = "New Slide"
            
            result = {
                "action": "delegate",
                "preamble": f"On it! Generating and adding a slide about {topic}.",
                "tool": "ppt_add_slide",
                "args": {"topic": topic},
                "mode": "queue"
            }
            if is_verified:
                result["preamble"] = f"Hello {speaker_id}! " + result["preamble"]
            else:
                result["preamble"] = "Hello there! " + result["preamble"]
            print(f"⚡ [FRONT LLM INTERCEPT] Add slide action: '{result['action']}' | Tool: '{result['tool']}' | Topic: '{topic}'")
            return result

        # ── Fast slide edit quick-intercept ──
        if any(q in user_clean for q in ("change the title", "change title", "update slide title", "update the title", "set the title", "set slide title")):
            title = ""
            for phrase in ("change the title of this slide to ", "change the title to ", "change title of this slide to ", "change title to ", "update slide title to ", "update the title to ", "set the title of this slide to ", "set the title to ", "set slide title to ", "change the slide title to "):
                if phrase in user_clean:
                    idx = text.lower().find(phrase)
                    if idx != -1:
                        title = text[idx + len(phrase):].strip(" '\"`•.?!")
                        break
            if title:
                result = {
                    "action": "delegate",
                    "preamble": f"Sure, changing the slide title to '{title}'.",
                    "tool": "ppt_edit_slide",
                    "args": {"title": title},
                    "mode": "queue"
                }
                if is_verified:
                    result["preamble"] = f"Hello {speaker_id}! " + result["preamble"]
                else:
                    result["preamble"] = "Hello there! " + result["preamble"]
                print(f"⚡ [FRONT LLM INTERCEPT] Edit slide title action: '{result['action']}' | Tool: '{result['tool']}' | Title: '{title}'")
                return result

        if any(q in user_clean for q in ("add a bullet point", "add a bullet", "add bullet point", "add bullet", "insert bullet", "append bullet")):
            bullet_text = ""
            for phrase in ("add a bullet point about ", "add a bullet point explaining ", "add a bullet about ", "add a bullet explaining ", "add bullet point about ", "add bullet point explaining ", "add bullet about ", "add bullet explaining ", "add bullet point ", "add bullet ", "insert bullet ", "append bullet "):
                if phrase in user_clean:
                    idx = text.lower().find(phrase)
                    if idx != -1:
                        bullet_text = text[idx + len(phrase):].strip(" '\"`•.?!")
                        break
            if bullet_text:
                result = {
                    "action": "delegate",
                    "preamble": f"On it, adding a bullet point about '{bullet_text}'.",
                    "tool": "ppt_edit_slide",
                    "args": {"add_bullet": bullet_text},
                    "mode": "queue"
                }
                if is_verified:
                    result["preamble"] = f"Hello {speaker_id}! " + result["preamble"]
                else:
                    result["preamble"] = "Hello there! " + result["preamble"]
                print(f"⚡ [FRONT LLM INTERCEPT] Add slide bullet action: '{result['action']}' | Tool: '{result['tool']}' | Bullet: '{bullet_text}'")
                return result

        # 1. First, intercept explicit summarization command to map it to ppt_summarize instead of generic slide visual slide_qa!
        is_summarize = False
        if any(kw in user_clean for kw in ("summarize", "summarise", "summary")):
            if any(ref in user_clean for ref in ("ppt", "presentation", "slides", "powerpoint")):
                if not re.search(r"slide\s+\d+", user_clean) and not any(f in user_clean for f in ("first slide", "last slide", "current slide", "this slide")):
                    is_summarize = True

        if is_summarize:
            result = {
                "action": "delegate",
                "preamble": "On it! Summarizing the entire presentation deck for you.",
                "tool": "ppt_summarize",
                "args": {},
                "mode": "queue"
            }
            if is_verified:
                result["preamble"] = f"Hello {speaker_id}! " + result["preamble"]
            else:
                result["preamble"] = "Hello there! " + result["preamble"]
            print(f"⚡ [FRONT LLM INTERCEPT] Slide Summarize action: '{result['action']}' | Tool: '{result['tool']}'")
            return result

        is_slide_qa = False
        if any(q in user_clean for q in ("explain", "describe", "tell", "read", "show", "summarize", "about", "content", "what is on")) and ("slide" in user_clean or "presentation" in user_clean or "powerpoint" in user_clean):
            is_slide_qa = True
        elif "presentation" in user_clean or "powerpoint" in user_clean:
            is_slide_qa = True
            
        if is_slide_qa:
            result = {
                "action": "delegate",
                "preamble": "Let me analyze the slides for you!",
                "tool": "ppt_qa",
                "args": {"query": text},
                "mode": "queue"
            }
            if is_verified:
                result["preamble"] = f"Hello {speaker_id}! " + result["preamble"]
            else:
                result["preamble"] = "Hello there! " + result["preamble"]
            print(f"⚡ [FRONT LLM INTERCEPT] Slide Q&A action: '{result['action']}' | Tool: '{result['tool']}'")
            return result

        # ── Fast slide creation quick-intercept ──
        if any(q in user_clean for q in ("create presentation", "make slide deck", "generate slides", "create slides", "make presentation", "generate presentation", "create a ppt", "generate a ppt", "make a ppt")):
            topic = text
            for phrase in ("create presentation about ", "make slide deck on ", "generate slides for ", "create slides about ", "make presentation about ", "generate presentation about ", "create a ppt on ", "generate a ppt on ", "make a ppt on "):
                if phrase in user_clean:
                    # Case-insensitive split to support capitalized inputs cleanly
                    topic = re.split(re.escape(phrase), text, flags=re.IGNORECASE)[-1].strip(" .?!")
                    break
            result = {
                "action": "delegate",
                "preamble": "On it! Generating a new presentation for you in the background. Please wait while I create the slides.",
                "tool": "ppt_create_slides",
                "args": {"query": topic},
                "mode": "queue"
            }
            if is_verified:
                result["preamble"] = f"Hello {speaker_id}! " + result["preamble"]
            else:
                result["preamble"] = "Hello there! " + result["preamble"]
            print(f"⚡ [FRONT LLM INTERCEPT] Slide creation action: '{result['action']}' | Tool: '{result['tool']}'")
            return result

        # ── Fast slide delete quick-intercept ──
        if any(q in user_clean for q in ("delete slide", "remove slide", "delete this slide", "remove this slide")):
            result = {
                "action": "delegate",
                "preamble": "Deleting the current slide now.",
                "tool": "ppt_delete_slide",
                "args": {},
                "mode": "queue"
            }
            if is_verified:
                result["preamble"] = f"Hello {speaker_id}! " + result["preamble"]
            else:
                result["preamble"] = "Hello there! " + result["preamble"]
            print(f"⚡ [FRONT LLM INTERCEPT] Slide delete action: '{result['action']}' | Tool: '{result['tool']}'")
            return result

        # ── Fast slide improvise quick-intercept ──
        if any(q in user_clean for q in ("improve this slide", "improve slide", "make this slide", "make slide", "rewrite this slide", "rewrite slide", "improvise this slide", "improvise slide")):
            prompt = ""
            for phrase in ("improve this slide by ", "improve slide by ", "make this slide ", "make slide ", "rewrite this slide by ", "rewrite slide by ", "improvise this slide by ", "improvise slide by ", "improve this slide ", "improve slide ", "rewrite this slide ", "rewrite slide ", "improvise this slide ", "improvise slide "):
                if phrase in user_clean:
                    idx = text.lower().find(phrase)
                    if idx != -1:
                        prompt = text[idx + len(phrase):].strip(" .?!")
                        break
            if not prompt:
                prompt = "make it better"
                
            result = {
                "action": "delegate",
                "preamble": f"On it! Improvising this slide according to your request: {prompt}.",
                "tool": "ppt_improvise_slide",
                "args": {"prompt": prompt},
                "mode": "queue"
            }
            if is_verified:
                result["preamble"] = f"Hello {speaker_id}! " + result["preamble"]
            else:
                result["preamble"] = "Hello there! " + result["preamble"]
            print(f"⚡ [FRONT LLM INTERCEPT] Improvise slide action: '{result['action']}' | Tool: '{result['tool']}' | Prompt: '{prompt}'")
            return result

        # ── Fast slide navigation quick-intercept ──
        slide_commands = {
            "next", "next slide", "previous slide", "go back", "slide back",
            "last slide", "first slide", "slide number", "jump to slide", "back",
            "go to slide", "go forward", "advance", "next one", "back one", "prev slide",
            "go to start", "beginning", "go to end", "final slide", "end slide"
        }
        
        is_slide_cmd = False
        if user_clean in slide_commands:
            is_slide_cmd = True
        elif any(cmd in user_clean for cmd in ["next slide", "previous slide", "go back", "slide back", "last slide", "first slide", "jump to slide", "go to slide", "go forward", "advance", "next one", "back one", "prev slide", "go to start", "beginning", "go to end", "final slide", "end slide"]):
            is_slide_cmd = True
        elif re.match(r"^(go\s+to\s+)?slide\s+(?:number\s+|no\s+|#\s*)?(\d+|one|two|three|four|five|six|seven|eight|nine|ten)$", user_clean):
            is_slide_cmd = True
        elif user_clean.startswith("go to slide ") or user_clean.startswith("jump to slide ") or "slide number" in user_clean:
            is_slide_cmd = True
            
        if is_slide_cmd:
            if any(k in user_clean for k in ["next", "forward", "advance"]):
                preamble = "Moving forward!"
                direction = "next"
            elif any(k in user_clean for k in ["back", "prev"]):
                preamble = "Going back!"
                direction = "prev"
            elif any(k in user_clean for k in ["first", "start", "beginning"]):
                preamble = "Back to the start!"
                direction = "first"
            elif any(k in user_clean for k in ["last", "end", "final"]):
                preamble = "Jumping to the end!"
                direction = "last"
            else:
                preamble = "Navigating slides!"
                direction = "next"
                
            m = re.search(r'\d+', user_clean)
            if m:
                num = int(m.group())
                result = {
                    "action": "delegate",
                    "preamble": f"Going to slide {num}!",
                    "tool": "ppt_jump_to_title",
                    "args": {"query": text, "slide_number": num - 1},
                    "mode": "queue"
                }
            else:
                word_to_num = {
                    "one": 1, "two": 2, "three": 3, "four": 4, "five": 5,
                    "six": 6, "seven": 7, "eight": 8, "nine": 9, "ten": 10
                }
                found_num = None
                for word, num in word_to_num.items():
                    if f"slide {word}" in user_clean:
                        found_num = num
                        break
                if found_num is not None:
                    result = {
                        "action": "delegate",
                        "preamble": f"Going to slide {found_num}!",
                        "tool": "ppt_jump_to_title",
                        "args": {"query": text, "slide_number": found_num - 1},
                        "mode": "queue"
                    }
                else:
                    result = {
                        "action": "delegate",
                        "preamble": preamble,
                        "tool": "ppt_navigate",
                        "args": {"direction": direction},
                        "mode": "queue"
                    }

            if is_verified:
                result["preamble"] = f"Hello {speaker_id}! " + result["preamble"]
            else:
                result["preamble"] = "Hello there! " + result["preamble"]
            print(f"⚡ [FRONT LLM INTERCEPT] Slide navigation action: '{result['action']}' | Tool: '{result['tool']}'")
            return result

        # ── Fast Email command intercept (To ensure local models like Llama 3.2 do not misclassify tools as general respond_now chatter) ──
        if "email" in user_clean or "mail" in user_clean:
            # Check if it's a dispatch command
            if any(cmd in user_clean for cmd in ["send email", "send the email", "send this email", "send mail", "send this mail", "send the mail", "dispatch email", "dispatch mail"]):
                result = {
                    "action": "delegate",
                    "preamble": "On it! Sending that drafted email for you in real-time. Please wait while I dispatch the SMTP message.",
                    "tool": "send_email",
                    "args": {"query": text},
                    "mode": "queue"
                }
            else:
                import re as _re
                from backend.core.session_state import get_state as _get_state
                # ── Topic extraction ──
                # Strip preposition-delimited topic first (most specific)
                topic = ""
                if "about" in user_clean:
                    topic = text.split("about", 1)[-1].strip(" .?!")
                elif "regarding" in user_clean:
                    topic = text.split("regarding", 1)[-1].strip(" .?!")
                elif "for" in user_clean:
                    topic = text.split("for", 1)[-1].strip(" .?!")
                else:
                    # No preposition — strip all generic email-action words to isolate topic
                    # e.g. "draft any mail" → "", "draft a sick leave mail" → "sick leave"
                    action_words = r"\b(draft|write|create|compose|prepare|send|any|an?|the|email|mail|template|now|please|ok|okay|yes)\b"
                    topic = _re.sub(action_words, "", user_clean, flags=_re.IGNORECASE).strip()
                    # Restore original casing by matching back
                    if topic:
                        m = _re.search(_re.escape(topic), text, _re.IGNORECASE)
                        if m:
                            topic = m.group(0).strip()

                # Clean up residual punctuation
                topic = topic.strip(" .?!,")

                # ── Fallback: check state subject if topic is empty ──
                if not topic:
                    _state = _get_state(session_id)
                    _pre_subject = (_state.pending_email_subject or "").strip()
                    _has_subject = _pre_subject and _pre_subject not in ("Enter email subject", "Update from PILOT Voice OS", "")
                    if not _has_subject:
                        # Nothing to go on — ask the user what the email is about
                        _greeting = f"Hello {speaker_id}! " if is_verified else "Sure! "
                        print(f"⚡ [FRONT LLM INTERCEPT] Email command: no topic or subject — asking user for clarification")
                        return {
                            "action": "respond_now",
                            "preamble": f"{_greeting}What should the email be about? Please tell me the subject or topic, for example: 'sick leave', 'meeting reschedule', or 'project update'.",
                            "tool": None,
                            "args": {},
                            "mode": "queue"
                        }

                result = {
                    "action": "delegate",
                    "preamble": "On it! Drafting that email for you in the background. Let me compile the template.",
                    "tool": "write_email",
                    "args": {"query": topic},
                    "mode": "queue"
                }

            if is_verified:
                result["preamble"] = f"Hello {speaker_id}! " + result["preamble"]
            else:
                result["preamble"] = "Hello there! " + result["preamble"]
            print(f"⚡ [FRONT LLM INTERCEPT] Email command delegated: '{result['tool']}' with topic: '{result['args'].get('query')}'")
            return result

        # ── Fast Meeting Summarizer intercept ──
        if any(kw in user_clean for kw in ("summarize the meeting", "summarize meeting", "send actions", "email the discussion", "email actions", "compile actions", "meeting minutes", "meeting summary")):
            result = {
                "action": "delegate",
                "preamble": "Preparing meeting minutes and action items. I will compile our conversation and send it right away.",
                "tool": "compile_minutes",
                "args": {"recipient_name": "Team", "recipient_email": "team@localhost"},
                "mode": "queue"
            }
            if is_verified:
                result["preamble"] = f"Hello {speaker_id}! " + result["preamble"]
            else:
                result["preamble"] = "Hello there! " + result["preamble"]
            print(f"⚡ [FRONT LLM INTERCEPT] Meeting Summarizer delegated: '{result['tool']}'")
            return result

        # Force SILENT listening for active meeting sessions - do not respond conversationally during meetings
        # This prevents PILOT from talking back on every normal utterance in the room, keeping it silent
        # until explicitly told to summarize/compile minutes.
        if session_id.startswith("meeting_"):
            return {
                "action": "ignore",
                "preamble": None,
                "tool": None,
                "args": {},
                "mode": "queue"
            }

        # ── Fast Flight / Travel command intercept (To ensure local models like Llama 3.2 do not misclassify flight tools) ──
        # Exclude questions about policies, baggage, cancellations, refunds, upgrades, check-in, or password reset to let them route to kb_search/FAQ!
        is_kb_query = any(kw in user_clean for kw in ["policy", "cancellation", "cancel", "refund", "baggage", "luggage", "allowance", "check-in", "check in", "upgrade", "password", "reset"])
        if not is_kb_query and ("flight" in user_clean or "flights" in user_clean or "book" in user_clean or "travel" in user_clean):
            # Check if it's a booking action
            if "book" in user_clean and not any(kw in user_clean for kw in ["search", "find", "show", "get"]):
                result = {
                    "action": "delegate",
                    "preamble": "On it! Booking that flight for you.",
                    "tool": "flight_book",
                    "args": {"query": text},
                    "mode": "queue"
                }
            else:
                result = {
                    "action": "delegate",
                    "preamble": "Checking that travel information for you!",
                    "tool": "flight_search",
                    "args": {"query": text},
                    "mode": "queue"
                }
            if is_verified:
                result["preamble"] = f"Hello {speaker_id}! " + result["preamble"]
            else:
                result["preamble"] = "Hello there! " + result["preamble"]
            print(f"⚡ [FRONT LLM INTERCEPT] Flight command delegated: '{result['tool']}'")
            return result

        # ── LLM CLASSIFICATION PROVIDER ROUTING ──
        provider = settings.FRONT_LLM_PROVIDER.lower() if hasattr(settings, "FRONT_LLM_PROVIDER") else "groq"
        
        # 1. OLLAMA LOCAL PROVIDER (Primary match to Capstone_project1_2_apna_vala)
        if provider == "ollama":
            import httpx
            url = f"{settings.OLLAMA_BASE_URL.rstrip('/')}/api/chat"
            ctx_str = "\n".join(f"{c.get('speaker','?')}: {c.get('text','')}" for c in context[-5:])
            prompt = (
                f"Context of conversation:\n{ctx_str}\n\n"
                f"Speaker Identity: {speaker_id} (Role: {role})\n"
                f"Last spoken utterance: \"{text}\"\n\n"
                f"Match user commands explicitly. Format output strictly as JSON.\n"
                f"JSON schema requirements: {SYSTEM_PROMPT}"
            )
            
            # Setup list of preferred models with priority: qwen2.5:7b -> qwen3.5:2b -> fallback
            preferred_models = [settings.OLLAMA_MODEL, "qwen2.5:7b", "qwen3.5:2b" ,"qwen3.5:3b", "llama3.2:latest"]
            # Filter duplicates while maintaining order
            models_to_try = []
            for m in preferred_models:
                if m and m not in models_to_try:
                    models_to_try.append(m)
                    
            for idx, active_model in enumerate(models_to_try):
                payload = {
                    "model": active_model,
                    "stream": False,
                    "messages": [
                        {"role": "system", "content": SYSTEM_PROMPT},
                        {"role": "user", "content": prompt},
                    ],
                    "options": {
                        "temperature": 0.0
                    },
                    "format": "json"
                }
                try:
                    # Increased timeout to 120s to allow heavy local 8B models (Qwen) to complete inference without timing out
                    async with httpx.AsyncClient(timeout=120.0) as client:
                        resp = await client.post(url, json=payload)
                        if resp.status_code == 200:
                            result_data = resp.json()
                            raw_content = result_data.get("message", {}).get("content", "").strip()
                            # Extract JSON safely
                            json_match = re.search(r"\{.*\}", raw_content, re.DOTALL)
                            if json_match:
                                result = json.loads(json_match.group(0))
                            else:
                                result = json.loads(raw_content)
                                
                            result = self._fill_args(result, text)
                            if is_verified:
                                if result.get("preamble"):
                                    result["preamble"] = f"Hello {speaker_id}! " + result["preamble"]
                            else:
                                if result.get("preamble"):
                                    result["preamble"] = "Hello there! " + result["preamble"]
                            print(f"✅ [FRONT LLM SUCCESS] Ollama ({active_model}) routed successfully! Action: '{result.get('action')}' | Preamble: \"{result.get('preamble')}\" | Tool: '{result.get('tool')}'")
                            return result
                except Exception as e:
                    print(f"⚠️ [FRONT LLM WARNING] Ollama model '{active_model}' failed/not found: {e}. Trying next available fallback model.")
                    logger.warning(f"Ollama FrontLLM model '{active_model}' failed: {e}")
                    # If this is the last model and it failed, let the exception cascade to the outer fallback
                    if idx == len(models_to_try) - 1:
                        logger.warning("All Ollama models failed, cascading to local keyword matching.")

        # Keyword fallback (Enforced strictly for local-only execution, bypassing OpenAI/Groq)
        result = self._keyword_fallback(text)
        if is_verified:
            if result.get("preamble"):
                result["preamble"] = f"Hello {speaker_id}! " + result["preamble"]
        else:
            if result.get("preamble"):
                result["preamble"] = "Hello there! " + result["preamble"]
        
        print(f"ℹ️ [FRONT LLM KEYWORDS] Keyword matching routed action: '{result.get('action')}' | Preamble: \"{result.get('preamble')}\"")
        # Ensure that if it is a general question and has no tool associated, we do NOT ignore/cut-off.
        # This will forward the classification decision to delegate/answer cleanly.
        return result

    def _fill_args(self, result: dict, text: str) -> dict:
        """Fill in missing args from the original text."""
        tool = result.get("tool")
        args = result.get("args", {})
        if tool in ("kb_search", "ppt_qa", "database_query", "write_file", "write_email", "system_check", "complex_calculation", "flight_search", "general_qa") and not args.get("query"):
            args["query"] = text

        if tool == "ppt_jump_to_title" and not args.get("query"):
            args["query"] = text
        result["args"] = args
        return result

    def _keyword_fallback(self, text: str) -> dict:
        t = text.lower().strip()
        if len(t) < 3:
            return {"action":"ignore","preamble":None,"tool":None,"args":{},"mode":"queue"}

        # Slide Q&A / Summarize check
        is_summarize = False
        if any(kw in t for kw in ("summarize", "summarise", "summary")):
            if any(ref in t for ref in ("ppt", "presentation", "slides", "powerpoint")):
                if not re.search(r"slide\s+\d+", t) and not any(f in t for f in ("first slide", "last slide", "current slide", "this slide")):
                    is_summarize = True

        if is_summarize:
            return {"action":"delegate","preamble":"On it! Summarizing the entire presentation deck for you.","tool":"ppt_summarize","args":{},"mode":"queue"}

        if ("slide" in t or "presentation" in t or "powerpoint" in t) and any(q in t for q in ("explain", "describe", "tell", "read", "show", "summarize", "about", "content", "what is on")):
            return {"action":"delegate","preamble":"Let me analyze the slides for you!",
                    "tool":"ppt_qa","args":{"query":text},
                    "mode":"queue"}

        # Slide delete check
        if any(q in t for q in ("delete slide", "remove slide", "delete this slide", "remove this slide")):
            return {"action":"delegate","preamble":"Deleting the current slide now.","tool":"ppt_delete_slide","args":{},"mode":"queue"}

        # Meeting minutes summaries fallback
        if any(kw in t for kw in ("summarize the meeting", "summarize meeting", "send actions", "email the discussion", "email actions", "compile actions", "meeting minutes", "meeting summary")):
            return {"action":"delegate","preamble":"Preparing meeting minutes and action items. I will compile our conversation and send it right away.",
                    "tool":"compile_minutes",
                    "args":{"recipient_name": "Team", "recipient_email": "team@localhost"},
                    "mode":"queue"}

        # Slide number: "go to slide 42" / "slide forty two"
        m = re.search(r'\b(?:go to |open |jump to |slide )?slide[s]?\s+(\d+)\b', t)
        if m or re.search(r'\bslide\s+\d+\b', t):
            num = int(re.search(r'\d+', t).group())
            return {"action":"delegate","preamble":f"Going to slide {num}!",
                    "tool":"ppt_jump_to_title","args":{"query":text,"slide_number":num-1},
                    "mode":"queue"}

        # Explicit task interruption keywords
        if any(w in t for w in ["stop current task", "cancel background", "stop process", "abort task", "cancel task", "stop task"]):
            return {"action": "delegate", "preamble": "Cancelling ongoing background tasks!",
                    "tool": "cancel_task", "args": {}, "mode": "interrupt"}

        for keywords, response in _KEYWORDS:
            if any(k in t for k in keywords):
                r = response.copy()
                r["args"] = dict(response["args"])
                if r.get("tool") in ("kb_search", "ppt_qa", "database_query", "write_file", "write_email", "system_check", "complex_calculation", "flight_search"):
                    r["args"]["query"] = text

                return r

        # General knowledge question fallback — answer DIRECTLY inside the Front LLM to minimize latency!
        if len(t.split()) >= 3:
            return {"action":"respond_now",
                    "preamble":"Let me answer that directly for you! A conversational response will follow.",
                    "tool":None,"args":{},"mode":"queue"}
        return {"action":"ignore","preamble":None,"tool":None,"args":{},"mode":"queue"}


front_llm_provider = FrontLLMProvider()
