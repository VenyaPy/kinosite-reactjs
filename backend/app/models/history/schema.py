from pydantic import BaseModel

class MovieHistoryResponse(BaseModel):
    id: int
    name: str
    description: str
    poster_url: str
    id_film: int
    id_user: int

    class Config:
        from_attributes = True