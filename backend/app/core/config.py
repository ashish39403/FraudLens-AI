# read the env variables
from pydantic_settings import BaseSettings , SettingsConfigDict


class Settings(BaseSettings):
    database_url: str
    app_name: str = "Fraud AML Investigation Platform"
    environment: str = "local"
    secret_key:str
    algorithm:str ="HS256"
    access_token_expire_minutes:int =30

    openai_api_key: str | None = None
    openai_base_url: str | None = None
    ai_model: str = "gpt-4o-mini"

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
    
