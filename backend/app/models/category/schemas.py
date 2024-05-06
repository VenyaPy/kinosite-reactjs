from pydantic import BaseModel, HttpUrl, Field


class Category(BaseModel):
    id: str | None
    type: str | None
    name: str | None
    alternativeName: str | None
    shortDescription: str | None = Field(default="Описание не найдено")
    description: str | None
    year: int | None
    poster: HttpUrl | None | dict
    watch_url: HttpUrl = Field(default=f"http://127.0.0.1:8000/v/player?id={id}")