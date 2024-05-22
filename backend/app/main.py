import asyncio
import json
import logging
from typing import List

import uvicorn
from fastapi import FastAPI, Depends

from fastapi_cache import FastAPICache
from fastapi_cache.backends.redis import RedisBackend
from starlette.middleware.cors import CORSMiddleware

from redis import asyncio as aioredis
from starlette.websockets import WebSocket, WebSocketDisconnect

from backend.app.models.rooms.roomdao import RoomDAO
from backend.app.models.users.dependencies import get_current_user
from backend.app.models.users.model import Users
from backend.app.models.users.router import router_auth
from backend.app.models.search.router import router_search
from backend.app.models.admin.auth import auth_backend
from backend.app.models.images.router import router_user
from backend.app.models.mainpage.router import main_router
from backend.app.models.section.router import section_router
from backend.app.models.category.router import category_router
from backend.app.models.rooms.router import room_router, rooms_router
from backend.app.models.history.router import history_router
from backend.app.models.youtube.dao import YouTubeDAO
from backend.app.models.youtube.router import youtube_router

app = FastAPI(
    title="Совместный просмотр фильмов",
    version="0.2.0",
    description="API совместного просмотра контента. Реализовано через видеобалансер и KinopoiskAPI.",
    root_path="/api/v2"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],  # Разрешить все методы
    allow_headers=["*"],  # Разрешить все заголовки
)



app.include_router(main_router)
app.include_router(router_auth)
app.include_router(router_user)
app.include_router(section_router)
app.include_router(category_router)
app.include_router(router_search)
app.include_router(room_router)
app.include_router(history_router)
app.include_router(rooms_router)
app.include_router(youtube_router)




@app.on_event("startup")
def startup():
    redis = aioredis.from_url("redis://localhost ")
    FastAPICache.init(RedisBackend(redis), prefix="fastapi-cache")


class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.room_connections: dict[str, List[WebSocket]] = {}
        self.disconnection_timers: dict[str, asyncio.Task] = {}

    async def connect(self, websocket: WebSocket, room_id: str):
        await websocket.accept()
        self.active_connections.append(websocket)
        if room_id not in self.room_connections:
            self.room_connections[room_id] = []
        self.room_connections[room_id].append(websocket)

        if room_id in self.disconnection_timers:
            self.disconnection_timers[room_id].cancel()
            del self.disconnection_timers[room_id]

    async def disconnect(self, websocket: WebSocket, room_id: str):
        self.active_connections.remove(websocket)
        self.room_connections[room_id].remove(websocket)
        if not self.room_connections[room_id]:
            del self.room_connections[room_id]
            self.disconnection_timers[room_id] = asyncio.create_task(self.schedule_delete_room(room_id))

    async def schedule_delete_room(self, room_id: str):
        await asyncio.sleep(10)
        await self.delete_room(room_id)
        del self.disconnection_timers[room_id]

    async def delete_room(self, room_id: str):
        await RoomDAO.delete_rooms(room_id=room_id)
        logging.info(f"Room {room_id} deleted from database")

    async def broadcast(self, message: str, room_id: str):
        for connection in self.room_connections.get(room_id, []):
            await connection.send_text(message)

manager = ConnectionManager()


@app.websocket("/ws/{room_id}")
async def websocket_endpoint(websocket: WebSocket, room_id: str):
    await manager.connect(websocket, room_id)
    try:
        while True:
            data = await websocket.receive_text()
            await manager.broadcast(data, room_id)
    except WebSocketDisconnect:
        await manager.disconnect(websocket, room_id)


class YouTubeConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.room_connections: dict[str, List[WebSocket]] = {}
        self.disconnection_timers: dict[str, asyncio.Task] = {}
        self.room_states: dict[str, dict] = {}

    async def connect(self, websocket: WebSocket, youtube_room_id: str):
        await websocket.accept()
        self.active_connections.append(websocket)
        if youtube_room_id not in self.room_connections:
            self.room_connections[youtube_room_id] = []
        self.room_connections[youtube_room_id].append(websocket)

        # Send current room state to the new connection
        if youtube_room_id in self.room_states:
            state = self.room_states[youtube_room_id]
            await websocket.send_text(json.dumps({'type': 'control', 'videoId': state['videoId'], 'currentTime': state['currentTime']}))

    async def disconnect(self, websocket: WebSocket, youtube_room_id: str):
        self.active_connections.remove(websocket)
        self.room_connections[youtube_room_id].remove(websocket)
        if not self.room_connections[youtube_room_id]:
            del self.room_connections[youtube_room_id]
            self.disconnection_timers[youtube_room_id] = asyncio.create_task(self.schedule_delete_room(youtube_room_id))

    async def schedule_delete_room(self, youtube_room_id: str):
        await asyncio.sleep(10)
        await self.delete_room(youtube_room_id)
        del self.disconnection_timers[youtube_room_id]

    async def delete_room(self, youtube_room_id: str):
        if youtube_room_id in self.room_states:
            del self.room_states[youtube_room_id]
        logging.info(f"Room {youtube_room_id} deleted from database")

    async def broadcast(self, message: str, youtube_room_id: str):
        for connection in self.room_connections.get(youtube_room_id, []):
            await connection.send_text(message)

    async def update_room_state(self, youtube_room_id: str, state: dict):
        self.room_states[youtube_room_id] = state

youtube_manager = YouTubeConnectionManager()

@app.websocket("/ws/yt/{youtube_room_id}")
async def youtube_websocket_endpoint(websocket: WebSocket, youtube_room_id: str):
    await youtube_manager.connect(websocket, youtube_room_id)
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            if message['type'] == 'control' and 'currentTime' in message:
                await youtube_manager.update_room_state(youtube_room_id, message)
            await youtube_manager.broadcast(data, youtube_room_id)
    except WebSocketDisconnect:
        await youtube_manager.disconnect(websocket, youtube_room_id)


if __name__ == "__main__":
    uvicorn.run("backend.app.main:app", reload=True)
