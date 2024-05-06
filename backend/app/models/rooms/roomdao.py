from backend.app.dao.dao import BaseDAO
from backend.app.models.session.model import Session


class RoomDAO(BaseDAO):
    model = Session
