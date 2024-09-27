from dao.dao import BaseDAO
from models.history.model import MovieHistory


class MovieDAO(BaseDAO):
    model = MovieHistory

