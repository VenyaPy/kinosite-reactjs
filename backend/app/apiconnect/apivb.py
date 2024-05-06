import re
from backend.app.config import APIConfig
import aiohttp


class MovieSearch:
    @classmethod
    async def fetch_movies(cls, query: str):
        kp_link_match = re.match(r'https?://www\.kinopoisk.ru/(series|film)/(\d+)', query)
        kp_match = re.match(r'kp(\d+)', query)

        if kp_link_match:
            kp_id = kp_link_match.group(2)
        elif kp_match:
            kp_id = kp_match.group(1)
        else:
            kp_id = None

        if kp_id:
            url = f"https://apivb.info/api/videos.json?id_kp={kp_id}&token={APIConfig.api_hbtv}"
        else:
            url = f"https://apivb.info/api/videos.json?title={query}&token={APIConfig.api_hbtv}"

        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(url) as response:
                    if response.status == 200:
                        movies_data = await response.json(content_type=None)
                        for movie in movies_data:
                            movie['watch_url'] = f'http://127.0.0.1:8000/v/player?id={movie["kinopoisk_id"]}'
                            film = await MovieSearch.kinopoisk_search(id=movie["kinopoisk_id"])

                            genres_str = ', '.join([genre['genre'] for genre in film.get('genres', [])])
                            countries_str = ', '.join([country['country'] for country in film.get('countries', [])])

                            movie.update({
                                'rating': film.get('ratingKinopoisk'),
                                'poster_film': film.get('posterUrl'),
                                'about': film.get('description', ''),
                                'genres': genres_str,
                                'countries': countries_str,
                                })

                        return movies_data
            return []
        except Exception as e:
            print(e)
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

