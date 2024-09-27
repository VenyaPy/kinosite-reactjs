from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from dao.dao import Base

class Session(Base):
    __tablename__ = "sessions"

    id = Column(Integer, primary_key=True, index=True, nullable=False)
    username = Column(String)
    room_id = Column(String, unique=True, index=True)
    movie_name = Column(String, unique=True)
    movie_poster = Column(String, unique=True)
    movie_url = Column(String)
    time = Column(DateTime, nullable=False)

    users = relationship("SessionUser", back_populates="session")


class SessionUser(Base):
    __tablename__ = "session_users"

    id = Column(Integer, primary_key=True, index=True, nullable=False)
    session_id = Column(Integer, ForeignKey('sessions.id'))
    user_id = Column(Integer, nullable=False)

    session = relationship("Session", back_populates="users")
