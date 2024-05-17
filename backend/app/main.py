from typing import List

import uvicorn
from fastapi import FastAPI
from sqladmin import Admin

from fastapi_cache import FastAPICache
from fastapi_cache.backends.redis import RedisBackend
from starlette.middleware.cors import CORSMiddleware

from redis import asyncio as aioredis
from starlette.websockets import WebSocket, WebSocketDisconnect

from backend.app.models.users.router import router_auth
from backend.app.models.search.router import router_search
from backend.app.models.admin.auth import auth_backend
from backend.app.models.images.router import router_user
from backend.app.models.mainpage.router import main_router
from backend.app.models.section.router import section_router
from backend.app.models.category.router import category_router
from backend.app.models.rooms.router import room_router

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




@app.on_event("startup")
def startup():
    redis = aioredis.from_url("redis://localhost ")
    FastAPICache.init(RedisBackend(redis), prefix="fastapi-cache")


class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.room_connections: dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, room_id: str):
        await websocket.accept()
        self.active_connections.append(websocket)
        if room_id not in self.room_connections:
            self.room_connections[room_id] = []
        self.room_connections[room_id].append(websocket)

    def disconnect(self, websocket: WebSocket, room_id: str):
        self.active_connections.remove(websocket)
        self.room_connections[room_id].remove(websocket)
        if not self.room_connections[room_id]:
            del self.room_connections[room_id]

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
        manager.disconnect(websocket, room_id)



if __name__ == "__main__":
    uvicorn.run("backend.app.main:app", reload=True)
