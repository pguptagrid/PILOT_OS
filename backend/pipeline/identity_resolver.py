'''
asynchronous pipeline worker responsible for identifying who is speaking using voice biometrics. It sits in the middle of PILOT's real-time audio pipeline.
'''

import asyncio, logging
from backend.queues.bus import QueueBus, LabeledTurn

logger = logging.getLogger("pilot.identity")

class IdentityResolverWorker:
    def __init__(self, bus: QueueBus):
        self.bus = bus

    async def run(self):
        logger.info("IdentityResolver worker started")
        # The previous worker in the pipeline (the Diarizer) places active audio segments into the identity_q queue.
        while True:
            turn: LabeledTurn = await self.bus.identity_q.get()   # ← reads identity_q
            # The resolver reads these segments as LabeledTurn objects containing raw PCM audio.
            try:
                from backend.services.enrollment import identify_speaker
                speaker_id, role, confidence = await identify_speaker(turn.pcm)
                # It calls the identify_speaker service with the audio.
                turn.speaker_id = speaker_id or "You"
                turn.role = role or "user"
                turn.confidence = confidence

            # if the biometric match fails or throwns it uses safe defaults such that it can recognize an unknown person also. 
            except Exception as e:
                logger.error(f"Identity error: {e}")
                turn.speaker_id = "You"
                turn.role = "user"
                turn.confidence = 0.8

            await self.bus.labeled_turn_q.put(turn)   # ← writes labeled_turn_q
