# Указываем базовый образ
FROM python:3.9

# Устанавливаем зависимости
RUN pip install --no-cache-dir pandas sqlalchemy psycopg2

# Копируем скрипт для заполнения базы данных
COPY populate_db.py /populate_db.py

# Устанавливаем рабочую директорию
WORKDIR /data

# Команда по умолчанию
CMD ["python", "/populate_db.py"]
