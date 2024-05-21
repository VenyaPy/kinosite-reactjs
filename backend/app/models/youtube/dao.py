from backend.app.dao.dao import BaseDAO
from backend.app.models.youtube.model import YouTubeRooms


class YouTubeDAO(BaseDAO):
    model = YouTubeRooms
