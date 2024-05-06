import re
from backend.app.config import APIConfig
import aiohttp


class MovieSearch:
    @classmethod
    async def fetch_movies(cls, query: str):
        headers = {
            "X-API-Key": APIConfig.api_key,
            "accept": "application/json"
        }
        url = f'https://api.kinopoisk.dev/v1.4/movie/search?page=1&limit=10&query={query}/'
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(url, headers=headers) as response:
                    if response.status == 200:
                        response_data = await response.json(content_type=None)
                        movies = response_data.get('docs', [])  # Предполагаем, что данные фильмов находятся в ключе 'docs'
                        for movie in movies:
                            movie['watch_url'] = f'https://kinodomvideo.ru/player.html?id={movie.get("id")}'

                            # Проверка и обработка данных постера
                            poster = movie.get('poster')
                            if isinstance(poster, dict):
                                movie['poster'] = poster.get('url')
                            else:
                                movie['poster'] = None
                        return movies
            return []
        except Exception as e:
            print(f"Error fetching movies: {e}")
            return []


    @classmethod
    async def kinopoisk_search(cls, id):
        try:
            url = f"https://kinopoiskapiunofficial.tech/api/v2.2/films/{id}"
            headers = {
                'accept': 'application/json',
                'X-API-KEY': APIConfig.current_api_key,
            }

            async with aiohttp.ClientSession() as session:
                async with session.get(url=url, headers=headers) as response:
                    if response.status == 200:
                        data = await response.json()
                        return data
                    else:
                        return {}

        except Exception as e:
            print(e)
            return []


class KinopoiskCategory:
    api_key = APIConfig.api_key
    headers = {
        "X-API-Key": api_key,
        "accept": "application/json"
    }

    @classmethod
    async def fetch_data(cls, url):
        async with aiohttp.ClientSession() as session:
            async with session.get(url=url, headers=cls.headers) as response:
                if response.status == 200:
                    return await response.json()
                else:
                    return {}

    @classmethod
    async def kinopoisk_api(cls, url):
        data = await cls.fetch_data(url)
        films_data = data.get('docs', [])

        if not films_data:
            if 'id' in data:
                data['watch_url'] = f'http://127.0.0.1:8000/v/player?id={data["id"]}'
                data['id'] = f"{data['id']}"
                data['poster'] = data['poster']['url']
            return data
        else:
            for film in films_data:
                film['watch_url'] = f'http://127.0.0.1:8000/v/player?id={film["id"]}'
                film['id'] = f"{film['id']}"
                film['poster'] = film['poster']['url']

        return films_data

