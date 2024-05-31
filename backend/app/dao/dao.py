import asyncio
import logging

from fastapi import WebSocket

from sqlalchemy import delete, insert, select, update
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_scoped_session, async_sessionmaker
from sqlalchemy.orm import sessionmaker
from sqlalchemy.orm import declarative_base


DATABASE_URL = "sqlite+aiosqlite:////home/venya/PycharmProjects/kinosite-react/backend/app/database/kinobase.db"


engine = create_async_engine(DATABASE_URL, echo=True)

async_session_maker = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False
)
ScopedSession = async_scoped_session(async_session_maker, scopefunc=asyncio.current_task)

Base = declarative_base()


class BaseDAO:
    model = None

    @classmethod
    async def find_one_or_none(cls, **filters):
        async with ScopedSession() as session:
            try:
                query = select(cls.model).filter_by(**filters)
                result = await session.execute(query)
                return result.scalar_one_or_none()
            except (SQLAlchemyError, Exception) as e:
                print(f"Error finding data in table {cls.model.__tablename__}: {e}")
                return None

    @classmethod
    async def find_all(cls, **filter_by):
        async with ScopedSession() as session:
            try:
                query = select(cls.model).filter_by(**filter_by)
                result = await session.execute(query)
                return result.scalars().all()
            except (SQLAlchemyError, Exception) as e:
                print(f"Error finding all data in table {cls.model.__tablename__}: {e}")
                return None

    @classmethod
    async def find_all_no_filters(cls):
        async with ScopedSession() as session:
            try:
                query = select(cls.model)
                result = await session.execute(query)
                return result.scalars().all()
            except (SQLAlchemyError, Exception) as e:
                print(f"Error finding all data in table {cls.model.__tablename__}: {e}")
                return None

    @classmethod
    async def get_all(cls):
        async with ScopedSession() as session:
            try:
                query = select(cls.model)
                result = await session.execute(query)
                rooms = result.scalars().all()
                return rooms
            except (SQLAlchemyError, Exception) as e:
                return []

    @classmethod
    async def add(cls, **data):
        async with ScopedSession() as session:
            try:
                query = insert(cls.model).values(**data).returning(cls.model.id)
                result = await session.execute(query)
                await session.commit()
                return result.scalar()
            except (SQLAlchemyError, Exception) as e:
                await session.rollback()
                print(f"Database Exc: Cannot insert data into table: {e}")
                return None

    @classmethod
    async def update(cls, id: int, **data):
        async with ScopedSession() as session:
            try:
                query = (
                    update(cls.model).
                    where(cls.model.id == id).
                    values(**data)
                )
                result = await session.execute(query)
                await session.commit()
                return result.rowcount
            except (SQLAlchemyError, Exception) as e:
                await session.rollback()
                print(f"Error updating data in table {cls.model.__tablename__}: {e}")
                return None

    @classmethod
    async def update_room(cls, room_id: str, **data):
        async with ScopedSession() as session:
            try:
                room = await cls.find_one_or_none(room_id=room_id)
                if room:
                    current_members = room.members.split(',') if room.members else []
                    if data['members'] not in current_members:
                        new_members = current_members + [str(data['members'])]
                        query = (
                            update(cls.model).
                            where(cls.model.room_id == room_id).
                            values(members=','.join(new_members))
                        )
                        result = await session.execute(query)
                        await session.commit()
                        return result.rowcount
                else:
                    return None
            except (SQLAlchemyError, Exception) as e:
                await session.rollback()
                print(f"Error updating data in table {cls.model.__tablename__}: {e}")
                return None

    @classmethod
    async def update_youtube_room(cls, youtube_room_id: str, **data):
        async with ScopedSession() as session:
            try:
                room = await cls.find_one_or_none(youtube_room_id=youtube_room_id)
                if room:
                    current_members = room.members.split(',') if room.members else []
                    if data['members'] not in current_members:
                        new_members = current_members + [str(data['members'])]
                        query = (
                            update(cls.model).
                            where(cls.model.youtube_room_id == youtube_room_id).
                            values(members=','.join(new_members))
                        )
                        result = await session.execute(query)
                        await session.commit()
                        return result.rowcount
                else:
                    return None
            except (SQLAlchemyError, Exception) as e:
                await session.rollback()
                print(f"Error updating data in table {cls.model.__tablename__}: {e}")
                return None

    @classmethod
    async def delete(cls, **filter_by):
        async with ScopedSession() as session:
            try:
                query = delete(cls.model).filter_by(**filter_by)
                await session.execute(query)
                await session.commit()
            except (SQLAlchemyError, Exception) as e:
                await session.rollback()
                print(f"Error deleting data in table {cls.model.__tablename__}: {e}")
                return None

    @classmethod
    async def delete_rooms(cls, room_id: str):
        async with ScopedSession() as session:
            try:
                stmt = delete(cls.model).where(cls.model.room_id == room_id)
                await session.execute(stmt)
                await session.commit()
            except (SQLAlchemyError, Exception) as e:
                await session.rollback()
                print(f"Error deleting data in table {cls.model.__tablename__}: {e}")
                return None

    @classmethod
    async def delete_youtube_rooms(cls, youtube_room_id: str):
        async with ScopedSession() as session:
            try:
                stmt = delete(cls.model).where(cls.model.youtube_room_id == youtube_room_id)
                await session.execute(stmt)
                await session.commit()
            except (SQLAlchemyError, Exception) as e:
                await session.rollback()
                print(f"Error deleting data in table {cls.model.__tablename__}: {e}")
                return None

    @classmethod
    async def get_reviews_by_movie_id(cls, movie_id: str):
        async with ScopedSession() as session:
            try:
                query = select(cls.model).filter_by(movie_id=movie_id)
                result = await session.execute(query)
                return result.scalar_one_or_none()
            except (SQLAlchemyError, Exception) as e:
                print(f"Error finding data in table {cls.model.__tablename__}: {e}")
                return None

    @classmethod
    async def add_new_review(cls, **data):
        async with ScopedSession() as session:
            try:
                query = insert(cls.model).values(**data)
                await session.execute(query)
                await session.commit()
            except (SQLAlchemyError, Exception) as e:
                await session.rollback()
                print(f"Database Exc: Cannot insert data into table: {e}")
                return None
        
    
    @classmethod
    async def update_review(cls, movie_id: str, **data):
        async with ScopedSession() as session:
            try:
                query = (
                    update(cls.model).
                    where(cls.model.movie_id == movie_id).
                    values(**data)
                )
                result = await session.execute(query)
                await session.commit()
                return result.rowcount
            except (SQLAlchemyError, Exception) as e:
                await session.rollback()
                print(f"Error updating data in table {cls.model.__tablename__}: {e}")
                return None

