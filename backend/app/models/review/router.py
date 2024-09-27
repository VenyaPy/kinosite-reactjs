from fastapi import APIRouter, HTTPException

from models.review.dao import ReviewDAO
from models.review.schemas import Review

review_router = APIRouter(
    tags=["Оценки фильмов"],
    prefix=""
)


@review_router.post("/review", summary="Отправка отзыва в базу данных")
async def send_review(movie_id: str, score: int):
    review = await ReviewDAO.get_reviews_by_movie_id(movie_id)
    if review:
        column_name = f"rating_{score}"
        new_value = getattr(review, column_name) + 1
        await ReviewDAO.update_review(movie_id, **{column_name: new_value})
    else:
        await ReviewDAO.add_new_review(movie_id=movie_id, **{f"rating_{score}": 1})
    return {"status": "success"}


@review_router.get("/get_review", summary="Получение отзывов из базы данных", response_model=Review)
async def get_reviews(movie_id: str):
    review = await ReviewDAO.find_one_or_none(movie_id=movie_id)
    if not review:
        raise HTTPException(status_code=404, detail="Отзывы не найдены")
    return {
        "movie_id": review.movie_id,
        "rating_1": review.rating_1,
        "rating_2": review.rating_2,
        "rating_3": review.rating_3,
        "rating_4": review.rating_4,
        "rating_5": review.rating_5
    }
