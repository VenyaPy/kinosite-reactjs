from dao.dao import BaseDAO
from models.rooms.model import Rooms


class RoomDAO(BaseDAO):
    model = Rooms
