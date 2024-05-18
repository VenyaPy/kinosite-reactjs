from backend.app.dao.dao import Base
from sqlalchemy import Column, Integer, String, Text

class MovieHistory(Base):
    __tablename__ = "movie_history"  # Таблица movie_history

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, nullable=False)
    description = Column(Text)
    poster_url = Column(String)
    id_film = Column(Integer, nullable=False)
    id_user = Column(Integer, nullable=False)  # Новое поле id_user

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'poster_url': self.poster_url,
            'id_film': self.id_film,
            'id_user': self.id_user,  # Добавьте новое поле в словарь
        }

