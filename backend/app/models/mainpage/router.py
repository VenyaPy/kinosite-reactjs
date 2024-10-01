from fastapi import APIRouter, HTTPException, status, Depends
from fastapi_cache.decorator import cache

from apiconnect.apivb import KinopoiskCategory
from models.mainpage.schemas import PopularFilms
from models.users.model import Users
from models.users.dependencies import get_current_user

from typing import List

from starlette.responses import FileResponse

from tasks.image_worker import download_and_compress_image
from watchfiles import awatch

main_router = APIRouter(
    tags=["Главная страница"]
)


@main_router.get("/movies",
                 response_model=List[PopularFilms],
                 summary="Главная страница")
async def main_page(
):
    try:
        movies_data = await KinopoiskCategory.kinopoisk_api(
            url="https://api.kinopoisk.dev/v1.4/movie?page=1&limit=250&notNullFields=poster.url&lists=popular-films"

        )
        if not movies_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Не найдено"
            )
        await get_final_result(movies_data)
        return movies_data
    except Exception as e:
        print(e)


async def get_final_result(data):
    try:
        for movie in data:
            if movie.get("poster"):
                await download_and_compress_image(id=movie.get("id"),
                                                  url=movie.get("poster"))
            else:
                pass
    except Exception as e:
        print(e)


@main_router.get("/images/photo_{id}")
async def get_image(id: str):
    image_path = f"/photos/photo_{id}"
    if image_path:
        return FileResponse(image_path)
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Изображение не найдено")


