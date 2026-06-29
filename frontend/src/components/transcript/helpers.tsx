import React, { useState, useEffect } from "react";

export const C = {
  amber: "#F5A700", amberDark: "#7C5E00", amberBg: "#FFF8E7",
  bg: "#F7F6F3", surface: "#FFFFFF", border: "#E5E2DA",
  text1: "#1A1A1A", text2: "#555", text3: "#888",
  green: "#22C55E", blue: "#3B82F6", red: "#EF4444",
};

export const STATUS_STAGES: Record<string, string[]> = {
  write_file: [
    "Allocating target workspace...",
    "Scanning project directory...",
    "Compiling Python AST structures...",
    "Drafting core logic block...",
    "Verifying syntactic correctness...",
    "Injecting imports...",
    "Finalizing code layout..."
  ],
  write_email: [
    "Searching local user database...",
    "Matching recipient profiles...",
    "Formulating subject header...",
    "Drafting detailed email body...",
    "Formatting responsive template...",
    "Preparing SMTP payload..."
  ],
  send_email: [
    "Opening secure SMTP portal...",
    "Verifying biometric authorization...",
    "Handshaking with mail server...",
    "Transmitting message packets...",
    "Delivered."
  ],
  flight_search: [
    "Accessing travel API...",
    "Filtering origin/destination slots...",
    "Evaluating seat inventories...",
    "Retrieving pricing indices...",
    "Sorting by lowest cost..."
  ],
  flight_book: [
    "Allocating travel passenger seat...",
    "Authorizing payment ledger...",
    "Securing booking reference..."
  ],
  crm_lookup: [
    "Accessing secure CRM schema...",
    "Querying tier levels and metadata...",
    "Compiling profile data..."
  ],
  kb_search: [
    "Searching index document store...",
    "Extracting closest matches...",
    "Parsing search context..."
  ],
  ticket_create: [
    "Opening support ticket schema...",
    "Generating random reference ID...",
    "Committing log to db..."
  ]
};

export function LiveTaskStatus({ tool, status }: { tool: string; status: string }) {
  const [stageIdx, setStageIdx] = useState(0);

  useEffect(() => {
    if (status !== "running") return;
    const stages = STATUS_STAGES[tool] || ["Processing background task...", "Running active subtask..."];
    const interval = setInterval(() => {
      setStageIdx(prev => (prev + 1) % stages.length);
    }, 1500);
    return () => clearInterval(interval);
  }, [tool, status]);

  if (status === "running") {
    const stages = STATUS_STAGES[tool] || ["Processing background task...", "Running active subtask..."];
    return (
      <div style={{ fontSize: "0.65rem", color: C.amberDark, fontStyle: "italic", animation: "pulse 1.2s infinite", marginTop: 2 }}>
        ⌛ {stages[stageIdx % stages.length]}
      </div>
    );
  }

  return (
    <div style={{ fontSize: "0.65rem", color: (status === "ok" || status === "success") ? C.green : "#AAA", marginTop: 2 }}>
      {(status === "ok" || status === "success") ? "✓ Task completed successfully" : "Pending execution"}
    </div>
  );
}

