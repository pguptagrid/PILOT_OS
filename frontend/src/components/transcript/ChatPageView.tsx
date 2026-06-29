import React, { useState, useEffect, useRef, useCallback } from "react";
import { useAppStore } from "../../store/SessionStore";
import { C } from "./helpers";
import { sharedVoiceService } from "../../shared_voice";

interface ChatMessage {
  id: string;
  sender: "me" | "them";
  senderName?: string;
  text: string;
  time: string;
}

interface ChatSession {
  id: string;
  name: string;
  status: string;
  preview: string;
  messages: ChatMessage[];
  lastMessageTimestamp: number;
  unreadCount: number;
}

export function ChatPageView() {
  const store = useAppStore();
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [inputMessage, setInputMessage] = useState("");
  const [sessions, setSessions] = useState<ChatSession[]>([]);

  // New group management states
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDesc, setNewGroupDesc] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);

  // Info popup card states
  const [showInfoCard, setShowInfoCard] = useState(false);
  const [groupMembers, setGroupMembers] = useState<any[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  // Voice recording states
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const recognitionRef = useRef<any>(null);
  const shouldListenRef = useRef(false);

  useEffect(() => {
    return () => {
      shouldListenRef.current = false;
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleVoiceRecording = () => {
    if (isRecordingVoice) {
      shouldListenRef.current = false;
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecordingVoice(false);
    } else {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        alert("Your browser does not support the Web Speech API. Please use Google Chrome or Safari.");
        return;
      }
      
      shouldListenRef.current = true;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = "en-US";
      
      recognition.onstart = () => {
        setIsRecordingVoice(true);
      };
      
      recognition.onresult = (event: any) => {
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            const transcript = event.results[i][0].transcript;
            if (transcript && transcript.trim()) {
              handleSendMessage(transcript);
            }
          }
        }
      };
      
      recognition.onerror = (err: any) => {
        console.error("Speech recognition error:", err);
        if (err.error === "no-speech") {
          return;
        }
        if (err.error === "not-allowed" || err.error === "service-not-allowed") {
          shouldListenRef.current = false;
          setIsRecordingVoice(false);
        }
      };
      
      recognition.onend = () => {
        if (shouldListenRef.current) {
          try {
            recognition.start();
          } catch (e) {
            console.error("Failed restarting recognition, retrying...", e);
            setTimeout(() => {
              if (shouldListenRef.current) {
                try { recognition.start(); } catch (_) {}
              }
            }, 1000);
          }
        } else {
          setIsRecordingVoice(false);
        }
      };
      
      recognitionRef.current = recognition;
      recognition.start();
    }
  };

  useEffect(() => {
    setShowInfoCard(false);
    setGroupMembers([]);
  }, [selectedId]);

  const handleOpenInfoCard = () => {
    if (!selectedId) return;
    if (selectedId === "group1") {
      setGroupMembers([
        { id: 101, name: "Suniel", email: "suniel@example.com", role: "admin" },
        { id: 102, name: "Akshay", email: "akshay@example.com", role: "member" },
        { id: 103, name: "Pawan", email: "pawan@example.com", role: "member" }
      ]);
      setShowInfoCard(true);
    } else if (selectedId.startsWith("group-")) {
      const groupIdStr = selectedId.replace("group-", "");
      setLoadingMembers(true);
      fetch(`/api/v1/groups/${groupIdStr}/members`, {
        headers: { "Authorization": `Bearer ${store.token}` }
      })
        .then(res => {
          if (!res.ok) throw new Error("Failed to fetch group members");
          return res.json();
        })
        .then(data => {
          setGroupMembers(data);
          setLoadingMembers(false);
          setShowInfoCard(true);
        })
        .catch(err => {
          console.error(err);
          setLoadingMembers(false);
        });
    } else {
      setShowInfoCard(true);
    }
  };

  const loadChatData = useCallback(() => {
    if (!store.token) return;
    Promise.all([
      fetch("/api/v1/auth/users", {
        headers: { "Authorization": `Bearer ${store.token}` }
      }).then(res => {
        if (!res.ok) throw new Error("Failed to fetch users");
        return res.json();
      }),
      fetch("/api/v1/groups", {
        headers: { "Authorization": `Bearer ${store.token}` }
      }).then(res => {
        if (!res.ok) throw new Error("Failed to fetch groups");
        return res.json();
      })
    ])
      .then(([usersData, groupsData]) => {
        setAllUsers(usersData);
        
        const otherUsers = usersData.filter((u: any) => u.email !== store.user?.email);

        const mockTemplates: { status: string; preview: string; messages: ChatMessage[] }[] = [
          {
            status: "Online",
            preview: "Awesome! Let me know if you need any help with the NextJS integration.",
            messages: [
              { id: "1-1", sender: "them", text: "Hey, did you get a chance to check the Expenso backend?", time: "10:30 AM" },
              { id: "1-2", sender: "me", text: "Yeah, the Convex schema looks perfect.", time: "10:32 AM" },
              { id: "1-3", sender: "them", text: "Awesome! Let me know if you need any help with the NextJS integration.", time: "10:33 AM" }
            ]
          },
          {
            status: "Online",
            preview: "It was $45. I've logged it under Expenso.",
            messages: [
              { id: "2-1", sender: "them", text: "Settle up the bill for dinner last night when you can.", time: "Yesterday" },
              { id: "2-2", sender: "me", text: "Sure, how much was it?", time: "Yesterday" },
              { id: "2-3", sender: "them", text: "It was $45. I've logged it under Expenso.", time: "Yesterday" }
            ]
          },
          {
            status: "Away",
            preview: "Great, show me the demo when it's ready!",
            messages: [
              { id: "3-1", sender: "them", text: "Are we still on for the PPT presentation prep?", time: "Yesterday" },
              { id: "3-2", sender: "me", text: "Yes, absolutely. I'm testing the voice commands right now.", time: "Yesterday" },
              { id: "3-3", sender: "them", text: "Great, show me the demo when it's ready!", time: "Yesterday" }
            ]
          },
          {
            status: "Online",
            preview: "Arey wah! It is indeed a smart assistant!",
            messages: [
              { id: "4-1", sender: "them", text: "Bhai, what about the meeting minutes?", time: "Monday" },
              { id: "4-2", sender: "me", text: "Talkinia is compiling them automatically in real-time.", time: "Monday" },
              { id: "4-3", sender: "them", text: "Arey wah! It is indeed a smart assistant!", time: "Monday" }
            ]
          },
          {
            status: "Offline",
            preview: "Working on them now, python test files are running.",
            messages: [
              { id: "5-1", sender: "them", text: "Did you finish the type check for the models?", time: "Monday" },
              { id: "5-2", sender: "me", text: "Working on them now, python test files are running.", time: "Monday" }
            ]
          },
          {
            status: "Online",
            preview: "The usual spot around 4 PM.",
            messages: [
              { id: "6-1", sender: "them", text: "Hey! Let's grab coffee today.", time: "2 hours ago" },
              { id: "6-2", sender: "me", text: "Sure, where?", time: "1 hour ago" },
              { id: "6-3", sender: "them", text: "The usual spot around 4 PM.", time: "1 hour ago" }
            ]
          },
          {
            status: "Online",
            preview: "We mapped the flight-mcp queries to the backend successfully.",
            messages: [
              { id: "7-1", sender: "them", text: "Any updates on the flight booking MCP server?", time: "3 hours ago" },
              { id: "7-2", sender: "me", text: "We mapped the flight-mcp queries to the backend successfully.", time: "2 hours ago" }
            ]
          },
          {
            status: "Offline",
            preview: "Thanks! I used Mermaid.js for clean rendering.",
            messages: [
              { id: "8-1", sender: "them", text: "Great work on the distributed system architecture diagram!", time: "3 days ago" },
              { id: "8-2", sender: "me", text: "Thanks! I used Mermaid.js for clean rendering.", time: "3 days ago" }
            ]
          },
          {
            status: "Away",
            preview: "Sure, I'll update the main README.md with the detailed overview.",
            messages: [
              { id: "9-1", sender: "them", text: "Let me know when the project structure is finalized.", time: "4 days ago" },
              { id: "9-2", sender: "me", text: "Sure, I'll update the main README.md with the detailed overview.", time: "4 days ago" }
            ]
          }
        ];

        const savedHistoryStr = localStorage.getItem("pilot_chat_history");
        const savedHistory: Record<string, any> = savedHistoryStr ? JSON.parse(savedHistoryStr) : {};

        const mappedSessions: ChatSession[] = otherUsers.map((u: any, i: number) => {
          const tpl = mockTemplates[i % mockTemplates.length];
          const sessionId = `user-${u.id}`;
          const savedItem = savedHistory[sessionId];
          const messages = Array.isArray(savedItem) ? savedItem : (savedItem?.messages || tpl.messages);
          const lastMessageTimestamp = Array.isArray(savedItem) ? (Date.now() - (i * 60000)) : (savedItem?.lastMessageTimestamp || (Date.now() - (i * 60000)));
          const unreadCount = Array.isArray(savedItem) ? 0 : (savedItem?.unreadCount || 0);
          return {
            id: sessionId,
            name: u.name,
            status: u.status || "offline",
            preview: messages.length > 0 ? messages[messages.length - 1].text : tpl.preview,
            messages,
            lastMessageTimestamp,
            unreadCount
          };
        });

        // Add real groups from db
        const mappedGroups: ChatSession[] = (groupsData || []).map((g: any, i: number) => {
          const sessionId = `group-${g.id}`;
          const defaultMsgs = [
            { id: `g-init-${g.id}`, sender: "them", text: `Welcome to the ${g.name} group chat!`, time: "Just now" }
          ];
          const savedItem = savedHistory[sessionId];
          const messages = Array.isArray(savedItem) ? savedItem : (savedItem?.messages || defaultMsgs);
          const lastMessageTimestamp = Array.isArray(savedItem) ? (Date.now() - ((i + otherUsers.length) * 60000)) : (savedItem?.lastMessageTimestamp || (Date.now() - ((i + otherUsers.length) * 60000)));
          const unreadCount = Array.isArray(savedItem) ? 0 : (savedItem?.unreadCount || 0);
          return {
            id: sessionId,
            name: g.name,
            status: `${g.member_count} members`,
            preview: messages.length > 0 ? messages[messages.length - 1].text : (g.description || "Active group chat"),
            messages,
            lastMessageTimestamp,
            unreadCount
          };
        });

        // Add the Demo Group chat template too
        const demoSessionId = "group1";
        const demoDefaultMsgs = [
          { id: "g-1", sender: "them", senderName: "Suniel", text: "Hey everyone, are we ready for the milestone review?", time: "10:15 AM" },
          { id: "g-2", sender: "them", senderName: "Akshay", text: "All slides are uploaded to PPT Copilot.", time: "10:18 AM" },
          { id: "g-3", sender: "them", senderName: "Pawan", text: "I've verified the background LLM and front LLM are synced.", time: "10:20 AM" },
          { id: "g-4", sender: "me", senderName: "Me", text: "Ready on my end too!", time: "10:22 AM" }
        ];
        const savedItem = savedHistory[demoSessionId];
        const demoMessages = Array.isArray(savedItem) ? savedItem : (savedItem?.messages || demoDefaultMsgs);
        const demoTimestamp = Array.isArray(savedItem) ? (Date.now() - 10000) : (savedItem?.lastMessageTimestamp || (Date.now() - 10000));
        const demoUnread = Array.isArray(savedItem) ? 0 : (savedItem?.unreadCount || 0);
        const demoGroup: ChatSession = {
          id: demoSessionId,
          name: "Demo Group",
          status: "Active Group",
          preview: demoMessages.length > 0 ? demoMessages[demoMessages.length - 1].text : "Ready on my end too!",
          messages: demoMessages,
          lastMessageTimestamp: demoTimestamp,
          unreadCount: demoUnread
        };

        const finalSessions = [...mappedSessions, ...mappedGroups, demoGroup];
        setSessions(finalSessions);

        setSelectedId(prev => {
          if (prev && finalSessions.some(s => s.id === prev)) return prev;
          return finalSessions.length > 0 ? finalSessions[0].id : null;
        });
      })
      .catch(err => console.error("Error loading chat users & groups:", err));
  }, [store.token, store.user]);

  useEffect(() => {
    loadChatData();
  }, [loadChatData]);

  // Hook into real-time WebSockets chat events channel
  useEffect(() => {
    sharedVoiceService.ensureConnected();

    const unbind = sharedVoiceService.registerChat((msg: any) => {
      console.log("[ChatPageView] Received WS chat message:", msg);
      
      const isSender = String(msg.sender_id) === String(store.user?.id);
      
      setSessions(prev => {
        return prev.map(s => {
          let belongsToThisSession = false;
          const isGroupMessage = msg.target_id && msg.target_id.startsWith("group");
          
          if (isGroupMessage) {
            belongsToThisSession = (s.id === msg.target_id);
          } else {
            if (s.id.startsWith("group")) {
              belongsToThisSession = false;
            } else {
              if (isSender) {
                belongsToThisSession = (s.id === msg.target_id);
              } else {
                belongsToThisSession = (s.id === `user-${msg.sender_id}`);
              }
            }
          }

          if (belongsToThisSession) {
            // Prevent duplicate messages
            if (s.messages.some((m: any) => m.id === msg.message_id)) {
              return s;
            }
            
            const formattedMsg: ChatMessage = {
              id: msg.message_id,
              sender: isSender ? "me" : "them",
              senderName: isSender ? "Me" : msg.sender_name,
              text: msg.text,
              time: msg.time
            };

            const isCurrentlySelected = s.id === selectedId;

            return {
              ...s,
              preview: msg.text,
              messages: [...s.messages, formattedMsg],
              lastMessageTimestamp: Date.now(),
              unreadCount: isCurrentlySelected || isSender ? 0 : s.unreadCount + 1
            };
          }
          return s;
        });
      });
    });

    return () => {
      unbind();
    };
  }, [store.user?.id, loadChatData, selectedId]);

  // Listen to real-time profile updates and sync names/emails instantly
  useEffect(() => {
    const unbind = sharedVoiceService.registerProfile((data: any) => {
      console.log("[ChatPageView] Received WS profile update:", data);
      const updatedUserId = String(data.user_id);
      
      setSessions(prev => prev.map(s => {
        // Update 1-to-1 chat session name
        if (s.id === `user-${updatedUserId}`) {
          return { ...s, name: data.name };
        }
        
        // Scan for group chats and update historical message sender names
        const oldUser = allUsers.find(u => String(u.id) === updatedUserId);
        const oldName = oldUser?.name;
        if (s.id.startsWith("group") && oldName) {
          const newMessages = s.messages.map(m => {
            if (m.senderName === oldName) {
              return { ...m, senderName: data.name };
            }
            return m;
          });
          return { ...s, messages: newMessages, preview: newMessages.length > 0 ? newMessages[newMessages.length - 1].text : s.preview };
        }
        return s;
      }));

      // Update cached user details
      setAllUsers(prev => prev.map(u => {
        if (String(u.id) === updatedUserId) {
          return { ...u, name: data.name, email: data.email };
        }
        return u;
      }));
    });

    return () => {
      unbind();
    };
  }, [allUsers]);

  // Persist chat updates to local storage & sync global store unread count
  const setUnreadChatCount = store.setUnreadChatCount;
  useEffect(() => {
    if (sessions.length === 0) return;
    const historyObj: Record<string, { messages: ChatMessage[], lastMessageTimestamp: number, unreadCount: number }> = {};
    let totalUnread = 0;
    sessions.forEach(s => {
      historyObj[s.id] = {
        messages: s.messages,
        lastMessageTimestamp: s.lastMessageTimestamp,
        unreadCount: s.unreadCount
      };
      totalUnread += s.unreadCount;
    });
    localStorage.setItem("pilot_chat_history", JSON.stringify(historyObj));
    setUnreadChatCount(totalUnread);
  }, [sessions, setUnreadChatCount]);

  // Clear unread count for the active session when selected
  useEffect(() => {
    if (!selectedId) return;
    setSessions(prev => {
      if (!prev.some(s => s.id === selectedId && s.unreadCount > 0)) return prev;
      return prev.map(s => {
        if (s.id === selectedId) {
          return { ...s, unreadCount: 0 };
        }
        return s;
      });
    });
  }, [selectedId]);

  const handleCreateGroupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    fetch("/api/v1/groups", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${store.token}`
      },
      body: JSON.stringify({
        name: newGroupName.trim(),
        description: newGroupDesc.trim(),
        member_ids: selectedUserIds
      })
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to create group");
        return res.json();
      })
      .then(() => {
        setNewGroupName("");
        setNewGroupDesc("");
        setSelectedUserIds([]);
        setShowCreateGroup(false);
        loadChatData();
      })
      .catch(err => console.error("Error creating group:", err));
  };

  const toggleUserSelection = (userId: number) => {
    setSelectedUserIds(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const activeSession = sessions.find(s => s.id === selectedId) || sessions[0];
  const isGroup = selectedId?.startsWith("group-") || selectedId === "group1";

  const filteredSessions = sessions.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.id.toLowerCase().includes(search.toLowerCase())
  );

  const sortedSessions = [...filteredSessions].sort((a, b) => b.lastMessageTimestamp - a.lastMessageTimestamp);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeSession) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedId, activeSession?.messages?.length]);

  const handleSendMessage = (overrideText?: string) => {
    const textToSend = (overrideText || inputMessage).trim();
    if (!textToSend) return;
    
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const msgId = Math.random().toString();
 
    // Send payload to backend WS broadcast channel
    sharedVoiceService.sendPayload({
      type: "chat_message",
      sender_id: store.user?.id,
      sender_name: store.user?.name || "User",
      target_id: selectedId,
      text: textToSend,
      time: nowStr,
      message_id: msgId
    });
 
    const newMsg: ChatMessage = {
      id: msgId,
      sender: "me",
      senderName: "Me",
      text: textToSend,
      time: nowStr
    };
 
    setSessions(prev => prev.map(s => {
      if (s.id === selectedId) {
        return {
          ...s,
          preview: textToSend,
          messages: [...s.messages, newMsg],
          lastMessageTimestamp: Date.now(),
          unreadCount: 0
        };
      }
      return s;
    }));
 
    if (!overrideText) {
      setInputMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", height: "100%", background: C.bg }}>
      {/* Page Header */}
      <div style={{ padding: "0.85rem 1.5rem", background: C.surface, borderBottom: `1.5px solid ${C.border}`, flexShrink: 0 }}>
        <h2 style={{ fontWeight: 800, fontSize: "1rem" }}>Wanna Chat</h2>
        <p style={{ fontSize: "0.75rem", color: C.text3 }}>Instant text-only messaging with project members and teams.</p>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden", padding: "1.25rem", gap: "1.25rem" }}>
        
        {/* Left Column: Search Bar & User List */}
        <div style={{
          width: 300,
          background: C.surface,
          border: `1.5px solid ${C.border}`,
          borderRadius: 16,
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
          overflow: "hidden"
        }}>
          <div style={{ padding: "0.85rem", borderBottom: `1.5px solid ${C.border}`, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <input
              type="text"
              placeholder="Search bar"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: "100%",
                padding: "0.55rem 0.8rem",
                borderRadius: 10,
                border: `1.5px solid ${C.border}`,
                background: C.bg,
                fontSize: "0.82rem",
                color: C.text1,
                outline: "none"
              }}
            />
            <button
              onClick={() => setShowCreateGroup(true)}
              style={{
                width: "100%",
                padding: "0.55rem",
                borderRadius: 10,
                border: `1.5px dashed ${C.amber}`,
                background: "transparent",
                color: C.amberDark,
                fontSize: "0.78rem",
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.25rem"
              }}
            >
              ➕ Create New Group
            </button>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: "0.6rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {sortedSessions.map(s => {
              const isSelected = s.id === selectedId;
              return (
                <div
                  key={s.id}
                  onClick={() => setSelectedId(s.id)}
                  style={{
                    padding: "0.8rem 1rem",
                    borderRadius: 12,
                    cursor: "pointer",
                    background: isSelected ? C.amberBg : "transparent",
                    border: `1.5px solid ${isSelected ? C.amber : C.border}`,
                    transition: "all 0.15s"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.15rem" }}>
                    <span style={{ fontWeight: 700, fontSize: "0.82rem", color: isSelected ? C.amberDark : C.text1 }}>
                      {s.name}
                    </span>
                    <span style={{
                      fontSize: "0.62rem",
                      color: s.status === "Online" || s.status === "Active Group" ? '#22C55E' : s.status === "Away" ? C.amber : C.text3,
                      fontWeight: 600
                    }}>
                      • {s.status}
                    </span>
                  </div>
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: "0.2rem"
                  }}>
                    <div style={{
                      fontSize: "0.72rem",
                      color: C.text3,
                      textOverflow: "ellipsis",
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                      flex: 1
                    }}>
                      {s.preview}
                    </div>
                    {s.unreadCount > 0 && (
                      <span style={{
                        background: C.amber,
                        color: "#fff",
                        fontSize: "0.65rem",
                        fontWeight: 850,
                        borderRadius: 10,
                        minWidth: 16,
                        height: 16,
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "0 0.35rem",
                        marginLeft: "0.5rem",
                        flexShrink: 0
                      }}>
                        {s.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
            {sortedSessions.length === 0 && (
              <div style={{ padding: "1rem", textAlign: "center", fontSize: "0.78rem", color: C.text3 }}>
                No chats found
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Chat Section */}
        <div style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          background: C.surface,
          border: `1.5px solid ${C.border}`,
          borderRadius: 16,
          overflow: "hidden"
        }}>
          
          {/* Chat Header */}
          <div style={{
            padding: "0.85rem 1.25rem",
            background: "#F9F8F6",
            borderBottom: `1.5px solid ${C.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}>
            <div 
              onClick={handleOpenInfoCard}
              style={{ cursor: "pointer" }}
              title="Click to view details"
            >
              <div style={{ fontWeight: 800, fontSize: "0.92rem", color: C.text1 }}>
                {sessions.find(s => s.id === selectedId)?.name || "Chat Session"}
              </div>

              <div style={{ fontSize: "0.7rem", color: C.text3, marginTop: "0.1rem", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                <span>Active •</span>
                <span style={{ 
                  color: (()=>{
                    const status = sessions.find(s => s.id === selectedId)?.status;
                    if (status === "Online" || status === "Active Group") return C.green;
                    if (status === "Away") return C.amber;
                    return C.text3;
                  })(),
                  fontWeight: 600
                }}>
                  {sessions.find(s => s.id === selectedId)?.status}
                </span>
              </div>
            </div>

            <button
              onClick={handleOpenInfoCard}
              disabled={loadingMembers}
              style={{
                background: "none",
                border: `1.5px solid ${C.border}`,
                borderRadius: 8,
                padding: "0.35rem 0.65rem",
                fontSize: "0.7rem",
                color: C.text2,
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.25rem",
                opacity: loadingMembers ? 0.6 : 1
              }}
            >
              <span>ℹ️</span> {loadingMembers ? "Loading..." : "Info"}
            </button>
          </div>

          {/* Messages Display */}
          <div style={{
            flex: 1,
            overflowY: "auto",
            padding: "1.25rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
            background: "#FBFBFA"
          }}>
            {activeSession?.messages?.map(msg => {
              const isMe = msg.sender === "me";
              return (
                <div
                  key={msg.id}
                  style={{
                    display: "flex",
                    justifyContent: isMe ? "flex-end" : "flex-start",
                    width: "100%"
                  }}
                >
                  <div style={{
                    maxWidth: "70%",
                    padding: "0.6rem 0.85rem",
                    borderRadius: 12,
                    background: isMe ? C.amberBg : C.surface,
                    border: `1px solid ${isMe ? C.amber : C.border}`,
                    boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
                  }}>
                    {isGroup && msg.senderName && (
                      <div style={{
                        fontSize: "0.68rem",
                        fontWeight: 700,
                        color: isMe ? C.amberDark : C.amber,
                        marginBottom: "0.2rem",
                        textAlign: "left"
                      }}>
                        {msg.senderName}
                      </div>
                    )}
                    <div style={{
                      fontSize: "0.8rem",
                      color: C.text1,
                      lineHeight: "1.25rem",
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word"
                    }}>
                      {msg.text}
                    </div>
                    <div style={{
                      fontSize: "0.58rem",
                      color: C.text3,
                      textAlign: "right",
                      marginTop: "0.25rem"
                    }}>
                      {msg.time}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input Box */}
          <div style={{
            padding: "0.85rem 1.25rem",
            background: C.surface,
            borderTop: `1.5px solid ${C.border}`,
            display: "flex",
            gap: "0.75rem",
            alignItems: "center"
          }}>
            {isRecordingVoice && (
              <style>{`
                @keyframes pulse-red {
                  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
                  70% { transform: scale(1.08); box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
                  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
                }
              `}</style>
            )}
            <input
              type="text"
              placeholder={isRecordingVoice ? "Listening... Speak now" : "Type your message..."}
              value={inputMessage}
              onChange={e => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isRecordingVoice}
              style={{
                flex: 1,
                padding: "0.55rem 0.8rem",
                borderRadius: 10,
                border: `1.5px solid ${C.border}`,
                background: isRecordingVoice ? "#FFF5F5" : C.bg,
                fontSize: "0.82rem",
                color: C.text1,
                outline: "none",
                transition: "all 0.2s"
              }}
            />
            <button
              onClick={toggleVoiceRecording}
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                border: "none",
                background: isRecordingVoice ? C.red : C.amber,
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.1rem",
                cursor: "pointer",
                animation: isRecordingVoice ? "pulse-red 1.5s infinite" : "none",
                transition: "all 0.2s",
                flexShrink: 0
              }}
              title={isRecordingVoice ? "Stop voice listening" : "Speak to send message"}
            >
              🎤
            </button>
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputMessage.trim() || isRecordingVoice}
              style={{
                background: inputMessage.trim() && !isRecordingVoice ? C.amber : "#E5E2DA",
                color: inputMessage.trim() && !isRecordingVoice ? "#FFFFFF" : C.text3,
                border: "none",
                borderRadius: 10,
                padding: "0.55rem 1rem",
                fontSize: "0.82rem",
                fontWeight: 700,
                cursor: inputMessage.trim() && !isRecordingVoice ? "pointer" : "default",
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: 40,
                flexShrink: 0
              }}
              title="Send Message"
            >
              Send
            </button>
          </div>

        </div>

      </div>

      {/* Create Group Modal Overlay */}
      {showCreateGroup && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(10, 10, 15, 0.4)",
          backdropFilter: "blur(8px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
          padding: "1rem"
        }}>
          <div style={{
            background: C.surface,
            border: `1.5px solid ${C.border}`,
            borderRadius: 20,
            width: "100%",
            maxWidth: 480,
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            display: "flex",
            flexDirection: "column",
            maxHeight: "90vh",
            overflow: "hidden"
          }}>
            <div style={{ padding: "1.25rem 1.5rem", borderBottom: `1.5px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontWeight: 800, fontSize: "0.95rem", color: C.text1, margin: 0 }}>Create New Group</h3>
              <button 
                onClick={() => setShowCreateGroup(false)}
                style={{ background: "none", border: "none", fontSize: "1.2rem", cursor: "pointer", color: C.text3 }}
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleCreateGroupSubmit} style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
              <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem", flex: 1, overflowY: "auto" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                  <label style={{ fontSize: "0.72rem", fontWeight: 700, color: C.text2 }}>Group Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter group name..."
                    value={newGroupName}
                    onChange={e => setNewGroupName(e.target.value)}
                    style={{
                      padding: "0.6rem 0.8rem",
                      borderRadius: 10,
                      border: `1.5px solid ${C.border}`,
                      background: C.bg,
                      fontSize: "0.82rem",
                      color: C.text1,
                      outline: "none"
                    }}
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                  <label style={{ fontSize: "0.72rem", fontWeight: 700, color: C.text2 }}>Description (Optional)</label>
                  <textarea
                    placeholder="Enter short description..."
                    value={newGroupDesc}
                    onChange={e => setNewGroupDesc(e.target.value)}
                    rows={2}
                    style={{
                      padding: "0.6rem 0.8rem",
                      borderRadius: 10,
                      border: `1.5px solid ${C.border}`,
                      background: C.bg,
                      fontSize: "0.82rem",
                      color: C.text1,
                      outline: "none",
                      resize: "none"
                    }}
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem", flex: 1, minHeight: 150 }}>
                  <label style={{ fontSize: "0.72rem", fontWeight: 700, color: C.text2 }}>Select Members</label>
                  <div style={{
                    flex: 1,
                    border: `1.5px solid ${C.border}`,
                    borderRadius: 10,
                    overflowY: "auto",
                    background: C.bg,
                    padding: "0.5rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.25rem"
                  }}>
                    {allUsers.filter(u => u.email !== store.user?.email).map((user: any) => {
                      const isSelected = selectedUserIds.includes(user.id);
                      return (
                        <div
                          key={user.id}
                          onClick={() => toggleUserSelection(user.id)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.6rem",
                            padding: "0.45rem 0.6rem",
                            borderRadius: 8,
                            cursor: "pointer",
                            background: isSelected ? C.amberBg : "transparent",
                            transition: "background 0.1s"
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            readOnly
                            style={{ accentColor: C.amber }}
                          />
                          <div style={{ display: "flex", flexDirection: "column" }}>
                            <span style={{ fontSize: "0.78rem", fontWeight: 600, color: C.text1 }}>{user.name}</span>
                            <span style={{ fontSize: "0.65rem", color: C.text3 }}>{user.email}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div style={{ padding: "1rem 1.5rem", borderTop: `1.5px solid ${C.border}`, display: "flex", justifyContent: "flex-end", gap: "0.75rem", background: "#F9F8F6" }}>
                <button
                  type="button"
                  onClick={() => setShowCreateGroup(false)}
                  style={{
                    padding: "0.55rem 1.25rem",
                    borderRadius: 10,
                    border: `1.5px solid ${C.border}`,
                    background: C.surface,
                    color: C.text2,
                    fontWeight: 700,
                    fontSize: "0.82rem",
                    cursor: "pointer"
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: "0.55rem 1.25rem",
                    borderRadius: 10,
                    border: "none",
                    background: C.amber,
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: "0.82rem",
                    cursor: "pointer"
                  }}
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User/Group Info Card Modal Overlay */}
      {showInfoCard && (() => {
        const isGroup = selectedId?.startsWith("group-") || selectedId === "group1";
        
        if (isGroup) {
          const currentGroup = sessions.find(s => s.id === selectedId);
          return (
            <div style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(10, 10, 15, 0.4)",
              backdropFilter: "blur(8px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999,
              padding: "1rem"
            }}>
              <div style={{
                background: C.surface,
                border: `1.5px solid ${C.border}`,
                borderRadius: 20,
                width: "100%",
                maxWidth: 480,
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                display: "flex",
                flexDirection: "column",
                maxHeight: "85vh",
                overflow: "hidden"
              }}>
                <div style={{ padding: "1.25rem 1.5rem", borderBottom: `1.5px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h3 style={{ fontWeight: 800, fontSize: "0.95rem", color: C.text1, margin: 0 }}>👥 Group Details</h3>
                  <button 
                    onClick={() => setShowInfoCard(false)}
                    style={{ background: "none", border: "none", fontSize: "1.2rem", cursor: "pointer", color: C.text3 }}
                  >
                    ✕
                  </button>
                </div>
                
                <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem", overflowY: "auto" }}>
                  <div>
                    <label style={{ fontSize: "0.68rem", fontWeight: 700, color: C.text3, textTransform: "uppercase", letterSpacing: "0.05em" }}>GROUP NAME</label>
                    <div style={{ fontSize: "1.1rem", fontWeight: 850, color: C.text1, marginTop: "0.15rem" }}>{currentGroup?.name}</div>
                  </div>

                  <div>
                    <label style={{ fontSize: "0.68rem", fontWeight: 700, color: C.text3, textTransform: "uppercase", letterSpacing: "0.05em" }}>DESCRIPTION</label>
                    <div style={{ fontSize: "0.82rem", color: C.text2, marginTop: "0.25rem", lineHeight: "1.3rem" }}>
                      {currentGroup?.preview || "No description provided for this group."}
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    <label style={{ fontSize: "0.68rem", fontWeight: 700, color: C.text3, textTransform: "uppercase", letterSpacing: "0.05em" }}>MEMBERS ({groupMembers.length})</label>
                    <div style={{
                      border: `1.5px solid ${C.border}`,
                      borderRadius: 12,
                      background: C.bg,
                      padding: "0.5rem",
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.35rem",
                      maxHeight: 200,
                      overflowY: "auto"
                    }}>
                      {groupMembers.map((m: any) => (
                        <div key={m.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.5rem 0.65rem", borderRadius: 8, background: C.surface, border: `1px solid ${C.border}` }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "0.1rem" }}>
                            <span style={{ fontSize: "0.8rem", fontWeight: 700, color: C.text1 }}>{m.name}</span>
                            <span style={{ fontSize: "0.68rem", color: C.text3 }}>{m.email}</span>
                          </div>
                          <span style={{
                            fontSize: "0.62rem",
                            fontWeight: 700,
                            padding: "0.2rem 0.5rem",
                            borderRadius: 6,
                            background: m.role === "admin" ? C.amberBg : C.bg,
                            color: m.role === "admin" ? C.amberDark : C.text2,
                            border: `1px solid ${m.role === "admin" ? C.amber : C.border}`
                          }}>
                            {m.role}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{ padding: "1rem 1.5rem", borderTop: `1.5px solid ${C.border}`, display: "flex", justifyContent: "flex-end", background: "#F9F8F6" }}>
                  <button
                    onClick={() => setShowInfoCard(false)}
                    style={{
                      padding: "0.55rem 1.25rem",
                      borderRadius: 10,
                      border: "none",
                      background: C.amber,
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: "0.82rem",
                      cursor: "pointer"
                    }}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          );
        } else {
          const userIdStr = selectedId?.replace("user-", "");
          const activeUser = allUsers.find(u => String(u.id) === userIdStr);
          
          return (
            <div style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(10, 10, 15, 0.4)",
              backdropFilter: "blur(8px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999,
              padding: "1rem"
            }}>
              <div style={{
                background: C.surface,
                border: `1.5px solid ${C.border}`,
                borderRadius: 20,
                width: "100%",
                maxWidth: 400,
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden"
              }}>
                <div style={{ padding: "1.25rem 1.5rem", borderBottom: `1.5px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h3 style={{ fontWeight: 800, fontSize: "0.95rem", color: C.text1, margin: 0 }}>👤 User Profile</h3>
                  <button 
                    onClick={() => setShowInfoCard(false)}
                    style={{ background: "none", border: "none", fontSize: "1.2rem", cursor: "pointer", color: C.text3 }}
                  >
                    ✕
                  </button>
                </div>
                
                <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <div style={{
                      width: 54,
                      height: 54,
                      borderRadius: "50%",
                      background: C.amberBg,
                      border: `1.5px solid ${C.amber}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.5rem",
                      fontWeight: 800,
                      color: C.amberDark
                    }}>
                      {activeUser?.name?.charAt(0).toUpperCase() || "?"}
                    </div>
                    <div>
                      <div style={{ fontSize: "1.05rem", fontWeight: 800, color: C.text1 }}>{activeUser?.name}</div>
                      <span style={{
                        fontSize: "0.62rem",
                        fontWeight: 700,
                        padding: "0.15rem 0.45rem",
                        borderRadius: 6,
                        background: C.bg,
                        color: C.text2,
                        border: `1px solid ${C.border}`,
                        marginTop: "0.25rem",
                        display: "inline-block"
                      }}>
                        {activeUser?.role || "Developer"}
                      </span>
                    </div>
                  </div>

                  <div style={{ borderTop: `1.5px solid ${C.border}`, paddingTop: "1rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    <div>
                      <label style={{ fontSize: "0.68rem", fontWeight: 700, color: C.text3, textTransform: "uppercase", letterSpacing: "0.05em" }}>EMAIL ADDRESS</label>
                      <div style={{ fontSize: "0.85rem", color: C.text1, marginTop: "0.15rem" }}>{activeUser?.email}</div>
                    </div>
                    <div>
                      <label style={{ fontSize: "0.68rem", fontWeight: 700, color: C.text3, textTransform: "uppercase", letterSpacing: "0.05em" }}>ACCOUNT STATUS</label>
                      <div style={{ fontSize: "0.82rem", color: activeUser?.is_active ? C.green : C.red, fontWeight: 700, marginTop: "0.15rem", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                        <span>●</span> {activeUser?.is_active ? "Verified & Active" : "Inactive"}
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ padding: "1rem 1.5rem", borderTop: `1.5px solid ${C.border}`, display: "flex", justifyContent: "flex-end", background: "#F9F8F6" }}>
                  <button
                    onClick={() => setShowInfoCard(false)}
                    style={{
                      padding: "0.55rem 1.25rem",
                      borderRadius: 10,
                      border: "none",
                      background: C.amber,
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: "0.82rem",
                      cursor: "pointer"
                    }}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          );
        }
      })()}

    </div>
  );
}
