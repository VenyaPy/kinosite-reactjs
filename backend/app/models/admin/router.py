from fastapi import APIRouter, HTTPException
from starlette import status

from backend.app.models.rooms.roomdao import RoomDAO
from backend.app.models.users.dao import UserDAO
from backend.app.models.youtube.dao import YouTubeDAO

admin_router = APIRouter(
    prefix='/admin',
    tags=["Админ-панель"]
)


@admin_router.get(path="/get_all_users")
async def get_all_users():
    users = await UserDAO.find_all_no_filters()
    return users


@admin_router.delete(path="/delete_user")
async def delete_user(id: int):
    await UserDAO.delete(id=id)
    return {"message": f"Успешное удаление пользователя {id}"}


@admin_router.get(path="/get_all_rooms")
async def get_all_rooms():
    rooms = await RoomDAO.find_all_no_filters()
    return rooms


@admin_router.delete(path="/delete_room")
async def delete_room(id: int):
    await RoomDAO.delete(id=id)
    return {"message": "Комната удалена"}


@admin_router.get(path="/get_all_yt_rooms")
async def get_yt_rooms():
    rooms = await YouTubeDAO.find_all_no_filters()
    return rooms


@admin_router.delete(path="/delete_yt_room")
async def delete_yt_room(room: int):
    await YouTubeDAO.delete(id=room)
    return {"message": "Комната успешно удалена"}