/* ── Code / Markdown structured renderer for transcripts ── */
export function HighlightedCode({ code, lang }: { code: string; lang: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const highlight = (txt: string, language: string) => {
    if (language && language.toLowerCase() === "email") {
      const lines = txt.split("\n");
      return lines.map((line, lIdx) => {
        const lower = line.toLowerCase();
        if (lower.startsWith("subject:") || lower.startsWith("to:") || lower.startsWith("from:") || lower.startsWith("email:") || lower.startsWith("cc/bcc:")) {
          const match = line.match(/^([^:]+:)(.*)$/);
          if (match) {
            return (
              <div key={lIdx}>
                <span style={{ color: "#f5a700", fontWeight: "bold" }}>{match[1]}</span>
                <span style={{ color: "#00FFB2", fontWeight: "600" }}>{match[2]}</span>
              </div>
            );
          }
        }
        if (line.includes("Main Section Start") || line.includes("----")) {
          return (
            <div key={lIdx} style={{ color: "#FFBF00", fontWeight: "800", letterSpacing: "0.05em", margin: "0.3rem 0" }}>
              {line}
            </div>
          );
        }
        return <div key={lIdx} style={{ color: "#cdd6f4" }}>{line}</div>;
      });
    }

    if (!language || !["python", "py", "javascript", "js", "typescript", "ts", "html"].includes(language.toLowerCase())) {
      return <span>{txt}</span>;
    }

    const lines = txt.split("\n");
    return lines.map((line, lIdx) => {
      const tokenRegex = /(\/\/.*|\/\*[\s\S]*?\*\/|#.*|"(?:\\"|[^"])*"|'(?:\\'|[^'])*'|`[^`]*`|\b(?:def|class|import|from|return|async|await|const|let|var|function|if|else|for|while|try|except|catch|finally|export|default|interface|type|public|private|new|null|undefined|true|false)\b|\b\d+\b|[{}[\]().,;+\-*/%&|^!=<>:?])/g;
      const parts = line.split(tokenRegex);

      return (
        <div key={lIdx} style={{ minHeight: "1rem" }}>
          {parts.map((part, pIdx) => {
            if (!part) return null;
            if (part.startsWith("//") || part.startsWith("#") || part.startsWith("/*")) {
              return <span key={pIdx} style={{ color: "#6a9955", fontStyle: "italic" }}>{part}</span>;
            }
            if ((part.startsWith('"') && part.endsWith('"')) || (part.startsWith("'") && part.endsWith("'")) || (part.startsWith('`') && part.endsWith('`'))) {
              return <span key={pIdx} style={{ color: "#ce9178" }}>{part}</span>;
            }
            const keywords = ["def", "class", "import", "from", "return", "async", "await", "const", "let", "var", "function", "if", "else", "for", "while", "try", "except", "catch", "finally", "export", "default", "interface", "type", "public", "private", "new"];
            if (keywords.includes(part)) {
              return <span key={pIdx} style={{ color: "#569cd6", fontWeight: "bold" }}>{part}</span>;
            }
            if (/^\d+$/.test(part)) {
              return <span key={pIdx} style={{ color: "#b5cea8" }}>{part}</span>;
            }
            const builtins = ["true", "false", "null", "undefined", "print", "console", "log", "self", "this"];
            if (builtins.includes(part)) {
              return <span key={pIdx} style={{ color: "#4fc1ff" }}>{part}</span>;
            }
            return <span key={pIdx}>{part}</span>;
          })}
        </div>
      );
    });
  };

  return (
    <div style={{ position: "relative", margin: "0.8rem 0", maxWidth: "100%" }}>
      <pre style={{
        background: "#1e1e2e",
        color: "#cdd6f4",
        padding: "2.5rem 1rem 1rem",
        fontFamily: "JetBrains Mono, Menlo, Monaco, Consolas, monospace",
        borderRadius: 10,
        overflowX: "auto",
        textAlign: "left",
        fontSize: "0.78rem",
        border: "1px solid #313244",
        lineHeight: 1.5,
        boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
        whiteSpace: "pre-wrap",
        wordBreak: "break-word"
      }}>
        {lang && (
          <div style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            fontSize: "0.62rem",
            fontWeight: 800,
            textTransform: "uppercase",
            color: "#f5a700",
            background: "#252538",
            borderBottom: "1px solid #313244",
            padding: "0.45rem 1rem",
            userSelect: "none",
            borderTopLeftRadius: 10,
            borderTopRightRadius: 10,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <span>🛠️ {lang} code</span>
            <button
              onClick={handleCopy}
              style={{
                background: copied ? C.green : "transparent",
                border: "1px solid rgba(245,167,0,0.3)",
                color: copied ? "#fff" : "#f5a700",
                fontSize: "0.58rem",
                padding: "2px 6px",
                borderRadius: 4,
                cursor: "pointer",
                fontWeight: 600,
                textTransform: "uppercase",
                transition: "all 0.15s ease"
              }}
            >
              {copied ? "Copied! ✓" : "Copy Code"}
            </button>
          </div>
        )}
        <code>{highlight(code, lang)}</code>
      </pre>
    </div>
  );
}

export function renderTranscriptText(text: string) {
  if (!text) return null;
  const parts = text.split(/(```[\s\S]*?```)/g);
  
  return parts.map((part, index) => {
    if (part.startsWith("```") && part.endsWith("```")) {
      const match = part.match(/```(\w*)\n([\s\S]*?)```/);
      let lang = match ? match[1] : "";
      const code = match ? match[2] : part.slice(3, -3);
      if (lang === "email") lang = "markdown";
      
      return <HighlightedCode key={index} code={code} lang={lang} />;
    }

    const pyMatch = part.match(/([\s\S]*?)\b(def\s+\w+\s*\(.*?\)\s*:[\s\S]*)/);
    if (pyMatch) {
      const intro = pyMatch[1];
      const code = pyMatch[2];
      return (
        <span key={index} style={{ display: "inline-block", width: "100%" }}>
          {intro && <span style={{ whiteSpace: "pre-wrap", display: "inline-block", marginBottom: "0.4rem" }}>{intro}</span>}
          <HighlightedCode code={code} lang="python" />
        </span>
      );
    }

    const jsMatch = part.match(/([\s\S]*?)\b((?:const|let|var)\s+\w+\s*=\s*(?:\([^)]*\)|\w+)\s*=>[\s\S]*)/);
    if (jsMatch) {
      const intro = jsMatch[1];
      const code = jsMatch[2];
      return (
        <span key={index} style={{ display: "inline-block", width: "100%" }}>
          {intro && <span style={{ whiteSpace: "pre-wrap", display: "inline-block", marginBottom: "0.4rem" }}>{intro}</span>}
          <HighlightedCode code={code} lang="javascript" />
        </span>
      );
    }

    const fnMatch = part.match(/([\s\S]*?)\b(function\s+\w*\s*\(.*?\)\s*\{[\s\S]*)/);
    if (fnMatch) {
      const intro = fnMatch[1];
      const code = fnMatch[2];
      return (
        <span key={index} style={{ display: "inline-block", width: "100%" }}>
          {intro && <span style={{ whiteSpace: "pre-wrap", display: "inline-block", marginBottom: "0.4rem" }}>{intro}</span>}
          <HighlightedCode code={code} lang="javascript" />
        </span>
      );
    }
    
    return (
      <span key={index} style={{ whiteSpace: "pre-wrap", display: "inline-block" }}>
        {part}
      </span>
    );
  });
}

export interface ParsedFlight {
  airline: string;
  flightCode: string;
  departure: string;
  price: string;
  from: string;
  to: string;
  date: string;
}

export interface ParsedHotel {
  hotel: string;
  location: string;
  price: string;
  date: string;
}

export function parseHotelsFromText(text: string): ParsedHotel[] | null {
  if (!text) return null;
  const headerMatch = text.match(/hotels\s+in\s+([A-Za-z0-9\s,.-]+)\s+on\s+([A-Za-z0-9\s-]+)/i);
  const location = headerMatch ? headerMatch[1].trim() : "";
  const hotelDate = headerMatch ? headerMatch[2].trim() : "";

  const lines = text.split("\n");
  const hotels: ParsedHotel[] = [];
  const regex = /^\s*\d+\.\s+([A-Za-z0-9\s.&-]+?)\s+in\s+([A-Za-z0-9\s,.-]+?)\s+starting\s+at\s+(\S+)/i;

  for (const line of lines) {
    const match = line.match(regex);
    if (match) {
      hotels.push({
        hotel: match[1].trim(),
        location: match[2].trim() || location || "Mumbai",
        price: match[3].trim(),
        date: hotelDate || "today"
      });
    }
  }

  return hotels.length > 0 ? hotels : null;
}

export function parseFlightsFromText(text: string): ParsedFlight[] | null {
  if (!text) return null;
  const headerMatch = text.match(/flights\s+from\s+([A-Za-z0-9\s]+)\s+to\s+([A-Za-z0-9\s]+)\s+on\s+([A-Za-z0-9\s-]+)/i);
  const from = headerMatch ? headerMatch[1].trim().toUpperCase() : "";
  const to = headerMatch ? headerMatch[2].trim().toUpperCase() : "";
  const flightDate = headerMatch ? headerMatch[3].trim() : "";

  const lines = text.split("\n");
  const flights: ParsedFlight[] = [];
  const regex = /^\s*\d+\.\s+([A-Za-z0-9\s.&-]+?)\s*(?:\(([^)]+)\))?\s+departing\s+at\s+([0-9:]+\s*(?:AM|PM)?)\s+for\s+(\S+)/i;

  for (const line of lines) {
    const match = line.match(regex);
    if (match) {
      flights.push({
        airline: match[1].trim(),
        flightCode: match[2] ? match[2].trim() : "",
        departure: match[3].trim(),
        price: match[4].trim(),
        from: from || "BOM",
        to: to || "DEL",
        date: flightDate || "today"
      });
    }
  }

  return flights.length > 0 ? flights : null;
}

export function isFlightRelated(text: string): boolean {
  if (!text) return false;
  const clean = text.toLowerCase();
  
  // If it is a programming code snippet, request, or technical response, it is a general QA question
  const hasCodeSignatures = text.includes("```") || text.includes("<!DOCTYPE") || text.includes("<html>") || text.includes("import ") || text.includes("def ");
  const isProgrammingQuery = ["code", "program", "python", "html", "css", "script", "segmentation tree", "neural network"].some(w => clean.includes(w));
  if (hasCodeSignatures || isProgrammingQuery) return false;

  const keywords = ["flight", "flights", "airline", "book", "departing", "arrival", "ticket", "airport", "passenger", "trip", "travel", "destination", "origin", "customercare", "bom", "del", "jfk", "lax", "hotel", "hotels", "stay", "room", "lodging"];
  return keywords.some(kw => clean.includes(kw)) || parseFlightsFromText(text) !== null || parseHotelsFromText(text) !== null;
}

export function isPptRelated(text: string): boolean {
  if (!text) return false;
  const clean = text.toLowerCase();
  const keywords = ["ppt", "slide", "slides", "powerpoint", "presentation", "summarize", "navigate", "goto"];
  return keywords.some(kw => clean.includes(kw));
}

export function isEmailRelated(text: string): boolean {
  if (!text) return false;
  const clean = text.toLowerCase();
  const keywords = ["email", "mail", "draft", "sender", "recipient", "subject", "smtp", "dispatch", "send email", "send mail"];
  return keywords.some(kw => clean.includes(kw));
}
