import logging
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
        url = f'https://api.kinopoisk.dev/v1.4/movie/search?page=1&limit=25&query={query}/'
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(url, headers=headers) as response:
                    if response.status == 200:
                        response_data = await response.json(content_type=None)
                        movies = response_data.get('docs', [])
                        for movie in movies:
                            movie['watch_url'] = f'https://kinowild.ru/player?{movie.get("id")}'

                            poster = movie.get('poster')
                            if isinstance(poster, dict):
                                movie['poster'] = poster.get('previewUrl')
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
                data['watch_url'] = f'https://kinowild.ru/player?{data["id"]}'
                data['id'] = f"{data['id']}"
                data['poster'] = data['poster']['previewUrl'] if isinstance(data['poster'], dict) else data['poster']
            return data
        else:
            for film in films_data:
                film['id'] = str(film['id'])
                film['watch_url'] = f'https://kinowild.ru/player?{film["id"]}'
                film['poster'] = film.get('poster', {}).get('previewUrl', None)

        return films_data


class KinopoiskId:
    api_key = APIConfig.api_key
    headers = {
        "X-API-KEY": api_key,
        "accept": "application/json"
    }

    @classmethod
    async def kinopoisk_api(cls, id):
        async with aiohttp.ClientSession() as session:
            async with session.get(url=f"https://api.kinopoisk.dev/v1.4/movie/{id}", headers=cls.headers) as response:
                if response.status == 200:
                    data = await response.json()
                    films_data = data.get('docs', [])

                    if not films_data:
                        if 'id' in data:
                            data['watch_url'] = f'https://kinowild.ru/player?{data["id"]}'
                            data['id'] = f"{data['id']}"
                            data['poster'] = data['poster']['previewUrl'] if isinstance(data['poster'], dict) else data[
                                'poster']
                        return data
                    else:
                        for film in films_data:
                            film['id'] = str(film['id'])
                            film['watch_url'] = f'https://kinowild.ru/player?{film["id"]}'
                            film['poster'] = film.get('poster', {}).get('previewUrl', None)

                    return films_data
                else:
                    return {}


