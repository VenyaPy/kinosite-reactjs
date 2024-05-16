import asyncio
from uuid import uuid4
from fastapi import FastAPI, WebSocket, APIRouter, Depends
from typing import List

from starlette.websockets import WebSocketDisconnect

from backend.app.dao.dao import active_connections
from backend.app.models.rooms.roomdao import RoomDAO
from backend.app.models.rooms.schema import CreateRoomRequest
from backend.app.models.users.dependencies import get_current_user
from backend.app.models.users.model import Users

room_router = APIRouter(
    prefix="/room",
    tags=["Комнаты"])


@room_router.post("/create_room", summary="Создание комнаты")
async def create_room(request: CreateRoomRequest, current_user: Users = Depends(get_current_user)):
    try:
        if current_user:
            uuid_room = str(uuid4())
            attempt = 0
            while attempt < 5:
                try:
                    await RoomDAO.add(room_id=uuid_room, movieId=request.movieId, members=current_user.id)
                    return {"message": f"{uuid_room}"}
                except Exception as e:
                    if "database is locked" in str(e):
                        attempt += 1
                        print(f"Database is locked, retrying... attempt {attempt}")
                        await asyncio.sleep(1)
                    else:
                        raise
            return {"error": "Failed to create room after multiple attempts due to database lock"}
        return {"error": "User not authenticated"}
    except Exception as e:
        print(e)
        return {"error": str(e)}


@room_router.get("/{room_id}", summary="Получение данных о комнате")
async def get_room(room_id: str):
    room = await RoomDAO.find_one_or_none(room_id=room_id)
    if room:
        print(f"Room found: {room}")
        return {"roomId": room.room_id, "movieId": room.movieId}
    print("Room not found")
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


@room_router.websocket("/ws/{room_id}")
async def websocket_endpoint(websocket: WebSocket, room_id: str):
    await websocket.accept()
    room = await RoomDAO.find_one_or_none(room_id=room_id)
    if room:
        await add_connection(room_id, websocket)
        try:
            while True:
                data = await websocket.receive_text()
                for ws in active_connections.get(room_id, []):
                    if ws != websocket:
                        await ws.send_text(data)
        except WebSocketDisconnect:
            await remove_connection(room_id, websocket)


async def add_connection(room_id: str, websocket: WebSocket):
    if room_id not in active_connections:
        active_connections[room_id] = []
    active_connections[room_id].append(websocket)


async def remove_connection(room_id: str, websocket: WebSocket):
    if room_id in active_connections:
        active_connections[room_id].remove(websocket)
        if not active_connections[room_id]:
            del active_connections[room_id]















