import logging
from uuid import uuid4
from fastapi import WebSocket, APIRouter, Depends


from starlette.websockets import WebSocketDisconnect

from backend.app.apiconnect.apivb import MovieSearch, KinopoiskId
from backend.app.models.rooms.roomdao import RoomDAO
from backend.app.models.rooms.schema import CreateRoomRequest
from backend.app.models.users.dao import UserDAO
from backend.app.models.users.dependencies import get_current_user
from backend.app.models.users.model import Users

from typing import List


room_router = APIRouter(
    prefix="/room",
    tags=["Комнаты"]
)

rooms_router = APIRouter(
    prefix="/rooms",
    tags=["Все комнаты"]
)

connections = {}


@room_router.post("/create_room", summary="Создание комнаты")
async def create_room(
        request: CreateRoomRequest,
        current_user: Users = Depends(get_current_user)
):
    if current_user:
        uuid_room = str(uuid4())
        await RoomDAO.add(
            room_id=uuid_room,
            movieId=request.movieId,
            members=current_user.id,
            username=current_user.username
        )
        return {"message": f"{uuid_room}"}
    return {"error": "User not authenticated"}


@room_router.post("/users/get_username")
async def get_user(current_user: Users = Depends(get_current_user)):
    username = current_user.username
    return {f"{username}"}


@room_router.get("/{room_id}", summary="Получение данных о комнате")
async def get_room(room_id: str):
    room = await RoomDAO.find_one_or_none(room_id=room_id)
    if room:
        return {"roomId": room.room_id, "movieId": room.movieId}
    return {"error": "Room not found"}


@rooms_router.get("/all_rooms", summary="Все комнаты")
async def get_all_rooms():
    rooms = await RoomDAO.get_all()
    rooms_list = []

    for room in rooms:
        try:
            id = int(room.movieId)
            movie = await KinopoiskId.kinopoisk_api(id=id)
            if not movie:
                logging.warning(f"No movie found for movieId {room.movieId}")
                continue

            member_ids = room.members.split(',')
            profiles = []

            for member_id in member_ids:
                profile = await UserDAO.find_one_or_none(id=member_id)
                if profile:
                    profiles.append(profile)
                else:
                    logging.warning(f"No user found with id {member_id}")

            if not profiles:
                continue

            first_user = profiles[0].username
            additional_viewers = len(profiles) - 1

            if additional_viewers == 1:
                additional_text = f" и ещё {additional_viewers} зритель"
            elif 2 <= additional_viewers <= 4:
                additional_text = f" и ещё {additional_viewers} зрителя"
            else:
                additional_text = f" и ещё {additional_viewers} зрителей" if additional_viewers > 0 else ""

            rooms_list.append({
                "roomId": room.room_id,
                "member": first_user + additional_text,
                "name": movie.get("name", "Unknown"),
                "poster": movie.get("poster", "No poster available"),
                "watch": f"http://localhost:5173/shared/{room.room_id}"
            })
        except ValueError:
            logging.error(f"Invalid movieId {room.movieId}, cannot convert to int")
        except Exception as e:
            logging.error(f"Error fetching movies for movieId {room.movieId}: {e}")

    return rooms_list


@room_router.post("/join_room/{room_id}", summary="Присоединение к комнате")
async def join_room(room_id: str, current_user: Users = Depends(get_current_user)):
    if current_user:
        updated_rows = await RoomDAO.update_room(room_id=room_id, members=str(current_user.id))
        if updated_rows:
            return {"status": "joined"}
        return {"status": "room not found or user already in the room"}
    return {"error": "User not authenticated"}



