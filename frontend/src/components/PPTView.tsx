

/**
 * PPT Copilot — full view with:
 * - File upload (.pptx)
 * - Slide list with smooth navigation
 * - Voice "go to slide 42" support
 * - Agent activity panel
 */
import { useState, useRef, useEffect } from "react";
import { useAppStore } from "../store/SessionStore";

function useThemeColors() {
  const theme = useAppStore(s => s.theme);
  return theme === "dark"
    ? { bg:"#0F0F0F", surface:"#1A1A1A", border:"#2A2A2A", text1:"#F0F0F0", text2:"#AAA", text3:"#666", amber:"#F5A700", amberDark:"#D4900F", amberBg:"rgba(245,167,0,0.12)" }
    : { bg:"#F7F6F3", surface:"#FFFFFF", border:"#E5E2DA", text1:"#1A1A1A", text2:"#555", text3:"#888", amber:"#F5A700", amberDark:"#7C5E00", amberBg:"#FFF8E7" };
}

interface SlideShape { text:string; color:string; size:number; bold:boolean; left?:number; top?:number; width?:number; align?:string; }
interface SlideImage {
  path: string;
  left_in?: number;
  top_in?: number;
  width_in?: number;
  height_in?: number;
}

interface Slide {
  index:    number;
  title:    string;
  notes:    string;
  bullets?: string[];
  bg_color?:string;
  shapes?:  SlideShape[];
  img_b64?: string;   // ← inline PNG from instant renderer
  images?:  SlideImage[];
}

