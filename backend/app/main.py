import uvicorn
from fastapi import FastAPI
from sqladmin import Admin

from fastapi_cache import FastAPICache
from fastapi_cache.backends.redis import RedisBackend
from fastapi.staticfiles import StaticFiles
import os

from redis import asyncio as aioredis

from backend.app.database.database import engine
from backend.app.models.admin.router import UserAdmin
from backend.app.models.users.router import router_auth
from backend.app.models.search.router import router_search
from backend.app.models.admin.auth import auth_backend
from backend.app.models.rooms.router import room_router
from backend.app.models.images.router import router_user
from backend.app.models.mainpage.router import main_router
from backend.app.models.section.router import section_router
from backend.app.models.category.router import category_router

app = FastAPI(
    title="Совместный просмотр фильмов",
    version="0.2.0",
    description="API совместного просмотра контента. Реализовано через видеобалансер и KinopoiskAPI.",
    root_path="/api/v2"
)


admin = Admin(app, engine, authentication_backend=auth_backend)

app.include_router(main_router)
app.include_router(router_auth)
app.include_router(router_user)
app.include_router(section_router)
app.include_router(category_router)
app.include_router(router_search)
app.include_router(room_router)

admin.add_view(UserAdmin)


@app.on_event("startup")
def startup():
    redis = aioredis.from_url("redis://localhost ")
    FastAPICache.init(RedisBackend(redis), prefix="fastapi-cache")



if __name__ == "__main__":
    uvicorn.run("backend.app.main:app", reload=True)
