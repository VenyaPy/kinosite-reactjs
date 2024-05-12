from fastapi import APIRouter, HTTPException, status, Depends
from fastapi_cache.decorator import cache

from backend.app.apiconnect.apivb import KinopoiskCategory
from backend.app.models.mainpage.schemas import PopularFilms
from backend.app.models.users.model import Users
from backend.app.models.users.dependencies import get_current_user

from typing import List


main_router = APIRouter(
    tags=["Главная страница"]
)


@main_router.get("/mainss",
                 response_model=List[PopularFilms],
                 summary="Главная страница")
@cache(expire=120000)
async def main_page(
):


    movies_data = await KinopoiskCategory.kinopoisk_api(
        url="https://api.kinopoisk.dev/v1.4/movie?page=1&limit=250&lists=popular-films"

    )
    if not movies_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Не найдено"
        )

    return movies_data
