from dao.dao import Base
from sqlalchemy import Column, Integer, String, DateTime, Text
from datetime import datetime


class Rooms(Base):
    __tablename__ = "rooms"  # Таблица rooms

    id = Column(Integer, primary_key=True, autoincrement=True)
    room_id = Column(String, unique=True, nullable=False)
    members = Column(Text, nullable=False)
    movieId = Column(Text)
    username = Column(Text)

    def to_dict(self):
        return {
            'room_id': self.room_id,
            'movieId': self.movieId,
            'members': self.members.split(',') if self.members else [],
            'username': self.username  # Добавляем username в словарь
        }