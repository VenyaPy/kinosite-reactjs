import requests
import sqlite3

# 1️⃣ Функция для получения данных с API
def fetch_movies():
    all_movies = []  # Список для хранения фильмов со всех страниц

    for i in range(0, 100):  # Цикл по страницам от 13 до 99
        url = f'https://api.kinopoisk.dev/v1.4/movie?page={i}&limit=200&selectFields=name&selectFields=alternativeName&type=&rating.kp=4-6'

        headers = {
            'accept': 'application/json',
            'X-API-KEY': 'VBZ63SW-PFHMYEM-M3384F6-X6BXVSY'
        }
        response = requests.get(url, headers=headers)

        if response.status_code == 200:
            movies = response.json().get('docs', [])
            all_movies.extend(movies)  # Добавляем фильмы со страницы в общий список
            print(f"Страница {i}: добавлено {len(movies)} фильмов")
        else:
            print(f"Ошибка при запросе страницы {i}: статус {response.status_code}")

    return all_movies
# 2️⃣ Функция для создания базы данных и таблицы
def create_db():
    conn = sqlite3.connect("movie.db")
    cursor = conn.cursor()

    # Добавляем ограничение UNIQUE для комбинации name_ru и name_en, чтобы не было дублей
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS movies (
        id INTEGER PRIMARY KEY,
        name_ru TEXT,
        name_en TEXT,
        UNIQUE(name_ru, name_en)
    )
    ''')

    conn.commit()
    return conn, cursor

# 3️⃣ Функция для вставки данных с проверкой
def insert_movies(cursor, movies):
    for movie in movies:
        name_ru = movie.get('name', 'Нет названия')
        name_en = movie.get('alternativeName', 'Нет альтернативного названия')

        # Пытаемся вставить данные, если они уникальны (по name_ru и name_en)
        try:
            cursor.execute('''
            INSERT INTO movies (name_ru, name_en) VALUES (?, ?)
            ''', (name_ru, name_en))
        except sqlite3.IntegrityError:
            print(f"Фильм '{name_ru}' уже существует в базе данных.")

# 4️⃣ Основная логика программы
def main():
    # Получаем данные с API
    movies = fetch_movies()

    if movies:
        # Создаем базу данных и таблицу (если не создана)
        conn, cursor = create_db()

        # Вставляем фильмы в таблицу
        insert_movies(cursor, movies)

        # Сохраняем изменения
        conn.commit()

        # Закрываем соединение с базой
        conn.close()
        print("Данные успешно сохранены в базу!")
    else:
        print("Нет данных для сохранения.")

if __name__ == "__main__":
    main()
