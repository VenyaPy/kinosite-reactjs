from pydantic import BaseModel, HttpUrl, Field


class PopularFilms(BaseModel):
    id: str
    type: str
    name: str
    alternativeName: str | None
    shortDescription: str | None = Field(default="Описание не найдено")
    description: str
    year: int
    poster: HttpUrl | None | dict
    watch_url: HttpUrl


