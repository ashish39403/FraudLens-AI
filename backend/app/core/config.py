# read the env variables
from pydantic_settings import BaseSettings , SettingsConfigDict


class Settings(BaseSettings):
    database_url: str
    app_name: str = "Fraud AML Investigation Platform"
    environment: str = "local"
    
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")
    
settings =Settings()
    