import { useState, useEffect } from "react";
import { useAppStore } from "../../store/SessionStore";
import { sharedVoiceService } from "../../shared_voice";

export function useSession() {
  const store = useAppStore();
  const [sessionId, setSessionId]     = useState<string|null>(sharedVoiceService.getSessionId());
  const [isListening, setIsListening] = useState(sharedVoiceService.getListening());
  const [agentStatus, setAgentStatus] = useState("Speak or type a command...");
  const [level, setLevel]             = useState(0);
  const [transcripts, setTranscripts] = useState<any[]>([]);

  useEffect(() => {
    // Sync listening status using standard Zustand state tracking
    const listenUnsub = useAppStore.subscribe(
      (s: any) => {
        setIsListening(s.isListeningGlobal);
        setSessionId(sharedVoiceService.getSessionId());
      }
    );
    
    // Sync level meter
    const levelUnsub = sharedVoiceService.registerLevel((lvl) => setLevel(lvl));
    
    // Sync status updates
    const statusUnsub = sharedVoiceService.registerStatus((status) => setAgentStatus(status));
    
    // Sync transcript entries locally
    const transUnsub = sharedVoiceService.registerTranscript((t) => {
      setTranscripts(ts => [...ts.slice(-299), t]);
    });

    return () => {
      listenUnsub();
      levelUnsub();
      statusUnsub();
      transUnsub();
    };
  }, [store]);

  function toggle(usecase?: string) {
    sharedVoiceService.toggle(usecase);
  }

  function stop() {
    sharedVoiceService.stop();
  }

  return { sessionId, isListening, agentStatus, level, toggle, stop, transcripts };
}
