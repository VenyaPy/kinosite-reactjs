from fastapi import APIRouter, Depends, HTTPException, status

from datetime import datetime
from typing import List
from uuid import uuid4

from backend.app.exceptions import UserNotAuth
from backend.app.models.users.model import Users
from backend.app.models.users.dependencies import get_current_user
from backend.app.models.session.sessiondao import SessionDAO
from backend.app.models.rooms.schema import Room


room_router = APIRouter(
    prefix="/rooms",
    tags=["Комнаты для просмотра"],
)


@room_router.post("/create_room/{movie_id}", summary="Создать комнату")
async def create_room(movie_url: str,
                      movie_name: str,
                      movie_poster: str,
                      current_user: Users = Depends(get_current_user)):
    if not current_user:
        raise UserNotAuth

    room_id = str(uuid4())

    session_data = {
        "room_id": room_id,
        "username": current_user.username,
        "movie_name": movie_name,
        "movie_poster": movie_poster,
        "movie_url": movie_url,
        "time": datetime.now()
    }

    try:
        new_session = await SessionDAO.add(**session_data)
        if not new_session:
            raise HTTPException(status_code=500, detail="Не удалось создать сессию")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка базы данных: {e}")

    return {"room_id": room_id}


@room_router.get("/me", response_model=List[Room], summary="Мои комнаты")
async def get_my_rooms(current_user: Users = Depends(get_current_user)):
    sessions = await SessionDAO.find_all_columns(username=current_user.username)
    if not sessions:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Комнаты не найдены")
    return sessions


@room_router.delete("/delete_room", summary="Удалить комнату")
async def delete_room(room_id: str, current_user: Users = Depends(get_current_user)):
    room = await SessionDAO.find_one_or_none(room_id=room_id)
    if room is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Комната не найдена")
    if room.username != current_user.username:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Недостаточно прав для операции")
    await SessionDAO.delete(room_id=room_id)
    return {"message": "Комната удалена"}




