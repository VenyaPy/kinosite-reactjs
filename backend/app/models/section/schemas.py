from pydantic import BaseModel, HttpUrl, Field


class Selection(BaseModel):
    id: str
    name: str | None
    alternativeName: str | None
    shortDescription: str | None = Field(default="Описание не найдено")
    description: str | None
    year: int | None
    poster: str | None | dict
    watch_url: HttpUrl | None
