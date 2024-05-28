from backend.app.dao.dao import BaseDAO
from backend.app.models.review.model import Reviews


class ReviewDAO(BaseDAO):
    model = Reviews