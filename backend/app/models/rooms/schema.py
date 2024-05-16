from pydantic import BaseModel


class Room(BaseModel):
    id: int
    room_id: str
    members: list
    movieId: str

class CreateRoomRequest(BaseModel):
    movieId: str
