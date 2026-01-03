from pydantic_settings import BaseSettings, SettingsConfigDict, YamlConfigSettingsSource

from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent 

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=ROOT_DIR.parents[3] / ".env",
        env_file_encoding="utf-8",
        yaml_file=ROOT_DIR / "config.yaml",
    )
    qdrant_host: str
    qdrant_port: int

    @classmethod
    def settings_customise_sources(
        cls,
        settings_cls: type[BaseSettings],
        init_settings,
        env_settings,
        dotenv_settings,
        file_secret_settings,
    ):
        return (
            env_settings,
            dotenv_settings,
            YamlConfigSettingsSource(settings_cls),
            init_settings,
            file_secret_settings,
        )
    
settings = Settings()
