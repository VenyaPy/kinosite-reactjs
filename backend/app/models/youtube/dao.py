from dao.dao import BaseDAO
from models.youtube.model import YouTubeRooms


class YouTubeDAO(BaseDAO):
    model = YouTubeRooms
