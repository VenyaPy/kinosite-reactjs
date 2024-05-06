from fastapi import APIRouter, HTTPException, status, Depends
from typing import List

from backend.app.models.search.schemas import Movie
from backend.app.apiconnect.apivb import MovieSearch



router_search = APIRouter(
    prefix="/search",
    tags=["Поиск фильмов"],
)


@router_search.get("/{query}/", summary="Поиск по названию")
async def search_film(
        query: str
) -> List[Movie]:

    movies_data = await MovieSearch.fetch_movies(query)
    if not movies_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Фильмы не найдены"
        )

    movies = [Movie(**movie) for movie in movies_data]
    return movies


