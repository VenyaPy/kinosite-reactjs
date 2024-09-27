import asyncio
from dataclasses import asdict, replace
from typing import List

import manticoresearch.model
from manticoresearch import (Configuration,
                             ApiClient,
                             SearchApi,
                             UtilsApi)

from models.search.schemas import (SearchEngineResponseElement)


async def _keyboard_layout(text: str) -> str:
    """
    Исправление неправильной раскладки клавиатуры.
    """
    en_chars = "qwertyuiop[]asdfghjkl;'zxcvbnm,./QWERTYUIOP{}ASDFGHJKL:\"ZXCVBNM<>?"
    ru_chars = "йцукенгшщзхъфывапролджэячсмитьбю.ЙЦУКЕНГШЩЗХЪФЫВАПРОЛДЖЭЯЧСМИТЬБЮ,"
    en_to_ru = str.maketrans(en_chars, ru_chars)
    ru_to_en = str.maketrans(ru_chars, en_chars)

    # Определяем, какую раскладку использовать
    if any(char in en_chars for char in text):
        # Если хотя бы один символ в английской раскладке, переводим в русскую
        return text.translate(en_to_ru)
    else:
        # В противном случае переводим в английскую
        return text.translate(ru_to_en)


class ManticoreSearchEngine:
    """
    Основные функции работы с Manticore Search.
    """

    def __init__(self):
        configuration = Configuration(host="http://manticore:9308")
        api_client = ApiClient(configuration)

        self.search_api = SearchApi(api_client)
        self.utils_api = UtilsApi(api_client)

        self.cache = {}

    async def search(self, query: str) -> List[SearchEngineResponseElement]:
        """
        Все запросы поступают в search, тут происходит маршрутизация запроса - либо
        на полнотекстовый поиск, либо исправление опечаток.
        """
        # Запускаем задачи для исправления опечаток
        spell_correction_task = asyncio.create_task(self._spell_correction(query))

        # Используем функцию для переворота раскладки
        query_reverse_layout = await _keyboard_layout(query)
        spell_reverse_correction_task = asyncio.create_task(self._spell_correction(query_reverse_layout))

        # Запускаем полнотекстовый поиск
        fulltext_task = asyncio.create_task(self._fulltext_search(query))
        fulltext_result = await fulltext_task

        # Если нашли результат, отменяем остальные задачи
        if fulltext_result:
            spell_correction_task.cancel()
            spell_reverse_correction_task.cancel()
            return fulltext_result

        # Получаем результаты исправления опечаток
        levenshtein_hits = await spell_correction_task
        levenshtein_hits += await spell_reverse_correction_task
        return levenshtein_hits



    async def get_all_results(self) -> List[SearchEngineResponseElement]:

        sql_all_results_query = f'SELECT * FROM s_films LIMIT 5000 option max_matches=5000;'


        try:
            tread = self.utils_api.sql(sql_all_results_query,
                                       async_req=True,
                                       raw_response=True)
            result = tread.get()

            results = [
                SearchEngineResponseElement(
                    id=hit["_id"],
                    name=hit["_source"].get("name_ru", ""),
                    name_en=hit["_source"].get("name_en", "")
                )
                for hit in result.hits.hits
            ]
            return results if results else []

        except Exception as e:
            print(e)
            return []


    async def _fulltext_search(self,
                               query: str) -> List[SearchEngineResponseElement]:
        """
        Полнотекстовый поиск с тремя паттернами text*, ^text, *text*.
        """
        search_text = query

        match_query = f'^{search_text} | {search_text}* | *{search_text}*'

        filters = []

        search_fulltext = manticoresearch.model.SearchRequest(
            index='s_films',
            query={
                "bool": {
                    "must": [
                        {"match": {"_all": match_query}},
                        *filters
                    ]
                }
            },
            options={
                "ranker": "sph04",
                "field_weights": {"name_ru": 100,
                                  "name_en": 60},
            }
        )

        try:
            thread = self.search_api.search(search_fulltext,
                                            async_req=True)
            result = thread.get()

            results = [
                SearchEngineResponseElement(
                    id=hit["_id"],
                    name=hit["_source"].get("name_ru", ""),
                    name_en=hit["_source"].get("name_en", ""),
                )
                for hit in result.hits.hits
            ]
            return results if results else []

        except Exception as e:
            print(e)
            return []

    async def _spell_to_fulltext(self, spell_results: List[dict]) -> List[SearchEngineResponseElement]:
        """
        Перевод опечаток в полнотекстовый поиск.
        Тестовая функция.
        """
        all_results = []
        # Проходим по каждому результату, а не только по первому
        for spell_result in spell_results:
            query = spell_result.get("name")

            # Проверка на случай, если query может быть None или пустой строкой
            if query:
                fulltext_results = await self._fulltext_search(query)
                all_results.extend(fulltext_results)

        return all_results

    async def _spell_correction(self, query: str):
        """
        Исправление опечаток по методу Левенштейна - нахождение ближайшего расстояния.
        """

        # Заключите query в одинарные кавычки для SQL-запроса
        sql_spell_correction = (
            f"CALL SUGGEST('{query}', 's_films', 1 as sentence, 1 as non_char)"
        )

        query_str = sql_spell_correction

        try:
            thread = self.utils_api.sql(query_str, async_req=True, raw_response=True)
            result = thread.get()

            # spell_results будет списком словарей с ключом 'name'
            spell_results = [{"name": hit["suggest"]} for hit in result[0]["data"]]

            send_data = await self._spell_to_fulltext(spell_results=spell_results)
            return send_data
        except Exception as e:
            print(e)
            return []


search_engine = ManticoreSearchEngine()
