from pydantic import BaseModel, HttpUrl, Field


class Selection(BaseModel):
    id: str
    type: str
    name: str | None
    alternativeName: str | None
    shortDescription: str | None = Field(default="Описание не найдено")
    description: str | None
    year: int | None
    poster: HttpUrl | None | dict
    watch_url: HttpUrl
