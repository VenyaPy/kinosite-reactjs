from fastapi import APIRouter, HTTPException, Depends, Query
from starlette import status
from typing import List

from backend.app.apiconnect.apivb import KinopoiskCategory
from backend.app.exceptions import UserNotAuth
from backend.app.models.category.schemas import Category
from backend.app.models.users.model import Users
from backend.app.models.users.dependencies import get_current_user


category_router = APIRouter(
    prefix="/category",
    tags=["Фильтры"]
)


@category_router.get("/filtered_movies", summary="Фильтр фильмов")
async def filtered_movies(
    genres: List[str] = Query(None, description="Жанр"),
    countries: List[str] = Query(None, description="Страна")
) -> List[Category]:

    if genres is None and countries is None:
        url = "https://api.kinopoisk.dev/v1.4/movie?page=1&limit=100&type=movie&lists=top500"

    elif genres is not None and countries is None:
        genres_query = []
        for genre in genres:
            if genre.startswith("!"):
                genres_query.append(f"&genres.name=%21{genre[1:]}")
            elif genre.startswith("+"):
                genres_query.append(f"&genres.name=%2B{genre[1:]}")
            else:
                genres_query.append(f"&genres.name={genre}")
        result = "".join(genres_query)
        url = f"https://api.kinopoisk.dev/v1.4/movie?page=1&limit=50{result}"

    elif genres is None and countries is not None:
        countries_query = []
        for country in countries:
            if country.startswith("!"):
                countries_query.append(f"&countries.name=%21{country[1:]}")
            elif country.startswith("+"):
                countries_query.append(f"&countries.name=%2B{country[1:]}")
            else:
                countries_query.append(f"&countries.name={country}")
        result = "".join(countries_query)
        url = f"https://api.kinopoisk.dev/v1.4/movie?page=1&limit=50{result}"
    else:

        genres_query = []

        for genre in genres:
            if genre.startswith("!"):
                genres_query.append(f"&genres.name=%21{genre[1:]}")
            elif genre.startswith("+"):
                genres_query.append(f"&genres.name=%2B{genre[1:]}")
            else:
                genres_query.append(f"&genres.name={genre}")

        countries_query = []

        for country in countries:
            if country.startswith("!"):
                countries_query.append(f"&countries.name=%21{country[1:]}")
            elif country.startswith("+"):
                countries_query.append(f"&countries.name=%2B{country[1:]}")
            else:
                countries_query.append(f"&countries.name={country}")

        result = "".join(genres_query + countries_query)
        url = f"https://api.kinopoisk.dev/v1.4/movie?page=1&limit=50{result}"

    try:
        movie_data = await KinopoiskCategory.kinopoisk_api(url=url)

        if not movie_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Не найдено"
            )

        return movie_data

    except Exception as e:
        print(e)