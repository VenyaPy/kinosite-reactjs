from dao.dao import Base
from sqlalchemy import Column, Integer, String, Text


class YouTubeRooms(Base):
    __tablename__ = "youtube_rooms"  # Таблица youtube_rooms

    id = Column(Integer, primary_key=True, autoincrement=True)
    youtube_room_id = Column(String, unique=True, nullable=False)
    members = Column(Text, nullable=False)

    def to_dict(self):
        return {
            'youtube_room_id': self.youtube_room_id,
            'members': self.members.split(',') if self.members else [],
        }