export function PPTCopilotView({ sessionId, isListening, agentStatus, onToggleMic }:
  { sessionId:string|null; isListening:boolean; agentStatus:string; onToggleMic:()=>void }) {
  const store  = useAppStore();
  const C      = useThemeColors();
  const token  = store.token;

  const [slides,      setSlides]      = useState<Slide[]>((store.pptSlides as Slide[]) || []);
  const [current,     setCurrent]     = useState(0);
  const [uploading,   setUploading]   = useState(false);
  const [fileName,    setFileName]    = useState(store.pptFileName || "");
  const [agentLog,    setAgentLog]    = useState<string[]>([]);
  const [thumbStart,  setThumbStart]  = useState(0);
  const [streamTotal, setStreamTotal] = useState(0);   // total slides expected
  const [streamDone,  setStreamDone]  = useState(false);
  const sseRef  = useRef<EventSource | null>(null);
  const slidesRef = useRef<Slide[]>([]); // mutable ref for SSE handler closure
  const THUMB_COUNT = 6;
  const fileRef = useRef<HTMLInputElement>(null);

  const [aiPrompt, setAiPrompt] = useState("");
  const [slideCount, setSlideCount] = useState(5);
  const [generating, setGenerating] = useState(false);
  const [showCreatorDrawer, setShowCreatorDrawer] = useState(false);

  const [activeTab, setActiveTab] = useState<"editor" | "copilot">("editor");
  const [editorTitle, setEditorTitle] = useState("");
  const [editorBullets, setEditorBullets] = useState<string[]>([]);
  const [editorNotes, setEditorNotes] = useState("");
  const [improvisePrompt, setImprovisePrompt] = useState("");
  const [improvising, setImprovising] = useState(false);
  const [saving, setSaving] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const [dictatingPrompt, setDictatingPrompt] = useState(false);
  const [listeningForVoiceGenerate, setListeningForVoiceGenerate] = useState(false);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  const toggleFullscreen = () => {
    if (!canvasRef.current) return;
    if (!document.fullscreenElement) {
      canvasRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(err => {
        console.error("Error entering fullscreen:", err);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      }).catch(err => {
        console.error("Error exiting fullscreen:", err);
      });
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    document.addEventListener("webkitfullscreenchange", handleFsChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFsChange);
      document.removeEventListener("webkitfullscreenchange", handleFsChange);
    };
  }, []);

  const startPromptDictation = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice recognition is not supported in this browser. Please try Google Chrome.");
      return;
    }
    try {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = "en-US";
      rec.onstart = () => setDictatingPrompt(true);
      rec.onresult = (event: any) => {
        const resultText = event.results[0][0].transcript;
        if (resultText) {
          setAiPrompt(prev => prev ? prev + " " + resultText : resultText);
        }
      };
      rec.onerror = (err: any) => {
        console.error("Dictation error:", err);
        setDictatingPrompt(false);
      };
      rec.onend = () => setDictatingPrompt(false);
      rec.start();
    } catch (e) {
      console.error("Failed to start speech recognition:", e);
      setDictatingPrompt(false);
    }
  };

  // Drag-to-resize Sidebar States & Handlers
  const [sidebarWidth, setSidebarWidth] = useState(340);
  const isResizingRef = useRef(false);
  const resizeHandlerRef = useRef<(e: MouseEvent) => void>(() => {});

  resizeHandlerRef.current = (e: MouseEvent) => {
    if (!isResizingRef.current || !containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const containerWidth = containerRect.width;

    // Calculate newWidth relative to the container's right edge instead of window.innerWidth
    const mouseX = e.clientX - containerRect.left;
    const newWidth = containerWidth - mouseX - 330;
    
    // Ensure the left Main Slide Area has a safe minimum width of 480px to fit thumbnails and navigation controls
    const maxSidebarWidth = containerWidth - 330 - 5 - 480;
    
    // Bounds: minimum 200px, maximum calculated width that preserves the left layout
    if (newWidth > 200 && newWidth < maxSidebarWidth) {
      setSidebarWidth(newWidth);
    }
  };

  const startResize = (e: React.MouseEvent) => {
    e.preventDefault();
    isResizingRef.current = true;

    const onMouseMove = (moveEvent: MouseEvent) => {
      resizeHandlerRef.current(moveEvent);
    };

    const onMouseUp = () => {
      isResizingRef.current = false;
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      document.body.style.cursor = "default";
      document.body.style.userSelect = "auto";
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };

  useEffect(() => {
    const slide = slides[current];
    if (slide) {
      setEditorTitle(slide.title || "");
      setEditorBullets(slide.bullets || []);
      setEditorNotes(slide.notes || "");
    } else {
      setEditorTitle("");
      setEditorBullets([]);
      setEditorNotes("");
    }
  }, [current, slides]);

  async function generateSlides(overridePrompt?: string) {
    const promptText = (overridePrompt || aiPrompt).trim();
    if (!promptText) { alert("Please enter a presentation topic"); return; }
    
    setGenerating(true);
    setAgentLog(l => [...l, `⏳ Contacting local LLM to generate slides on "${promptText}"...`]);
    const sid = sessionId || "session_default";

    try {
      const res = await fetch(`/api/v1/ppt/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          session_id: sid,
          prompt: promptText,
          slide_count: slideCount
        })
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }
      
      const data = await res.json();
      if (data.status === "ok") {
        setSlides(data.slides);
        store.setPptSlides(data.slides);
        setCurrent(0);
        setFileName(`AI: ${promptText}`);
        store.setPptFileName(`AI: ${promptText}`);
        setAgentLog(l => [...l, `✓ Successfully generated ${data.slide_count} slides on "${promptText}"`]);
        setShowCreatorDrawer(false);
        setAiPrompt("");
      }
    } catch (e) {
      console.error(e);
      setAgentLog(l => [...l, "✗ Failed to generate slides"]);
    } finally {
      setGenerating(false);
    }
  }

  const startVoiceGenerate = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice recognition is not supported in this browser. Please try Google Chrome.");
      return;
    }
    try {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = "en-US";
      rec.onstart = () => setListeningForVoiceGenerate(true);
      rec.onresult = (event: any) => {
        const resultText = event.results[0][0].transcript;
        if (resultText && resultText.trim()) {
          setAiPrompt(resultText);
          generateSlides(resultText);
        }
      };
      rec.onerror = (err: any) => {
        console.error("Voice generate error:", err);
        setListeningForVoiceGenerate(false);
      };
      rec.onend = () => setListeningForVoiceGenerate(false);
      rec.start();
    } catch (e) {
      console.error("Failed to start voice generation speech recognition:", e);
      setListeningForVoiceGenerate(false);
    }
  };

  // Keep track of latest slides and current state for event handlers to avoid stale closures
  const latestSlidesRef = useRef(slides);
  latestSlidesRef.current = slides;
  const latestCurrentRef = useRef(current);
  latestCurrentRef.current = current;

  // Keep thumbnail window centred on the active slide
  useEffect(() => {
    if (current < thumbStart) setThumbStart(current);
    else if (current >= thumbStart + THUMB_COUNT) setThumbStart(current - THUMB_COUNT + 1);
  }, [current]);

  // Listen for ppt_command events (navigation + voice-triggered delete)
  useEffect(() => {
    const handler = (e: CustomEvent) => {
      const { action, index } = e.detail;
      const curSlides = latestSlidesRef.current;
      const curCurrent = latestCurrentRef.current;

      if (action === "goto" && index !== undefined) {
        setCurrent(Math.max(0, Math.min(index, Math.max(curSlides.length-1, 0))));
        setAgentLog(l => [...l.slice(-9), `Navigated to slide ${index+1}`]);
      } else if (action === "next")   setCurrent(c => Math.min(c+1, Math.max(curSlides.length-1, 0)));
      else if (action === "prev")     setCurrent(c => Math.max(c-1, 0));
      else if (action === "first")    setCurrent(0);
      else if (action === "last")     setCurrent(Math.max(curSlides.length-1, 0));
      else if (action === "delete") {
        if (curSlides.length === 0) return;
        const updated = curSlides.filter((_, i) => i !== curCurrent);
        const reindexed = updated.map((s, i) => ({ ...s, index: i }));
        setSlides(reindexed);
        store.setPptSlides(reindexed);
        setCurrent(c => Math.min(c, Math.max(reindexed.length - 1, 0)));
        setAgentLog(l => [...l, `✓ Deleted slide ${curCurrent + 1}`]);
        setDeleteModal("hidden");
      } else if (action === "reload") {
        const newSlides = e.detail.slides || [];
        const name = e.detail.filename || "AI Generated Presentation";
        setSlides(newSlides);
        store.setPptSlides(newSlides);
        if (e.detail.index !== undefined) {
          setCurrent(e.detail.index);
        } else if (e.detail.preserveCurrent) {
          setCurrent(c => Math.min(c, Math.max(newSlides.length - 1, 0)));
        } else {
          setCurrent(0);
        }
        setFileName(name);
        store.setPptFileName(name);
        setAgentLog(l => [...l, `✓ Loaded ${newSlides.length} slides`]);
        setDeleteModal("hidden");
      }
    };
    window.addEventListener("ppt_command" as any, handler);
    return () => window.removeEventListener("ppt_command" as any, handler);
  }, []);

  // Show "Access Denied" modal when policy blocks ppt_delete_slide for non-admins
  useEffect(() => {
    const handler = (e: CustomEvent) => {
      if (e.detail?.tool === "ppt_delete_slide") setDeleteModal("denied");
    };
    window.addEventListener("tool_blocked" as any, handler);
    return () => window.removeEventListener("tool_blocked" as any, handler);
  }, []);

  async function handleNewBlankDeck() {
    if (sseRef.current) { sseRef.current.close(); sseRef.current = null; }

    setUploading(true);
    setStreamDone(true);
    setStreamTotal(1);
    setSlides([]);
    setCurrent(0);
    setFileName("New Presentation");
    store.setPptFileName("New Presentation");

    const sid = sessionId || "session_default";
    try {
      const resp = await fetch(`/api/v1/ppt/clear`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ session_id: sid })
      });
      const data = await resp.json();
      if (data.status === "ok" && data.slides) {
        setSlides(data.slides);
        store.setPptSlides(data.slides);
        setCurrent(0);
        setAgentLog(l => [...l, `✓ Started a new blank presentation deck`]);
      } else {
        alert("Failed to create new blank deck");
      }
    } catch (e) {
      console.error(e);
      alert("Error starting new presentation");
    } finally {
      setUploading(false);
    }
  }

  async function handleAddSlide() {
    const sid = sessionId || "session_default";
    setAgentLog(l => [...l, `⏳ Adding new slide…`]);
    try {
      const resp = await fetch(`/api/v1/ppt/add_slide`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ session_id: sid })
      });
      const data = await resp.json();
      if (data.status === "ok" && data.slides) {
        setSlides(data.slides);
        store.setPptSlides(data.slides);
        if (data.index !== undefined) {
          setCurrent(data.index);
        }
        setAgentLog(l => [...l, `✓ Added a new blank slide`]);
      } else {
        alert("Failed to add slide");
      }
    } catch (e) {
      console.error(e);
      alert("Error adding slide");
    }
  }

  async function handleSaveSlide() {
    const sid = sessionId || "session_default";
    setSaving(true);
    try {
      const resp = await fetch(`/api/v1/ppt/edit_slide`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          session_id: sid,
          slide_index: current,
          title: editorTitle,
          bullets: editorBullets,
          notes: editorNotes
        })
      });
      const data = await resp.json();
      if (data.status === "ok" && data.slides) {
        setSlides(data.slides);
        store.setPptSlides(data.slides);
        setAgentLog(l => [...l, `✓ Saved changes to slide ${current + 1}`]);
      } else {
        alert("Failed to save slide changes");
      }
    } catch (e) {
      console.error(e);
      alert("Error saving slide changes");
    } finally {
      setSaving(false);
    }
  }



  async function handleImprovise(promptText: string) {
    const p = promptText || improvisePrompt;
    if (!p.trim()) return;

    const sid = sessionId || "session_default";
    setImprovising(true);
    setAgentLog(l => [...l, `⏳ Agent is improvising slide ${current + 1}…`]);
    
    try {
      const resp = await fetch(`/api/v1/ppt/improvise_slide`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          session_id: sid,
          slide_index: current,
          prompt: p
        })
      });
      const data = await resp.json();
      if (data.status === "ok" && data.slides) {
        setSlides(data.slides);
        store.setPptSlides(data.slides);
        setImprovisePrompt("");
        setAgentLog(l => [...l, `✓ Dedicated slide agent successfully improvised slide ${current + 1}`]);
      } else {
        alert("Failed to improvise slide");
      }
    } catch (e) {
      console.error(e);
      alert("Error improvising slide");
    } finally {
      setImprovising(false);
    }
  }

  async function uploadFile(file: File) {
    if (!file.name.endsWith(".pptx")) { alert("Please upload a .pptx file"); return; }

    // Close any existing SSE connection
    if (sseRef.current) { sseRef.current.close(); sseRef.current = null; }

    setUploading(true);
    setStreamDone(false);
    setStreamTotal(0);
    setSlides([]);
    slidesRef.current = [];
    setCurrent(0);
    const name = file.name;
    setFileName(name);
    store.setPptFileName(name);

    const sid = sessionId || "session_default";

    try {
      // Step 1: POST the file (fast — just saves to disk, ~50ms)
      const fd = new FormData();
      fd.append("file", file);
      await fetch(`/api/v1/ppt/upload_prepare?session_id=${sid}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });

      // Step 2: Open SSE stream — slides arrive one-by-one as they render
      const es = new EventSource(
        `/api/v1/ppt/render_stream?session_id=${sid}&token=${token}`
      );
      sseRef.current = es;
      setUploading(false);

      es.onmessage = (e) => {
        const msg = JSON.parse(e.data);

        if (msg.type === "init") {
          setStreamTotal(msg.total);
          setAgentLog(l => [...l, `⏳ Rendering ${msg.total} slides…`]);

        } else if (msg.type === "slide") {
          const newSlide: Slide = {
            index:   msg.index,
            title:   msg.title,
            notes:   msg.notes,
            bullets: msg.bullets,
            img_b64: msg.img_b64,
          };
          // Splice into ref array (avoids stale closure on rapid updates)
          const updated = [...slidesRef.current];
          updated[msg.index] = newSlide;
          slidesRef.current = updated;
          setSlides([...updated]);
          // Show first slide immediately
          if (msg.index === 0) {
            setCurrent(0);
            setAgentLog(l => [...l, `✓ Slide 1 ready — streaming rest…`]);
          }

        } else if (msg.type === "done") {
          setStreamDone(true);
          store.setPptSlides(slidesRef.current);
          setAgentLog(l => [...l, `✓ All ${msg.total} slides rendered`]);
          es.close();
          sseRef.current = null;
        }
      };

      es.onerror = () => {
        setAgentLog(l => [...l, "✗ Stream error — falling back to metadata"]);
        setStreamDone(true);
        es.close();
        sseRef.current = null;
      };

    } catch (e) {
      setUploading(false);
      setAgentLog(l => [...l, "✗ Upload failed"]);
    }
  }

  function removePresentation() {
    if (sseRef.current) { sseRef.current.close(); sseRef.current = null; }
    setSlides([]);
    slidesRef.current = [];
    setFileName("");
    setAgentLog([]);
    setStreamDone(false);
    setStreamTotal(0);
    store.setPptSlides([]);
    store.setPptFileName("");
  }

  // Delete slide — admin only (Level 3 access)
  const [deleteModal, setDeleteModal] = useState<"hidden"|"denied"|"confirm">("hidden");

  function handleDeleteSlide() {
    if (slides.length === 0) return;
    const role = (store.user?.role || "").toLowerCase();
    if (role !== "admin") {
      setDeleteModal("denied");
      return;
    }
    setDeleteModal("confirm");
  }

  async function confirmDeleteSlide() {
    if (slides.length === 0) return;
    const sid = sessionId || "session_default";
    try {
      const resp = await fetch(`/api/v1/ppt/delete_slide`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          session_id: sid,
          slide_index: current
        })
      });
      const data = await resp.json();
      if (data.status === "ok" && data.slides) {
        setSlides(data.slides);
        store.setPptSlides(data.slides);
        setCurrent(data.index !== undefined ? data.index : Math.min(current, Math.max(data.slides.length - 1, 0)));
        setAgentLog(l => [...l, `✓ Deleted slide ${current + 1}`]);
      } else {
        alert("Failed to delete slide");
      }
    } catch (e) {
      console.error("Error deleting slide:", e);
      alert("Error deleting slide");
    } finally {
      setDeleteModal("hidden");
    }
  }

  const slideTitle = slides[current]?.title || `Slide ${current+1}`;
  const slideNotes = slides[current]?.notes || "";

  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", background:C.bg, overflow:"hidden" }}>
      {/* header */}
      <div style={{ display:"flex", alignItems:"center", gap:"1rem", padding:"0.75rem 1.5rem",
                    background:C.surface, borderBottom:`1.5px solid ${C.border}` }}>
        <div style={{ flex:1 }}>
          <h2 style={{ fontWeight:700, fontSize:"0.95rem", color:C.text1 }}>
            {fileName || "PPT Copilot"}
          </h2>
          <p style={{ fontSize:"0.72rem", color:C.text3 }}>
            {slides.length > 0 ? `${slides.length} slides · Slide ${current+1}: ${slideTitle}` : "Upload a .pptx file to begin"}
          </p>
        </div>

        {/* New Blank Deck button */}
        <button onClick={handleNewBlankDeck}
          style={{ padding:"0.45rem 1rem", borderRadius:8, background:"rgba(40, 55, 80, 0.04)",
                   border:`1.5px solid ${C.border}`, color:C.text2,
                   fontWeight:600, fontSize:"0.8rem", cursor:"pointer", display:"flex", alignItems:"center", gap:"0.3rem" }}>
          <span>📁</span> New Blank Deck
        </button>

        {/* upload button */}
        <button onClick={() => fileRef.current?.click()}
          style={{ padding:"0.45rem 1rem", borderRadius:8, background:C.amberBg,
                   border:`1.5px solid ${C.amber}`, color:C.amberDark,
                   fontWeight:600, fontSize:"0.8rem", cursor:"pointer" }}>
          {uploading ? "Uploading…" : !streamDone && streamTotal > 0
            ? `⚡ ${slides.filter(s=>s.img_b64).length}/${streamTotal}`
            : "📁 Upload .pptx"}
        </button>
        <input ref={fileRef} type="file" accept=".pptx" style={{ display:"none" }}
          onChange={e => { const f=e.target.files?.[0]; if(f) uploadFile(f); }}/>
        {/* AI slide generator button */}
        {slides.length > 0 && (
          <button onClick={() => setShowCreatorDrawer(true)}
            style={{ padding:"0.45rem 1rem", borderRadius:8, background:"rgba(245,167,0,0.08)",
                     border:`1.5px solid ${C.amber}`, color:C.amberDark,
                     fontWeight:600, fontSize:"0.8rem", cursor:"pointer", display:"flex", alignItems:"center", gap:"0.3rem" }}>
            <span>✨</span> AI Creator
          </button>
        )}
        {/* Remove button — only shown when slides are loaded */}
        {slides.length > 0 && (
          <button onClick={removePresentation}
            style={{ padding:"0.45rem 0.85rem", borderRadius:8,
                     background:"rgba(239,68,68,0.08)", border:"1.5px solid rgba(239,68,68,0.3)",
                     color:"#EF4444", fontWeight:600, fontSize:"0.8rem", cursor:"pointer" }}>
            ✕ Remove
          </button>
        )}

        {/* listening badge */}
        <div style={{ display:"flex", alignItems:"center", gap:"0.5rem",
                      padding:"0.35rem 0.85rem", background:"#F9F8F6",
                      borderRadius:20, border:`1.5px solid ${C.border}`,
                      fontSize:"0.78rem", fontWeight:700, color:C.text1 }}>
          <div style={{ display:"flex", alignItems:"flex-end", gap:"2px" }}>
            {[6,12,8,16,10,14,8].map((h,i)=>(
              <div key={i} style={{ width:3, height:isListening ? h : 3,
                                    background:C.amber, borderRadius:1,
                                    transition:"height 0.15s",
                                    transitionDelay:`${i*0.04}s` }}/>
            ))}
          </div>
          {isListening ? "LISTENING" : "OFFLINE"}
        </div>
      </div>

      <div ref={containerRef} style={{ display:"flex", flex:1, overflow:"hidden" }}>
        {/* Main slide area */}
        <div style={{ flex:1, minWidth:0, display:"flex", flexDirection:"column" }}>
          {/* Slide canvas */}
          <div ref={canvasRef} style={{ flex:1, background: isFullscreen ? "#000" : "#fafafaff", display:"flex",
                        alignItems:"center", justifyContent:"center",
                        position:"relative", overflow:"hidden" }}>

            {/* ── Fullscreen Mic Button Overlay ── */}
            {isFullscreen && (
              <button
                onClick={onToggleMic}
                style={{
                  position: "absolute",
                  top: "24px",
                  right: "24px",
                  width: "56px",
                  height: "56px",
                  borderRadius: "50%",
                  background: isListening ? "#F5A700" : "rgba(255, 255, 255, 0.95)",
                  color: isListening ? "#000" : "#333",
                  border: "none",
                  cursor: "pointer",
                  zIndex: 200,
                  fontSize: "1.45rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: isListening ? `0 0 0 10px rgba(245, 167, 0, 0.35)` : "0 4px 16px rgba(0,0,0,0.3)",
                  transition: "all 0.25s"
                }}
                title={isListening ? "Mute Microphone" : "Unmute Microphone"}
              >
                {isListening ? "⏹" : "🎤"}
              </button>
            )}

            {/* ── YouTube Style Fullscreen Toggle Button (Diagonal Arrows) ── */}
            {slides.length > 0 && (
              <button
                onClick={toggleFullscreen}
                style={{
                  position: "absolute",
                  bottom: "16px",
                  right: "16px",
                  zIndex: 100,
                  background: "rgba(0, 0, 0, 0.65)",
                  border: "none",
                  borderRadius: "6px",
                  width: "38px",
                  height: "38px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "#FFF",
                  fontSize: "1.2rem",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                  transition: "all 0.2s"
                }}
                title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(0, 0, 0, 0.85)"}
                onMouseLeave={e => e.currentTarget.style.background = "rgba(0, 0, 0, 0.65)"}
              >
                {isFullscreen ? "⤣" : "⤢"}
              </button>
            )}

            {/* ── Upload / streaming progress bar ── */}
            {(uploading || (!streamDone && streamTotal > 0)) && (
              <div style={{ position:"absolute", top:0, left:0, right:0, zIndex:20,
                            height:3, background:"rgba(245,167,0,0.15)" }}>
                <div style={{
                  height:"100%",
                  background:"#F5A700",
                  borderRadius:"0 2px 2px 0",
                  transition:"width 0.3s ease",
                  width: uploading
                    ? "12%"
                    : `${Math.round((slides.filter(s => s.img_b64).length / Math.max(streamTotal,1)) * 100)}%`,
                }}/>
              </div>
            )}

            {slides.length === 0 ? (
              /* ── Playground: Upload or AI Create ── */
              <div style={{ display:"flex", gap:"2rem", width:"90%", maxWidth:900, height:"75%", maxHeight:450, padding:"1rem" }}>
                <style>{`
                  @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                  }
                `}</style>
                {/* Left Card: Upload .pptx */}
                <div onDragOver={e=>e.preventDefault()}
                  onDrop={e=>{e.preventDefault();const f=e.dataTransfer.files[0];if(f)uploadFile(f);}}
                  onClick={() => fileRef.current?.click()}
                  style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
                           background:C.surface, border:`2px  ${C.border}`, borderRadius:20, cursor:"pointer",
                           transition:"all 0.25s", boxShadow:"0 8px 32px rgba(0,0,0,0.2)", textAlign:"center", padding:"2rem" }}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor=C.amber;e.currentTarget.style.transform="scale(1.01)"}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.transform="scale(1)"}}>
                  <div style={{ width:70, height:70, borderRadius:16, background:C.amberBg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"2rem", marginBottom:"1.5rem" }}>📁</div>
                  <h3 style={{ color:C.text1, fontSize:"1.1rem", fontWeight:700, marginBottom:"0.5rem" }}>Upload Presentation</h3>
                  <p style={{ color:C.text3, fontSize:"0.8rem", lineHeight:1.5 }}>
                    Drag & drop your `.pptx` file here or click to browse.
                  </p>
                </div>

                {/* Right Card: AI Slide Creator */}
                <div style={{ flex:1, display:"flex", flexDirection:"column", background:C.surface, border:`1.5px solid ${C.border}`,
                             borderRadius:20, padding:"2rem", boxShadow:"0 8px 32px rgba(0,0,0,0.2)", cursor:"default" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:"0.75rem", marginBottom:"1rem" }}>
                    <span style={{ fontSize:"1.5rem" }}>✨</span>
                    <h3 style={{ color:C.text1, fontSize:"1.1rem", fontWeight:700 }}>AI Slide Creator</h3>
                  </div>
                  
                  <div style={{ position: "relative", display: "flex", flex: 1, flexDirection: "column" }}>
                    <textarea
                      placeholder="Describe your presentation topic (e.g. 'Explain the history of space flight in simple terms')"
                      value={aiPrompt}
                      onChange={e => setAiPrompt(e.target.value)}
                      style={{ flex: 1, width: "100%", padding: "0.75rem", paddingRight: "2.5rem", borderRadius: 10, background: C.bg, border: `1.5px solid ${C.border}`,
                               color: C.text1, fontSize: "0.82rem", resize: "none", outline: "none", transition: "border-color 0.2s", fontFamily: "inherit" }}
                      onFocus={e => e.currentTarget.style.borderColor = C.amber}
                      onBlur={e => e.currentTarget.style.borderColor = C.border}
                    />
                    <button
                      onClick={startPromptDictation}
                      style={{
                        position: "absolute",
                        right: 8,
                        bottom: 8,
                        width: 30,
                        height: 30,
                        borderRadius: "50%",
                        border: "none",
                        background: dictatingPrompt ? C.amber : "rgba(245,167,0,0.1)",
                        color: dictatingPrompt ? "#000" : C.amber,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.95rem",
                        boxShadow: dictatingPrompt ? `0 0 0 4px ${C.amberBg}` : "none",
                        transition: "all 0.2s",
                        zIndex: 5
                      }}
                      title="Dictate prompt by voice"
                    >
                      {dictatingPrompt ? "⏹" : "🎤"}
                    </button>
                  </div>

                  {/* Slide Count & Button Row */}
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginTop:"1rem", gap:"1rem" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:"0.5rem" }}>
                      <span style={{ fontSize:"0.72rem", color:C.text2, fontWeight:600 }}>Slides:</span>
                      <input
                        type="range" min="3" max="15"
                        value={slideCount}
                        onChange={e => setSlideCount(parseInt(e.target.value))}
                        style={{ width:70, accentColor:'#F5A700' }}
                      />
                      <span style={{ fontSize:"0.75rem", color:'#F5A700', fontWeight:700 }}>{slideCount}</span>
                    </div>

                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button
                        onClick={() => generateSlides()}
                        disabled={generating || listeningForVoiceGenerate}
                        style={{ padding:"0.55rem 1.25rem", borderRadius:10, background:"#F5A700", color:"#000", fontWeight:700,
                                 fontSize:"0.8rem", cursor:(generating || listeningForVoiceGenerate)?"default":"pointer", border:"none", display:"flex", alignItems:"center", gap:"0.5rem",
                                 boxShadow:`0 4px 12px ${C.amberBg}`, transition:"transform 0.2s" }}
                        onMouseEnter={e => {if(!generating && !listeningForVoiceGenerate) e.currentTarget.style.transform="scale(1.03)"}}
                        onMouseLeave={e => e.currentTarget.style.transform="scale(1)"}
                      >
                        {generating ? (
                          <>
                            <div className="spinner" style={{ width:12, height:12, borderRadius:"50%", border:"2px solid #000", borderTopColor:"transparent", animation:"spin 0.8s linear infinite" }} />
                            Generating...
                          </>
                        ) : "Generate"}
                      </button>

                      <button
                        onClick={startVoiceGenerate}
                        disabled={generating || listeningForVoiceGenerate}
                        style={{ padding:"0.55rem 1.25rem", borderRadius:10, 
                                 background: listeningForVoiceGenerate ? C.amber : "rgba(245,167,0,0.12)", 
                                 color: listeningForVoiceGenerate ? "#000" : C.amber, 
                                 fontWeight:700,
                                 fontSize:"0.8rem", cursor:(generating || listeningForVoiceGenerate)?"default":"pointer", 
                                 border: `1.5px solid ${C.amber}`, display:"flex", alignItems:"center", gap:"0.5rem",
                                 boxShadow:`0 4px 12px ${C.amberBg}`, transition:"all 0.2s" }}
                        onMouseEnter={e => {if(!generating && !listeningForVoiceGenerate) e.currentTarget.style.transform="scale(1.03)"}}
                        onMouseLeave={e => e.currentTarget.style.transform="scale(1)"}
                      >
                        {listeningForVoiceGenerate ? (
                          <>
                            <div className="spinner" style={{ width:12, height:12, borderRadius:"50%", border:"2px solid #000", borderTopColor:"transparent", animation:"spin 0.8s linear infinite" }} />
                            Listening...
                          </>
                        ) : "🎙️ Generate with Voice"}
                      </button>
                    </div>
                  </div>

                  {/* Suggestion Chips */}
                  <div style={{ marginTop:"1rem" }}>
                    <span style={{ fontSize:"0.65rem", color:C.text3, fontWeight:700, letterSpacing:"0.05em", display:"block", marginBottom:"0.5rem" }}>SUGGESTED TOPICS</span>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:"0.4rem" }}>
                      {["Quantum Computing", "History of AI", "Space Flight", "Healthy Eating"].map((topic, i) => (
                        <div key={i} onClick={() => setAiPrompt(`Create a slide deck explaining the topic: ${topic}`)}
                          style={{ fontSize:"0.68rem", color:C.text2, background:C.bg, border:`1px solid ${C.border}`,
                                   padding:"0.3rem 0.6rem", borderRadius:12, cursor:"pointer", transition:"all 0.15s" }}
                          onMouseEnter={e => {e.currentTarget.style.borderColor=C.amber; e.currentTarget.style.background=C.amberBg}}
                          onMouseLeave={e => {e.currentTarget.style.borderColor=C.border; e.currentTarget.style.background=C.bg}}>
                          {topic}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : slides[current]?.img_b64 ? (
              /* ── Instant PNG image (primary path) ── */
              <div style={{ width:"100%", height:"100%", display:"flex",
                            alignItems:"center", justifyContent:"center", position:"relative" }}>
                <style>{`
                  @keyframes slideFadeIn {
                    from { opacity: 0; transform: scale(0.985); }
                    to { opacity: 1; transform: scale(1); }
                  }
                `}</style>
                <img
                  key={current}
                  src={`data:image/png;base64,${slides[current].img_b64}`}
                  alt={slides[current].title}
                  style={{ maxWidth:"100%", maxHeight:"100%",
                           objectFit:"contain", borderRadius:4,
                           boxShadow:"0 8px 48px rgba(0,0,0,0.7)",
                           display:"block",
                           animation:"slideFadeIn 0.28s cubic-bezier(0.16, 1, 0.3, 1) forwards" }}
                />
                {/* Slide counter overlay */}
                <div style={{ position:"absolute", top:10, right:14, zIndex:10,
                              padding:"0.15rem 0.55rem", borderRadius:4,
                              background:"rgba(0,0,0,0.55)",
                              fontSize:"0.58rem", color:"#F5A700", fontWeight:700,
                              letterSpacing:"0.08em", backdropFilter:"blur(4px)" }}>
                  {current+1} / {streamTotal || slides.length}
                </div>
                {/* Still streaming badge */}
                {!streamDone && (
                  <div style={{ position:"absolute", bottom:10, right:14, zIndex:10,
                                padding:"0.15rem 0.55rem", borderRadius:4,
                                background:"rgba(255, 255, 255, 0.18)", border:"1px solid rgba(255, 255, 255, 0.4)",
                                fontSize:"0.55rem", color:"#f9f8f6ff", fontWeight:600 }}>
                    {/* ⚡ {slides.filter(s=>s.img_b64).length}/{streamTotal} rendered */}
                  </div>
                )}
              </div>
            ) : (
              /* ── Skeleton while this specific slide is still rendering ── */
              <div style={{ width:"90%", maxWidth:720, aspectRatio:"16/9",
                            background:"#1a1a2e", borderRadius:6,
                            border:"2px solid rgba(255,255,255,0.06)",
                            boxShadow:"0 8px 48px rgba(0,0,0,0.7)",
                            display:"flex", alignItems:"center", justifyContent:"center" }}>
                <div style={{ textAlign:"center" }}>
                  <div style={{ fontSize:"1.4rem", marginBottom:"0.5rem" }}>⏳</div>
                  <div style={{ fontSize:"0.75rem", color:"#666" }}>Rendering slide {current+1}…</div>
                </div>
              </div>
            )}
          </div>

          {/* Thumbnail slider — shows THUMB_COUNT at a time */}
          {slides.length > 0 && (
            <div style={{ display:"flex", alignItems:"center", gap:"0.35rem",
                          padding:"0.5rem 0.75rem", background:"#111",
                          borderTop:"1px solid #222", height:72, flexShrink:0 }}>
              {/* Prev arrow */}
              <button onClick={() => setThumbStart(t => Math.max(0, t - 1))}
                disabled={thumbStart === 0}
                style={{ flexShrink:0, width:26, height:40, borderRadius:5,
                         border:"1px solid #333", background:"#1A1A1A",
                         color: thumbStart === 0 ? "#444" : "#AAA",
                         cursor: thumbStart === 0 ? "default" : "pointer",
                         fontSize:"0.75rem", display:"flex", alignItems:"center", justifyContent:"center" }}>
                ‹
              </button>

              {/* Visible thumbnails */}
              <div style={{ flex:1, display:"flex", gap:"0.35rem", overflow:"hidden" }}>
                {slides.slice(thumbStart, thumbStart + THUMB_COUNT).map((s, rel) => {
                  const i = thumbStart + rel;
                  return (
                    <div key={i} onClick={() => {
                      setCurrent(i);
                      fetch(`/api/v1/ppt/jump`, {
                        method:"POST",
                        headers:{"Content-Type":"application/json", Authorization:`Bearer ${token}`},
                        body: JSON.stringify({session_id: sessionId||"session_default", query: `slide ${i+1}`})
                      }).catch(()=>{});
                    }}
                      style={{ flex:1, minWidth:0, height:52, borderRadius:5,
                               background: i===current ? C.amberBg : "#1a1a2e",
                               border:`2px solid ${i===current ? C.amber : "#333"}`,
                               cursor:"pointer", padding:0,
                               transition:"all 0.18s", overflow:"hidden", flexShrink:0,
                               position:"relative" }}>
                      {s.img_b64 ? (
                        <img src={`data:image/png;base64,${s.img_b64}`}
                          style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }}
                          alt={s.title} />
                      ) : (
                        <div style={{ padding:"0.28rem 0.4rem" }}>
                          <div style={{ fontSize:"0.52rem", color:i===current?C.amberDark:"rgba(255,255,255,0.45)", fontWeight:700 }}>{i+1}</div>
                          <div style={{ fontSize:"0.58rem", color:i===current?C.amberDark:"rgba(255,255,255,0.55)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{s.title}</div>
                        </div>
                      )}
                      {i===current && (
                        <div style={{ position:"absolute", inset:0, border:`2px solid ${C.amber}`, borderRadius:4, pointerEvents:"none" }}/>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Add Slide Button */}
              <button onClick={handleAddSlide}
                style={{ flexShrink:0, width:52, height:52, borderRadius:5,
                         border:"2px dashed #444", background:"#151515",
                         color:"#AAA", cursor:"pointer", fontSize:"1.2rem",
                         display:"flex", alignItems:"center", justifyContent:"center",
                         transition:"all 0.18s" }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.amber; e.currentTarget.style.color = C.amber; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#444"; e.currentTarget.style.color = "#AAA"; }}
                title="Add a new blank slide">
                +
              </button>

              {/* Next arrow */}
              <button onClick={() => setThumbStart(t => Math.min(slides.length - THUMB_COUNT, t + 1))}
                disabled={thumbStart + THUMB_COUNT >= slides.length}
                style={{ flexShrink:0, width:26, height:40, borderRadius:5,
                         border:"1px solid #333", background:"#1A1A1A",
                         color: thumbStart + THUMB_COUNT >= slides.length ? "#444" : "#AAA",
                         cursor: thumbStart + THUMB_COUNT >= slides.length ? "default" : "pointer",
                         fontSize:"0.75rem", display:"flex", alignItems:"center", justifyContent:"center" }}>
                ›
              </button>

              {/* Slide counter */}
              <div style={{ flexShrink:0, fontSize:"0.65rem", color:"#555",
                            fontWeight:600, minWidth:36, textAlign:"right" }}>
                {current+1}/{slides.length}
              </div>
            </div>
          )}

          {/* Nav controls + mic */}
          <div style={{ display:"flex", gap:"0.5rem", padding:"0.65rem 1rem",
                        background:C.surface, borderTop:`1.5px solid ${C.border}`,
                        alignItems:"center" }}>
            {["first","prev","next","last"].map(d=>(
              <button key={d} onClick={()=>{
                const actions: Record<string,()=>void> = {
                  first:()=>setCurrent(0), last:()=>setCurrent(Math.max(slides.length-1,0)),
                  prev:()=>setCurrent(c=>Math.max(c-1,0)), next:()=>setCurrent(c=>Math.min(c+1,Math.max(slides.length-1,0)))
                };
                actions[d]?.();
                fetch(`/api/v1/ppt/navigate`,{
                  method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${token}`},
                  body:JSON.stringify({session_id:sessionId||"session_default",direction:d})
                }).catch(()=>{});
              }}
                style={{ padding:"0.4rem 0.85rem", borderRadius:6,
                         border:`1.5px solid ${C.border}`, background:"transparent",
                         color:C.text2, cursor:"pointer", fontSize:"0.78rem" }}>
                {d}
              </button>
            ))}
            <div style={{ flex:1 }}/>
            {/* Delete slide — admin only */}
            {slides.length > 0 && (
              <button onClick={handleDeleteSlide}
                style={{ padding:"0.4rem 0.85rem", borderRadius:6,
                         background:"rgba(239,68,68,0.08)", border:"1.5px solid rgba(239,68,68,0.25)",
                         color:"#EF4444", cursor:"pointer", fontSize:"0.78rem", fontWeight:600 }}>
                🗑 Delete Slide
              </button>
            )}
            <button onClick={onToggleMic}
              style={{ width:40, height:40, borderRadius:"50%",
                       background:isListening?C.amber:"#F0EDE8", border:"none",
                       fontSize:"1rem", cursor:"pointer",
                       boxShadow:isListening?`0 0 0 6px rgba(245,167,0,0.2)`:"none",
                       transition:"all 0.25s" }}>
              {isListening?"⏹":"🎤"}
            </button>
            <span style={{ fontSize:"0.7rem", color:C.text3 }}>Say "Go to slide 42"</span>
          </div>
        </div>

        {/* Drag Resizer Divider Handle */}
        {slides.length > 0 && (
          <div
            onMouseDown={startResize}
            style={{
              width: 5,
              cursor: "col-resize",
              background: "transparent",
              zIndex: 30,
              alignSelf: "stretch",
              position: "relative",
              flexShrink: 0,
              transition: "background 0.15s, border-color 0.15s",
              borderLeft: `1.5px solid ${C.border}`,
            }}
            onMouseEnter={e => e.currentTarget.style.background = C.amber}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          />
        )}

        {/* Slide Editor & Copilot Side Panel */}
        {slides.length > 0 && (
          <div style={{
            width: sidebarWidth,
            background: C.surface,
            display: "flex",
            flexDirection: "column",
            height: "100%",
            flexShrink: 0,
            overflow: "hidden"
          }}>
            {/* Sidebar Tabs */}
            <div style={{ display: "flex", borderBottom: `1.5px solid ${C.border}`, background: "#16161c" }}>
              <button
                onClick={() => setActiveTab("editor")}
                style={{
                  flex: 1,
                  padding: "0.85rem",
                  background: activeTab === "editor" ? "#F5A700": C.bg,
                  color: activeTab === "editor" ? "white": C.amber,
                  fontWeight: 700,
                  fontSize: "0.78rem",
                  border: "none",
                  borderBottom: activeTab === "editor" ? `2.5px solid ${C.amber}` : "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.35rem",
                  transition: "all 0.18s"
                }}
              >
                <span></span> Editor
              </button>
              <button
                onClick={() => setActiveTab("copilot")}
                style={{
                  flex: 1,
                  padding: "0.85rem",
                  background: activeTab === "copilot" ?  "#F5A700":C.bg,
                  color: activeTab === "copilot" ? 'white' : C.amber,
                  fontWeight: 700,
                  fontSize: "0.78rem",
                  border: "none",
                  borderBottom: activeTab === "copilot" ? `2.5px solid ${C.amber}` : "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.35rem",
                  transition: "all 0.18s"
                }}
              >
                 Slide Copilot
              </button>
            </div>

            {/* Tab Contents */}
            <div style={{ flex: 1, overflowY: "auto", padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {activeTab === "editor" ? (
                /* ── EDITOR TAB ── */
                <>
                  {/* Slide Title */}
                  <div>
                    <label style={{ display: "block", fontSize: "0.68rem", color: C.text3, fontWeight: 700, letterSpacing: "0.05em", marginBottom: "0.4rem" }}>SLIDE TITLE</label>
                    <input
                      type="text"
                      value={editorTitle}
                      onChange={e => setEditorTitle(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "0.6rem 0.75rem",
                        background: C.bg,
                        border: `1px solid ${C.border}`,
                        borderRadius: 8,
                        color: C.text1,
                        fontSize: "0.80rem",
                        outline: "none"
                      }}
                      onFocus={e => e.currentTarget.style.borderColor = C.amber}
                      onBlur={e => e.currentTarget.style.borderColor = C.border}
                    />
                  </div>

                  {/* Bullet Points Editor */}
                  <div>
                    <label style={{ display: "block", fontSize: "0.68rem", color: C.text3, fontWeight: 700, letterSpacing: "0.05em", marginBottom: "0.4rem" }}>BULLET POINTS</label>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      {/* Scrollable list of bullet inputs */}
                      <div style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.5rem",
                        maxHeight: "220px",
                        overflowY: "auto",
                        paddingRight: "6px"
                      }}>
                        {editorBullets.map((bullet, bIdx) => (
                          <div key={bIdx} style={{ display: "flex", gap: "0.35rem", alignItems: "center" }}>
                            <input
                              type="text"
                              value={bullet}
                              onChange={e => {
                                const newBullets = [...editorBullets];
                                newBullets[bIdx] = e.target.value;
                                setEditorBullets(newBullets);
                              }}
                              style={{
                                flex: 1,
                                padding: "0.5rem 0.6rem",
                                background: C.bg,
                                border: `1px solid ${C.border}`,
                                borderRadius: 6,
                                color: C.text1,
                                fontSize: "0.78rem",
                                outline: "none"
                              }}
                            />
                            <button
                              onClick={() => {
                                const newBullets = editorBullets.filter((_, i) => i !== bIdx);
                                setEditorBullets(newBullets);
                              }}
                              style={{
                                background: "transparent",
                                border: "none",
                                color: "#ef4444",
                                fontSize: "0.85rem",
                                cursor: "pointer",
                                padding: "0.2rem"
                              }}
                              title="Delete bullet"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                      
                      {/* Add Bullet Button */}
                      <button
                        onClick={() => setEditorBullets([...editorBullets, ""])}
                        style={{
                          alignSelf: "flex-start",
                          background: "transparent",
                          border: "none",
                          color: C.amberDark,
                          fontSize: "0.72rem",
                          fontWeight: 700,
                          cursor: "pointer",
                          padding: "0.2rem 0.4rem"
                        }}
                      >
                        + Add Bullet Point
                      </button>
                    </div>
                  </div>

                  {/* Speaker Notes */}
                  <div>
                    <label style={{ display: "block", fontSize: "0.68rem", color: C.text3, fontWeight: 700, letterSpacing: "0.05em", marginBottom: "0.4rem" }}>PRESENTER NOTES</label>
                    <textarea
                      value={editorNotes}
                      onChange={e => setEditorNotes(e.target.value)}
                      rows={4}
                      style={{
                        width: "100%",
                        padding: "0.6rem 0.75rem",
                        background: C.bg,
                        border: `1px solid ${C.border}`,
                        borderRadius: 8,
                        color: C.text1,
                        fontSize: "0.8rem",
                        resize: "none",
                        outline: "none"
                      }}
                    />
                  </div>

                  {/* Slide Image Upload */}
                  <div>
                    <label style={{ display: "block", fontSize: "0.68rem", color: C.text3, fontWeight: 700, letterSpacing: "0.05em", marginBottom: "0.4rem" }}>SLIDE IMAGE</label>
                    {slides[current]?.images && slides[current].images!.length > 0 ? (
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: C.bg, padding: "0.5rem", borderRadius: 8, border: `1px solid ${C.border}` }}>
                        <span style={{ fontSize: "1.2rem" }}>🖼️</span>
                        <span style={{ flex: 1, fontSize: "0.74rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {slides[current].images![0].path.split("/").pop()}
                        </span>
                        <button
                          onClick={async () => {
                            const sid = sessionId || "session_default";
                            try {
                              const resp = await fetch(`/api/v1/ppt/edit_slide`, {
                                method: "POST",
                                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                                body: JSON.stringify({
                                  session_id: sid,
                                  slide_index: current,
                                  title: editorTitle,
                                  bullets: editorBullets,
                                  notes: editorNotes,
                                  images: []
                                })
                              });
                              const data = await resp.json();
                              if (data.status === "ok" && data.slides) {
                                setSlides(data.slides);
                                store.setPptSlides(data.slides);
                                setAgentLog(l => [...l, `✓ Removed image from slide ${current + 1}`]);
                              }
                            } catch(err) { console.error(err); }
                          }}
                          style={{ background: "transparent", border: "none", color: "#ef4444", fontSize: "0.85rem", cursor: "pointer" }}
                          title="Remove Image"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          id={`slide-img-upload-${current}`}
                          style={{ display: "none" }}
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const sid = sessionId || "session_default";
                            const fd = new FormData();
                            fd.append("file", file);
                            setAgentLog(l => [...l, `⏳ Uploading image for slide ${current + 1}...`]);
                            try {
                              const resp = await fetch(`/api/v1/ppt/upload_image?session_id=${sid}&slide_index=${current}`, {
                                method: "POST",
                                headers: { Authorization: `Bearer ${token}` },
                                body: fd
                              });
                              const data = await resp.json();
                              if (data.status === "ok" && data.slides) {
                                setSlides(data.slides);
                                store.setPptSlides(data.slides);
                                setAgentLog(l => [...l, `✓ Added image to slide ${current + 1}`]);
                              }
                            } catch(err) { console.error(err); }
                          }}
                        />
                        <label
                          htmlFor={`slide-img-upload-${current}`}
                          style={{
                            display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem",
                            padding: "0.55rem", borderRadius: 8, border: `1.5px dashed ${C.border}`,
                            color: C.text2, fontSize: "0.76rem", cursor: "pointer", fontWeight: 600,
                            background: "transparent", transition: "all 0.15s"
                          }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = C.amber; e.currentTarget.style.color = C.amber; }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.text2; }}
                        >
                          <span>🖼️</span> Upload Slide Image
                        </label>
                      </div>
                    )}
                  </div>

                  {/* Action buttons (Save) */}
                  <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
                    <button
                      onClick={handleSaveSlide}
                      disabled={saving}
                      style={{
                        width: "100%",
                        padding: "0.65rem",
                        borderRadius: 10,
                        background: C.amber,
                        color: "#000",
                        fontWeight: 700,
                        fontSize: "0.82rem",
                        border: "none",
                        cursor: saving ? "default" : "pointer",
                        boxShadow: `0 4px 12px ${C.amberBg}`,
                        transition: "all 0.18s",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "0.35rem"
                      }}
                    >
                      {saving ? "Saving..." : "Save Slide Changes"}
                    </button>
                  </div>
                </>
              ) : (
                /* ── COPILOT TAB ── */
                <>
                  {/* Improvise Chat Prompt */}
                  <div>
                    <label style={{ display: "block", fontSize: "0.68rem", color: C.text3, fontWeight: 700, letterSpacing: "0.05em", marginBottom: "0.4rem" }}>SLIDE OPTIMIZER AGENT</label>
                    <textarea
                      placeholder="Instruct the agent on how to improve this slide... (e.g., 'rewrite to sound more corporate', 'explain in simpler terms')"
                      value={improvisePrompt}
                      onChange={e => setImprovisePrompt(e.target.value)}
                      rows={4}
                      style={{
                        width: "100%",
                        padding: "0.65rem 0.75rem",
                        background: C.bg,
                        border: `1px solid ${C.border}`,
                        borderRadius: 8,
                        color: C.text1,
                        fontSize: "0.8rem",
                        resize: "none",
                        outline: "none"
                      }}
                      onFocus={e => e.currentTarget.style.borderColor = C.amber}
                      onBlur={e => e.currentTarget.style.borderColor = C.border}
                    />
                  </div>

                  {/* Improvise Button */}
                  <button
                    onClick={() => handleImprovise("")}
                    disabled={improvising || !improvisePrompt.trim()}
                    style={{
                      width: "100%",
                      padding: "0.65rem",
                      borderRadius: 8,
                      background: improvising || !improvisePrompt.trim() ? "#F5A700" : "#F5A700",
                      color: improvising || !improvisePrompt.trim() ? "#000" : "#000",
                      fontWeight: 700,
                      fontSize: "0.8rem",
                      border: "none",
                      cursor: improvising || !improvisePrompt.trim() ? "default" : "pointer",
                      boxShadow: improvising || !improvisePrompt.trim() ? "none" : `0 4px 12px ${C.amberBg}`,
                      transition: "all 0.18s",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.35rem"
                    }}
                  >
                    {improvising ? (
                      <>
                        <div className="spinner" style={{ width: 12, height: 12, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }} />
                        Agent is improvising...
                      </>
                    ) : "✨ Improvise Slide"}
                  </button>

                  {/* Suggestion Chips */}
                  <div>
                    <label style={{ display: "block", fontSize: "0.65rem", color: C.text3, fontWeight: 700, letterSpacing: "0.05em", marginBottom: "0.5rem" }}>QUICK IMPROVISATIONS</label>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                      {[
                        { text: "Simplify text & explanation", icon: "🧠" },
                        { text: "Make it sound more corporate & professional", icon: "💼" },
                        { text: "Add highly technical domain details", icon: "🔬" },
                        { text: "Rewrite to be more persuasive & sales-oriented", icon: "📈" },
                        { text: "Summarize outline into 3 key bullet points", icon: "📝" }
                      ].map((chip, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleImprovise(chip.text)}
                          disabled={improvising}
                          style={{
                            width: "100%",
                            textAlign: "left",
                            padding: "0.55rem 0.75rem",
                            borderRadius: 8,
                            background: C.bg,
                            border: `1.5px solid ${C.border}`,
                            color: C.text2,
                            fontSize: "0.74rem",
                            fontWeight: 600,
                            cursor: improvising ? "default" : "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            transition: "all 0.15s"
                          }}
                          onMouseEnter={e => { if (!improvising) { e.currentTarget.style.borderColor = C.amber; e.currentTarget.style.background = C.amberBg; } }}
                          onMouseLeave={e => { if (!improvising) { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = C.bg; } }}
                        >
                          <span>{chip.icon}</span> {chip.text}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Agent activity panel */}
        <div style={{ width:330, background:C.surface, borderLeft:`1.5px solid ${C.border}`,
                      padding:"1rem 1rem 3rem 1rem", overflowY:"auto", flexShrink:0, display:"flex",
                      flexDirection:"column", gap:"1rem" }}>
          {/* Status */}
          <div>
            <div style={{ fontWeight:700, fontSize:"0.82rem", color:C.text1, marginBottom:"0.6rem",
                          letterSpacing:"0.04em" }}>
              AGENT ACTIVITY
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:"0.4rem",
                          padding:"0.5rem 0.7rem", borderRadius:8,
                          background: isListening ? C.amberBg : "#F9F8F6",
                          border:`1.5px solid ${isListening ? C.amber : C.border}` }}>
              <div style={{ width:7, height:7, borderRadius:"50%", flexShrink:0,
                            background: isListening ? C.amber : C.border,
                            animation: isListening ? "pulse 1.2s infinite" : "none" }}/>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:"0.76rem", fontWeight:600, color:C.text1 }}>
                  {isListening ? "Listening" : "Idle"}
                </div>
                {isListening && (
                  <div style={{ fontSize:"0.66rem", color:C.text3, marginTop:"0.1rem" }}>{agentStatus}</div>
                )}
              </div>
            </div>
          </div>

          {/* Tool calls */}
          {(() => {
            const pptTools = store.toolCards.filter(c =>
              ["ppt_navigate","ppt_jump_to_title","ppt_summarize"].includes(c.tool)
            ).slice(-6).reverse();
            return pptTools.length > 0 ? (
              <div>
                <div style={{ fontSize:"0.68rem", fontWeight:700, color:C.text3,
                              letterSpacing:"0.07em", marginBottom:"0.4rem" }}>TOOL CALLS</div>
                {pptTools.map((c,i) => (
                  <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:"0.4rem",
                                        marginBottom:"0.45rem" }}>
                    <div style={{ width:14, height:14, borderRadius:"50%", flexShrink:0, marginTop:1,
                                  display:"flex", alignItems:"center", justifyContent:"center",
                                  fontSize:"0.45rem", fontWeight:700, color:"#fff",
                                  background: c.status==="ok" ? "#22C55E"
                                            : c.status==="running" ? C.amber : C.border }}>
                      {c.status==="ok" ? "✓" : c.status==="running" ? "●" : "○"}
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:"0.74rem", fontWeight:600, color:C.text1 }}>
                        {c.tool.replace("ppt_","").replace(/_/g," ")}
                      </div>
                      <div style={{ fontSize:"0.66rem", color: c.status==="running" ? C.amber : C.text3 }}>
                        {c.status==="running" ? "Running…"
                         : c.status==="ok" ? `Done · ${c.latency_ms ? c.latency_ms+"ms" : ""}` : "Pending"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : null;
          })()}

          {/* Nav log */}
          <div>
            <div style={{ fontSize:"0.68rem", fontWeight:700, color:C.text3,
                          letterSpacing:"0.07em", marginBottom:"0.4rem"}}>NAVIGATION LOG</div>
            {agentLog.length === 0
              ? <div style={{ fontSize:"0.72rem", color:C.text3 }}>No actions yet.</div>
              : agentLog.slice().reverse().map((l,i) => (
                  <div key={i} style={{ display:"flex", gap:"0.35rem", marginBottom:"0.4rem",
                                        alignItems:"flex-start" }}>
                    <span style={{ color:"#22C55E", flexShrink:0, fontSize:"0.72rem", marginTop:"0.05rem" }}>›</span>
                    <div style={{ fontSize:"0.72rem", lineHeight:1.45, color:C.text2 }}>{l}</div>
                  </div>
                ))
            }
          </div>

          {/* Quick Guide */}
          <div style={{
            marginTop: "1.25rem",
            background: "#FAF9F5",
            border: `1.5px solid ${C.border}`,
            borderRadius: 12,
            padding: "1.25rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.65rem",
            boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
            fontFamily: "Inter, sans-serif"
          }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 800, color: C.amberDark, letterSpacing: "0.05em", fontFamily: "Inter, sans-serif" }}>
              💡 PPT COPILOT SYSTEM GUIDE
            </span>
            <div style={{ fontSize: "0.78rem", color: C.text1, lineHeight: 1.55, display: "flex", flexDirection: "column", gap: "0.55rem", fontFamily: "Inter, sans-serif" }}>
              <div>• <strong>Slide Navigation:</strong> Speak "go to slide 5" or say "next slide" / "previous slide" to navigate through your presentation hands-free.</div>
              <div>• <strong>Slide Generation:</strong> Say "create a slide about X" or "generate slides on Y" to instantly add new, AI-structured slides to your deck.</div>
              <div>• <strong>Instant Summaries:</strong> Say "summarize this slide" to get an immediate verbal and visual overview of the slide's key points.</div>
              <div>• <strong>Presentation Edits:</strong> Use the sidebar outline panel to modify slide text, or drag the divider bar to resize your presentation workspace.</div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete slide modals */}
      {deleteModal !== "hidden" && (
        <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.45)",
                      display:"flex", alignItems:"center", justifyContent:"center", zIndex:50 }}>
          <div style={{ background:"#fff", borderRadius:16, padding:"1.75rem",
                        maxWidth:360, width:"90%", boxShadow:"0 8px 40px rgba(0,0,0,0.18)" }}>
            {deleteModal === "denied" ? (
              <>
                <div style={{ fontSize:"1.4rem", marginBottom:"0.5rem" }}>🔒</div>
                <div style={{ fontWeight:700, fontSize:"1rem", color:"#EF4444", marginBottom:"0.4rem" }}>
                  Access Denied
                </div>
                <p style={{ fontSize:"0.85rem", color:"#555", marginBottom:"1.25rem", lineHeight:1.6 }}>
                  Deleting slides requires <strong>Level 3 Admin access</strong>. Your current access level does not permit this action.
                </p>
                <button onClick={() => setDeleteModal("hidden")}
                  style={{ width:"100%", padding:"0.6rem", borderRadius:8, border:"none",
                           background:"#EF4444", color:"#fff", fontWeight:600,
                           fontSize:"0.88rem", cursor:"pointer" }}>
                  OK
                </button>
              </>
            ) : (
              <>
                <div style={{ fontSize:"1.4rem", marginBottom:"0.5rem" }}>🗑</div>
                <div style={{ fontWeight:700, fontSize:"1rem", marginBottom:"0.4rem" }}>
                  Delete Slide {current + 1}?
                </div>
                <p style={{ fontSize:"0.85rem", color:"#555", marginBottom:"1.25rem", lineHeight:1.6 }}>
                  You are about to delete <strong>"{slideTitle}"</strong>. This action cannot be undone.
                </p>
                <div style={{ display:"flex", gap:"0.75rem" }}>
                  <button onClick={() => setDeleteModal("hidden")}
                    style={{ flex:1, padding:"0.6rem", borderRadius:8,
                             border:"1.5px solid #E5E2DA", background:"#fff",
                             cursor:"pointer", fontSize:"0.88rem" }}>
                    No, Keep It
                  </button>
                  <button onClick={confirmDeleteSlide}
                    style={{ flex:1, padding:"0.6rem", borderRadius:8, border:"none",
                             background:"#EF4444", color:"#fff", fontWeight:600,
                             fontSize:"0.88rem", cursor:"pointer" }}>
                    Yes, Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* AI Creator Drawer/Modal */}
      {showCreatorDrawer && (
        <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.45)",
                      display:"flex", alignItems:"center", justifyContent:"center", zIndex:60 }}>
          <div style={{ background:C.surface, borderRadius:20, padding:"2rem", border:`1.5px solid ${C.border}`,
                        maxWidth:450, width:"90%", boxShadow:"0 12px 48px rgba(0,0,0,0.35)", display:"flex", flexDirection:"column", gap:"1.2rem" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <div style={{ display:"flex", alignItems:"center", gap:"0.5rem" }}>
                <span style={{ fontSize:"1.3rem" }}>✨</span>
                <h3 style={{ color:C.text1, fontSize:"1.05rem", fontWeight:700 }}>AI Slide Creator</h3>
              </div>
              <button onClick={() => setShowCreatorDrawer(false)}
                style={{ background:"transparent", border:"none", color:C.text2, fontSize:"1.2rem", cursor:"pointer", outline:"none" }}>✕</button>
            </div>
            
            <p style={{ fontSize:"0.78rem", color:C.text2, lineHeight:1.5 }}>
              Generate a brand-new widescreen presentation. This will replace the current active presentation deck.
            </p>

            <textarea
              placeholder="Describe your presentation topic (e.g. 'Explain the history of space flight')"
              value={aiPrompt}
              onChange={e => setAiPrompt(e.target.value)}
              style={{ width:"100%", height:100, padding:"0.75rem", borderRadius:10, background:C.bg, border:`1.5px solid ${C.border}`,
                       color:C.text1, fontSize:"0.82rem", resize:"none", outline:"none", transition:"border-color 0.2s", fontFamily:"inherit" }}
              onFocus={e => e.currentTarget.style.borderColor=C.amber}
              onBlur={e => e.currentTarget.style.borderColor=C.border}
            />

            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:"1rem" }}>
              <div style={{ display:"flex", alignItems:"center", gap:"0.5rem" }}>
                <span style={{ fontSize:"0.72rem", color:C.text2, fontWeight:600 }}>Slides:</span>
                <input
                  type="range" min="3" max="8"
                  value={slideCount}
                  onChange={e => setSlideCount(parseInt(e.target.value))}
                  style={{ width:80, accentColor:C.amber }}
                />
                <span style={{ fontSize:"0.75rem", color:C.amberDark, fontWeight:700 }}>{slideCount}</span>
              </div>

              <div style={{ display:"flex", gap:"0.5rem" }}>
                <button onClick={() => setShowCreatorDrawer(false)}
                  style={{ padding:"0.5rem 1rem", borderRadius:8, border:`1.5px solid ${C.border}`, background:"transparent",
                           color:C.text2, cursor:"pointer", fontSize:"0.78rem" }}>
                  Cancel
                </button>
                <div style={{ display: "flex", gap: "0.4rem" }}>
                  <button
                    onClick={() => generateSlides()}
                    disabled={generating || listeningForVoiceGenerate}
                    style={{ padding:"0.5rem 1.25rem", borderRadius:8, background:C.amber, color:"#000", fontWeight:700,
                             fontSize:"0.78rem", cursor:(generating || listeningForVoiceGenerate)?"default":"pointer", border:"none", display:"flex", alignItems:"center", gap:"0.4rem" }}
                  >
                    {generating ? (
                      <>
                        <div className="spinner" style={{ width:10, height:10, borderRadius:"50%", border:"2px solid #000", borderTopColor:"transparent", animation:"spin 0.8s linear infinite" }} />
                        Generating...
                      </>
                    ) : "Generate"}
                  </button>

                  <button
                    onClick={startVoiceGenerate}
                    disabled={generating || listeningForVoiceGenerate}
                    style={{ padding:"0.5rem 1.25rem", borderRadius:8, 
                             background: listeningForVoiceGenerate ? C.amber : "rgba(245,167,0,0.12)", 
                             color: listeningForVoiceGenerate ? "#000" : C.amber, 
                             fontWeight:700,
                             fontSize:"0.78rem", cursor:(generating || listeningForVoiceGenerate)?"default":"pointer", 
                             border: `1.5px solid ${C.amber}`, display:"flex", alignItems:"center", gap:"0.4rem",
                             transition: "all 0.2s" }}
                  >
                    {listeningForVoiceGenerate ? (
                      <>
                        <div className="spinner" style={{ width:10, height:10, borderRadius:"50%", border:"2px solid #000", borderTopColor:"transparent", animation:"spin 0.8s linear infinite" }} />
                        Listening...
                      </>
                    ) : "🎙️ Generate with Voice"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}