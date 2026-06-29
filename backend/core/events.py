import asyncio
import logging
from backend.queues.bus import bus

logger = logging.getLogger("pilot.events")
_tasks: list[asyncio.Task] = []


async def startup_pipeline():
    from backend.pipeline.vad.silero_vad import SileroVADWorker
    from backend.pipeline.vad.smart_turn import SmartTurnWorker
    from backend.pipeline.diarizer import DiarizerWorker
    from backend.pipeline.identity_resolver import IdentityResolverWorker
    from backend.pipeline.asr_worker import ASRWorker
    from backend.pipeline.front_llm import FrontLLMWorker
    from backend.core.bg_supervisor import bg_supervisor

    workers = [
        SileroVADWorker(bus),
        SmartTurnWorker(bus),
        DiarizerWorker(bus),
        IdentityResolverWorker(bus),
        ASRWorker(bus),
        FrontLLMWorker(bus),
    ]
    for w in workers:
        t = asyncio.create_task(w.run(), name=type(w).__name__)
        _tasks.append(t)
        logger.info(f"Worker started: {type(w).__name__}")
    #This is a Job Scheduler. It doesn't process audio; instead, it waits for the FrontLLMWorker to say: "Here is a background job (e.g., flight booking, slide creation, database write). Run this."
    #If the background agent was placed inside the main pipeline list, a slow task would block the queues, freezing speech recognition and audio playback.
    t = asyncio.create_task(bg_supervisor.run(), name="BGSupervisor")
    _tasks.append(t)


async def shutdown_pipeline():
    for t in _tasks:
        t.cancel()
    await asyncio.gather(*_tasks, return_exceptions=True)
    logger.info("All workers stopped")
