from backend.app.dao.dao import BaseDAO
from backend.app.models.rooms.model import Rooms


class RoomDAO(BaseDAO):
    model = Rooms
