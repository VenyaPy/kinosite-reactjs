from backend.app.dao.dao import Base
from sqlalchemy import Column, Integer, String, DateTime, Text
from datetime import datetime


class Rooms(Base):
    __tablename__ = "rooms"  # Таблица rooms

    id = Column(Integer, primary_key=True, autoincrement=True)
    room_id = Column(String, unique=True, nullable=False)
    members = Column(Text, nullable=False)
    movieId = Column(Text)  # Используем movieId как в таблице