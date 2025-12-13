import asyncio
import logging
from livekit.agents import AutoSubscribe, JobContext, WorkerOptions, cli, llm
from livekit.agents.voice_assistant import VoiceAssistant
from livekit.plugins import openai, silero
from config import Config
from database.queries import get_data_by_category

logger = logging.getLogger("voice-agent")

class KrishiSathiAgent:
    def __init__(self):
        self.assistant = None
        
    async def entrypoint(self, ctx: JobContext):
        """Main entry point for voice agent"""
        
        initial_ctx = llm.ChatContext().append(
     role="system",
            text=(
                "You are Krishi Sathi, a helpful agricultural assistant for farmers. "
                "You provide information about weather forecasts, seeds and crops, "
                "pesticides and fertilizers, and government schemes. "
                "You can understand and respond in English, Hindi, Marathi, and Kannada. "
                "When a farmer asks a question, determine the category and provide accurate information."
            ),
        )
        
        await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)
        
        # Create voice assistant with OpenAI Realtime API
        assistant = VoiceAssistant(
            vad=silero.VAD.load(),
            stt=openai.STT(),
            llm=openai.LLM(model="gpt-4o-realtime-preview"),
            tts=openai.TTS(voice="alloy"),
            chat_ctx=initial_ctx,
        )
        
        assistant.start(ctx.room)
        
        await asyncio.sleep(1)
        await assistant.say("नमस्ते! मैं कृषि साथी हूं। मैं आपकी कैसे मदद कर सकता हूं?", allow_interruptions=True)

if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=KrishiSathiAgent().entrypoint))
