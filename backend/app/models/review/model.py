from backend.app.dao.dao import Base
from sqlalchemy import Column, Integer, String


class Reviews(Base):
    __tablename__ = "reviews"

    movie_id = Column(String, primary_key=True, unique=True, nullable=False)
    rating_1 = Column(Integer, default=0)
    rating_2 = Column(Integer, default=0)
    rating_3 = Column(Integer, default=0)
    rating_4 = Column(Integer, default=0)
    rating_5 = Column(Integer, default=0)
