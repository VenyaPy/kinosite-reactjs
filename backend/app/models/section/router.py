from fastapi import APIRouter, HTTPException, Depends
from fastapi_cache import FastAPICache
from fastapi_cache.decorator import cache
from starlette import status

from backend.app.apiconnect.apivb import KinopoiskCategory
from backend.app.exceptions import UserNotAuth
from backend.app.models.section.schemas import Selection
from backend.app.models.users.model import Users
from backend.app.models.users.dependencies import get_current_user

from typing import List


section_router = APIRouter(
    tags=["Разделы"],
    prefix=""
)


@section_router.get("/movies",
                     response_model=List[Selection],
                     summary="Раздел фильмы")
@cache(expire=100000)
async def movies_section():

    try:
        movie_data = await KinopoiskCategory.kinopoisk_api(
            url='https://api.kinopoisk.dev/v1.4/movie?page=1&limit=250&type=movie&lists=top250'
        )

        if not movie_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Не найдено"
            )

        return movie_data

    except Exception as e:
        print(e)


@section_router.get("/series",
                    response_model=List[Selection],
                    summary="Раздел сериалы")
@cache(expire=100000)
async def series_section():

    try:
        movie_data = await KinopoiskCategory.kinopoisk_api(
            url='https://api.kinopoisk.dev/v1.4/movie?page=1&limit=250&selectFields=&type=tv-series&lists=popular-series'
        )

        if not movie_data:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Не найдено")

        return movie_data

    except Exception as e:
        print(e)


@section_router.get("/anime",
                     response_model=List[Selection],
                     summary="Раздел аниме")
@cache(expire=100000)
async def anime_section():
    try:
        movie_data = await KinopoiskCategory.kinopoisk_api(
            url='https://api.kinopoisk.dev/v1.4/movie?page=1&limit=150&type=anime'
        )

        if not movie_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Не найдено"
            )

        return movie_data

    except Exception as e:
        print(e)


@section_router.get("/carcoon",
                     response_model=List[Selection],
                     summary="Раздел мультфильмов")
@cache(expire=36000)
async def carton_section():
    try:
        movie_data = await KinopoiskCategory.kinopoisk_api(
            url='https://api.kinopoisk.dev/v1.4/movie?page=1&limit=250&type=cartoon&rating.kp=6-10&countries.name=%21%D0%A1%D0%A1%D0%A1%D0%A0&countries.name=%21%D0%91%D0%B5%D0%BB%D0%B0%D1%80%D1%83%D1%81%D1%8C&countries.name=%21%D0%A0%D0%BE%D1%81%D1%81%D0%B8%D1%8F'
        )

        if not movie_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Не найдено"
            )

        return movie_data

    except Exception as e:
        print(e)


@section_router.get("/random",
                    response_model=Selection,
                    summary="Случайный фильм")
async def random_film():

    movie_data = await KinopoiskCategory.kinopoisk_api(
        url="https://api.kinopoisk.dev/v1.4/movie/random?lists=top250"
    )
    if not movie_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Неудачный запрос"
        )

    return movie_data

