#!/bin/sh

# Переходим в каталог /app/backend/app для выполнения Alembic миграций
cd /app/backend/app

# Ждем доступности базы данных
/usr/local/bin/wait-for-it db:5432 -- echo "Database is ready"

# Генерация и применение миграций
alembic revision --autogenerate -m 'Initial migration'
alembic upgrade head

# Переходим в каталог /app для запуска Uvicorn
cd /app

# Запуск приложения через Poetry и Uvicorn
poetry run uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8000
