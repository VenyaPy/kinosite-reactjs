
from uuid import uuid4
from fastapi import WebSocket, APIRouter, Depends


from starlette.websockets import WebSocketDisconnect

from backend.app.models.rooms.roomdao import RoomDAO
from backend.app.models.rooms.schema import CreateRoomRequest
from backend.app.models.users.dependencies import get_current_user
from backend.app.models.users.model import Users

from typing import List


room_router = APIRouter(
    prefix="/room",
    tags=["Комнаты"]
)

connections = {}


@room_router.post("/create_room", summary="Создание комнаты")
async def create_room(request: CreateRoomRequest, current_user: Users = Depends(get_current_user)):
    if current_user:
        uuid_room = str(uuid4())
        await RoomDAO.add(room_id=uuid_room, movieId=request.movieId, members=current_user.id)
        return {"message": f"{uuid_room}"}
    return {"error": "User not authenticated"}


@room_router.get("/{room_id}", summary="Получение данных о комнате")
async def get_room(room_id: str):
    room = await RoomDAO.find_one_or_none(room_id=room_id)
    if room:
        return {"roomId": room.room_id, "movieId": room.movieId}
    return {"error": "Room not found"}


@room_router.post("/join_room/{room_id}", summary="Присоединение к комнате")
async def join_room(room_id: str, current_user: Users = Depends(get_current_user)):
    if current_user:
        room = await RoomDAO.find_one_or_none(room_id=room_id)
        if room:
            new_member = await RoomDAO.update_room(room_id=room_id, members=current_user.id)
            if new_member:
                return {"status": "joined"}
        return {"status": "room not found"}
    return {"error": "User not authenticated"}



