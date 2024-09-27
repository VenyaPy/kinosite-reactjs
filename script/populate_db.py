import os
import sqlite3
import pandas as pd
from sqlalchemy import create_engine

# Путь к базе данных SQLite
sqlite_db_path = os.environ.get('SQLITE_DB_PATH')

# Данные подключения к PostgreSQL
postgres_user = 'postgres'
postgres_password = 'postgres'  # Пустой пароль
postgres_host = '0.0.0.0'  # Имя сервиса в docker-compose
postgres_db = 'movie_db'
postgres_port = '543'  # Порт внутри контейнера PostgreSQL

# Создание URL для подключения к PostgreSQL
postgres_url = f'postgresql://postgres:postgres@db:5432/movie_db'
postgres_engine = create_engine(postgres_url)


# Соединение с SQLite
sqlite_conn = sqlite3.connect(sqlite_db_path)

# Считываем данные из SQLite
query = 'SELECT * FROM movies;'  # Укажи нужную таблицу
df = pd.read_sql_query(query, sqlite_conn)

# Записываем данные в PostgreSQL
df.to_sql('movies', postgres_engine, if_exists='replace', index=False)

# Закрываем соединение с SQLite
sqlite_conn.close()

print("Данные успешно перенесены из SQLite в PostgreSQL!")
