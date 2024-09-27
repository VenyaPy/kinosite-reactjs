from dao.dao import BaseDAO
from models.review.model import Reviews


class ReviewDAO(BaseDAO):
    model = Reviews