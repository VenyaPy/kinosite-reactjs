from celery.bin.result import result
from fastapi import APIRouter, HTTPException, status, Depends
from typing import List

from starlette.responses import JSONResponse

from models.search.manticore_search import search_engine
from models.search.schemas import Movie
from apiconnect.apivb import MovieSearch



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


@router_search.post(path="/get_reference/{query}", response_class=JSONResponse)
async def get_reference(query: str):

    if query:
        search_method = await search_engine.search(query)
    else:
        search_method = await search_engine.get_all_results(query)

    results = [{
        "id": res.id or "",
        "name": res.name or "",
        "name_en": res.name_en or ""
    } for res in search_method]

    print(results)


    return results
