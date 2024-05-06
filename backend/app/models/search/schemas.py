from pydantic import BaseModel, HttpUrl, Field, field_validator


class Movie(BaseModel):
    kinopoisk_id: int
    title_ru: str
    title_en: str | None
    year: int
    rating: float | None
    about: str | None = Field(default='Описание отсутсвует')
    genres: str | None
    countries: str | None
    poster: HttpUrl | None
    trailer: str | None
    watch_url: HttpUrl

    @field_validator('genres')
    @classmethod
    def generes_title(cls, v: str) -> str:
        return v.title()






