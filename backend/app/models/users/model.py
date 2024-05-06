from backend.app.database.database import Base
from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime


class Users(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, nullable=False)
    username = Column(String, nullable=False)
    email = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    image = Column(String, nullable=True)
    status = Column(String, default="basic", nullable=True)
    date = Column(DateTime, default=datetime.now, nullable=False)

