from pydantic import BaseModel
from datetime import datetime


class Room(BaseModel):
    id: int
    room_id: str
    movie_name: str
    movie_url: str
    movie_poster: str
    username: str
    time: datetime

    class Config:
        from_attributes = True