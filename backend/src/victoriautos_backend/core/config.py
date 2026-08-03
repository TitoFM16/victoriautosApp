from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    environment: str = "development"

    # Postgres (async SQLAlchemy, asyncpg driver)
    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/victoriautos"

    # JWT auth
    secret_key: str = Field(..., description="Signing key for JWT access tokens")
    jwt_algorithm: str = "HS256"
    access_token_expire_seconds: int = 3600

    # reCAPTCHA (google siteverify)
    recaptcha_secret_key: str = ""
    recaptcha_verify_url: str = "https://www.google.com/recaptcha/api/siteverify"

    # CORS - explicit origin whitelist (credentialed cookies require exact origins, no "*")
    cors_origins: list[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:3005",
        "https://victoriautos.com",
        "https://www.victoriautos.com",
        "https://d2gyx3l0a1l011.cloudfront.net",
    ]

    # Local image storage (mirrors old public/images layout)
    images_dir: Path = BASE_DIR / "data" / "images"
    max_upload_size_bytes: int = 20 * 1024 * 1024
    webp_quality: int = 80

    # Plate lookup external APIs
    simit_api_url: str = "https://simit-api.onrender.com/search"
    fasecolda_api_url: str = "https://fasecolda-api.onrender.com/search"
    plate_lookup_max_retries: int = 5

    # PDF contract template
    contract_template_path: Path = (
        BASE_DIR / "templates" / ("Contrato-Compraventa-de-Vehiculo-Automotor-Minerva.pdf")
    )

    @property
    def vehiculos_images_dir(self) -> Path:
        return self.images_dir / "vehiculos"

    @property
    def ofertas_images_dir(self) -> Path:
        return self.images_dir / "ofertas"


settings = Settings()
