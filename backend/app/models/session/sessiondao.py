from dao.dao import BaseDAO
from models.session.model import Session  # Импортируйте вашу модель Session


class SessionDAO(BaseDAO):
    model = Session
