from fastapi import APIRouter, HTTPException, status, Depends
from fastapi_cache.decorator import cache

from apiconnect.apivb import KinopoiskCategory
from models.mainpage.schemas import PopularFilms
from models.users.model import Users
from models.users.dependencies import get_current_user

from typing import List


main_router = APIRouter(
    tags=["Главная страница"]
)


@main_router.get("/main",
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
