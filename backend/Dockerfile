FROM python:3.12-slim

# Установка рабочего каталога
WORKDIR /kinosite-reactjs

# Установка необходимых зависимостей для сборки
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    curl \
    gcc \
    libc-dev && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Установка Poetry
RUN curl -sSL https://install.python-poetry.org | python3 - && \
    ln -s /root/.local/bin/poetry /usr/local/bin/poetry

# Отключаем создание виртуального окружения
RUN poetry config virtualenvs.create false

# Копируем файлы конфигурации Poetry
COPY pyproject.toml poetry.lock ./backend/

WORKDIR /kinosite-reactjs/backend

# Установка зависимостей с помощью Poetry
RUN poetry install --no-root --no-dev

# Копируем приложение
COPY app/ ./app

# Копируем wait-for-it скрипт в контейнер
COPY wait-for-it.sh /usr/local/bin/wait-for-it
RUN chmod +x /usr/local/bin/wait-for-it

# Переходим в каталог приложения
WORKDIR /kinosite-reactjs/backend/app

# Команда для генерации миграции и ее применения
CMD ["sh", "-c", "wait-for-it db:5432 -- alembic revision --autogenerate -m 'Initial migration' && alembic upgrade head && poetry run uvicorn main:app --reload --host 0.0.0.0 --port 8000"]
