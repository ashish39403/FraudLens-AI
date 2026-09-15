# read the env variables
from pydantic_settings import BaseSettings , SettingsConfigDict


class Settings(BaseSettings):
    database_url: str
    app_name: str = "Fraud AML Investigation Platform"
    environment: str = "local"
    secret_key:str
    algorithm:str ="HS256"
    access_token_expire_minutes:int =30
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"

    openai_api_key: str | None = None
    openai_base_url: str | None = None
    ai_model: str = "openai/gpt-5-nano"
    ai_request_timeout_seconds: int = 30
    ai_max_retries: int = 2

    langfuse_public_key: str | None = None
    langfuse_secret_key: str | None = None
    langfuse_host: str = "https://us.cloud.langfuse.com"
    langfuse_base_url: str | None = None

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )
    
    
settings =Settings()


def get_cors_origins() -> list[str]:
    return [
        origin.strip()
        for origin in settings.cors_origins.split(",")
        if origin.strip()
    ]
    
