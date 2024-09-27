from dataclasses import dataclass

from pydantic import BaseModel, HttpUrl, Field, field_validator


class Movie(BaseModel):
    id: int
    name: str
    alternativeName: str | None
    year: int
    description: str | None = Field(default='Описание отсутсвует')
    poster: HttpUrl | None
    watch_url: HttpUrl

@dataclass
class SearchEngineResponseElement:
    id: int
    name: str | None
    name_en: str | None






