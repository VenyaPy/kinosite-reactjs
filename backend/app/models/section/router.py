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
            url='https://api.kinopoisk.dev/v1.4/movie?page=1&limit=150&type=movie&lists=top500'
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
            url='https://api.kinopoisk.dev/v1.4/movie?page=1&limit=150&selectFields=&type=tv-series&lists=series-top250'
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


@section_router.get("/carton",
                     response_model=List[Selection],
                     summary="Раздел мультфильмов")
@cache(expire=36000)
async def carton_section():
    try:
        movie_data = await KinopoiskCategory.kinopoisk_api(
            url='https://api.kinopoisk.dev/v1.4/movie?page=1&limit=150&type=cartoon'
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

