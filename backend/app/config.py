from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional
from pathlib import Path
from dotenv import load_dotenv

# Get the directory where this config file is located
BASE_DIR = Path(__file__).resolve().parent.parent

# Explicitly load .env file
load_dotenv(BASE_DIR / ".env")

class Settings(BaseSettings):
    openai_api_key: str = "your-openai-key-here"  # Default placeholder
    frontend_url: str = "http://localhost:5173"

    # Supabase (optional - for auth and database)
    supabase_url: Optional[str] = None
    supabase_anon_key: Optional[str] = None
    supabase_service_key: Optional[str] = None

    model_config = SettingsConfigDict(
        env_file=str(BASE_DIR / ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
