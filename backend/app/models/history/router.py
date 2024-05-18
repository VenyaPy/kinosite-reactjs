from typing import List

from fastapi import APIRouter, HTTPException

from backend.app.models.history.dao import MovieDAO
from backend.app.models.history.model import MovieHistory
from backend.app.models.history.schema import MovieHistoryResponse

history_router = APIRouter(
    prefix="/history",
    tags=["История"]
)


@history_router.post("/move_history")
async def move_history(id_user: int, id_film: int, name: str, description: str, poster_url: str):
    repeat = await MovieDAO.find_one_or_none(id_user=id_user, id_film=id_film)
    if not repeat:
        result = await MovieDAO.add(id_user=id_user, name=name, description=description, poster_url=poster_url, id_film=id_film)
        if result is None:
            raise HTTPException(status_code=500, detail="Error adding movie history")
        return {"id": result}
    else:
        return {"detail": "Movie already in history"}


@history_router.get("/get_history", response_model=List[MovieHistoryResponse])
async def get_user_history(user_id: int):
    result = await MovieDAO.find_all(id_user=user_id)
    if result is None:
        raise HTTPException(status_code=500, detail="Error retrieving movie history")
    return result