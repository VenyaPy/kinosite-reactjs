from uuid import uuid4
from fastapi import APIRouter, Depends

from models.users.dependencies import get_current_user
from models.users.model import Users
from models.youtube.dao import YouTubeDAO

youtube_router = APIRouter(
    prefix="/youtube_room",
    tags=["Комнаты Ютуба"]
)


@youtube_router.post("/create_room", summary="Создание комнаты")
async def create_youtube_room(current_user: Users = Depends(get_current_user)):
    if current_user:
        video_uuid = str(uuid4())
        await YouTubeDAO.add(youtube_room_id=video_uuid, members=str(current_user.id))
        return {"video_id": f"{video_uuid}"}
    return {"error": "Вы не авторизованы"}


@youtube_router.get("/{youtube_room_id}")
async def get_room(youtube_room_id: str):
    room = await YouTubeDAO.find_one_or_none(youtube_room_id=youtube_room_id)
    if room:
        return {"room_id": youtube_room_id, "members": room.members}
    return {"error": f"Can not find room {youtube_room_id}"}


@youtube_router.post("/join_user/{youtube_room_id}")
async def join_user_youtube(youtube_room_id: str, current_user: Users = Depends(get_current_user)):
    if current_user:
        updated_rows = await YouTubeDAO.update_youtube_room(youtube_room_id=youtube_room_id, members=str(current_user.id))
        if updated_rows:
            return {"status": "joined"}
        return {"status": "room not found or user already in the room"}
    return {"error": "User not authenticated"}
