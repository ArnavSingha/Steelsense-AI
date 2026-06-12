"""Application configuration using pydantic-settings."""
from pydantic_settings import BaseSettings
from functools import lru_cache
import os


# Resolve absolute path to .env file
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
ENV_PATH = os.path.join(BASE_DIR, ".env")


class Settings(BaseSettings):
    # API Keys
    openai_api_key: str = ""
    groq_api_key: str = ""
    gemini_api_key: str = ""

    # Database
    database_url: str = "sqlite+aiosqlite:///./maintenance_wizard.db"

    # Vector DB
    chroma_persist_dir: str = "./chroma_db"

    # App
    secret_key: str = "dev_secret_key_change_in_prod"
    environment: str = "development"
    log_level: str = "INFO"
    app_name: str = "Maintenance Wizard"
    version: str = "1.0.0"

    # CORS
    allowed_origins: list = ["http://localhost:3000", "http://localhost:5173", "*"]

    class Config:
        env_file = ENV_PATH
        case_sensitive = False
        extra = "allow"


@lru_cache()
def get_settings() -> Settings:
    s = Settings()
    # Inject into os.environ for other modules/libraries that rely on environment variables
    if s.gemini_api_key:
        os.environ["GEMINI_API_KEY"] = s.gemini_api_key
    if s.openai_api_key:
        os.environ["OPENAI_API_KEY"] = s.openai_api_key
    if s.groq_api_key:
        os.environ["GROQ_API_KEY"] = s.groq_api_key
    return s


settings = get_settings()

