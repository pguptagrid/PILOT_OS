from pydantic_settings import BaseSettings
from typing import Optional
from dotenv import load_dotenv
import os

# Resolve .env relative to this file's directory (backend/), not the CWD.
_HERE = os.path.dirname(os.path.abspath(__file__))
_ENV_FILE = os.path.join(_HERE, "..", ".env")  # backend/.env
load_dotenv(_ENV_FILE)
class Settings(BaseSettings):
    # App
    APP_NAME: str = "PILOT"
    SECRET_KEY: str = os.getenv('SECRET_KEY')
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7

    # DB
    DATABASE_URL: str = os.getenv('DATABASE_URL') or 'sqlite+aiosqlite:///./data/pilot.db'

    # Providers — swap via .env
    ASR_PROVIDER: str = os.getenv('ASR_PROVIDER') or "whisper"
    TTS_PROVIDER: str = os.getenv('TTS_PROVIDER') or "edge_tts"
    DIAR_PROVIDER: str = os.getenv('DIAR_PROVIDER') or "pyannote"
    EMBED_PROVIDER: str = os.getenv('EMBED_PROVIDER') or "wespeaker"
    FRONT_LLM_PROVIDER: str = os.getenv('FRONT_LLM_PROVIDER') or "ollama"
    BG_LLM_PROVIDER: str = os.getenv('BG_LLM_PROVIDER') or "ollama"
    
    # Hardware acceleration preferences — toggle between 'cpu' and 'mps' (for Apple Silicon CoreML)
    PREFERRED_DEVICE: str = "cpu"

    # Model settings
    WHISPER_MODEL: str = "large-v3-turbo"
    WHISPER_LANGUAGE: Optional[str] = "en"
    OLLAMA_MODEL: str = "qwen2.5:7b"
    OLLAMA_BASE_URL: str = "http://127.0.0.1:11434"
    GEMINI_API_KEY: Optional[str] = os.getenv('GEMINI_API_KEY')
    GROQ_API_KEY: Optional[str] = os.getenv('GROQ_API_KEY')
    SERPAPI_KEY: Optional[str] = None

    # MCP settings
    PILOT_MCP_COMMAND: str = os.getenv('PILOT_MCP_COMMAND') or 'node'
    PILOT_MCP_ARGS: Optional[str] = os.getenv('PILOT_MCP_ARGS')
    PILOT_MCP_TOOL: Optional[str] = os.getenv('PILOT_MCP_TOOL')
    TAVILY_API_KEY: Optional[str] = os.getenv('TAVILY_API_KEY')
    
    

    # Speaker identity
    COSINE_THRESHOLD: float = 0.50
    EMBEDDING_DIM: int = 512

    # Queue sizes (back-pressure)
    RAW_AUDIO_Q_SIZE: int = 100
    TURN_Q_SIZE: int = 30
    LABELED_TURN_Q_SIZE: int = 30
    TRANSCRIPT_Q_SIZE: int = 50
    EVENT_Q_SIZE: int = 500
    RING_BUFFER_N: int = 50

    # Policy gate
    CONFIRM_TIMEOUT_S: int = 10
    # DESTRUCTIVE_TOOLS: list = ["flight_book", "ticket_close"]
    DESTRUCTIVE_TOOLS: list = ["flight_book", "ppt_delete_slide"]

    # Email (leave blank for dev console output)
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: Optional[str] = os.getenv('SMTP_USER')
    SMTP_PASS: Optional[str] = os.getenv("SMPT_PASS")
    EMAIL_FROM: str = os.getenv('SMTP_USER') or  "pilot@localhost"

    class Config:
        env_file = _ENV_FILE  # always load backend/.env regardless of CWD
        extra = "ignore"

settings = Settings()
