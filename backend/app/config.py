"""
Configuración centralizada de la aplicación.
Carga las variables de entorno desde el archivo .env usando pydantic-settings.
"""

from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Esquema de configuración con valores por defecto seguros."""

    # Base de datos
    DATABASE_URL: str = "mysql+pymysql://root:root@localhost:3306/gamelife"

    # JWT
    SECRET_KEY: str = "dev-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # CORS
    FRONTEND_URL: str = "http://localhost:4200"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    """Retorna una instancia cacheada de la configuración."""
    return Settings()
