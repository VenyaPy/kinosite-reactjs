from pydantic import BaseModel


class Review(BaseModel):
    movie_id: str
    rating_1: int
    rating_2: int
    rating_3: int
    rating_4: int
    rating_5: int