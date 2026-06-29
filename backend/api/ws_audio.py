"""WebSocket /ws/audio — receives raw PCM from browser."""
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from backend.queues.bus import bus, RawAudioChunk
import time, logging

router = APIRouter()
logger = logging.getLogger("pilot.ws.audio")


@router.websocket("/ws/audio/{session_id}")
async def ws_audio(websocket: WebSocket, session_id: str):
    await websocket.accept()

    email = websocket.query_params.get("email")
    name = websocket.query_params.get("name")
    if email and name:
        from backend.core.session_state import get_state
        state = get_state(session_id)
        if not hasattr(state, "session_participants"):
            state.session_participants = {}
        state.session_participants[email] = name
        logger.info(f"[{session_id[:6]}] Registered WS audio participant: {name} ({email})")

    # Register session as LISTENING
    from backend.core.session_manager import session_manager, SessionState
    from backend.core.session_state import get_state
    if not session_manager.get(session_id):
        from backend.db.engine import AsyncSessionLocal
        from backend.db.models import Session as PilotSession
        from sqlalchemy import select
        db_user_id = 0
        usecase = "unknown"
        try:
            async with AsyncSessionLocal() as db:
                s = (await db.execute(select(PilotSession).where(PilotSession.session_id == session_id))).scalar_one_or_none()
                if s:
                    db_user_id = s.user_id or 0
                    usecase = s.usecase
        except Exception as e:
            logger.error(f"Failed to load session user from DB: {e}")
        session_manager.register(session_id, db_user_id, usecase)
    await session_manager.transition(session_id, SessionState.LISTENING)
    logger.info(f"Audio WS connected: {session_id[:8]}")

    try:
        while True:
            data = await websocket.receive_bytes()
            chunk = RawAudioChunk(pcm=data, session_id=session_id, timestamp=time.time())
            
            # ── BARGE-IN / INTERRUPTION TRIGGER ──
            # When the user starts speaking while PILOT is outputting TTS,
            # trigger an instantaneous interruption event to cut the audio off immediately.
            # Adds a brief 600ms grace ignore window right after tts_start_time begins playing
            # to let the browser player start up and clear out residual mic/background noise frames.
            state = get_state(session_id)
            if state.tts_playing:
                grace_window = 0.600  # 600ms grace window
                if time.time() - state.tts_start_time > grace_window:
                    # Calculate Root Mean Square (RMS) energy to verify active speech (ignoring silent/ambient frames)
                    import numpy as np
                    try:
                        audio_data = np.frombuffer(data, dtype=np.int16).astype(np.float32) / 32768.0
                        rms = float((audio_data ** 2).mean() ** 0.5) if len(audio_data) > 0 else 0.0
                    except Exception:
                        rms = 0.0

                    if rms > 0.025:  # threshold for active speech interruption
                        state.tts_playing = False
                        state.barge_in = True
                        logger.info(f"[{session_id[:6]}] Interruption detected (RMS: {rms:.4f})! Emitting barge_in event to client.")
                        await bus.emit_event("barge_in", {}, session_id)
                else:
                    logger.debug(f"[{session_id[:6]}] Ignoring early mic frame during 600ms TTS startup grace window.")
                
            try:
                bus.raw_audio_q.put_nowait(chunk)
            except Exception:
                pass  # backpressure — drop
    except WebSocketDisconnect:
        await session_manager.transition(session_id, SessionState.ENDED)
        logger.info(f"Audio WS disconnected: {session_id[:8]}")
