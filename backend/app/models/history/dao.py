from backend.app.dao.dao import BaseDAO
from backend.app.models.history.model import MovieHistory


class MovieDAO(BaseDAO):
    model = MovieHistory

