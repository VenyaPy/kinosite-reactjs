from backend.app.dao.dao import BaseDAO
from backend.app.models.session.model import Session  # Импортируйте вашу модель Session


class SessionDAO(BaseDAO):
    model = Session
