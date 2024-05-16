import asyncio

from fastapi import WebSocket

from sqlalchemy import delete, insert, select, update
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_scoped_session, async_sessionmaker
from sqlalchemy.orm import sessionmaker
from sqlalchemy.orm import declarative_base


DATABASE_URL = "sqlite+aiosqlite:////home/venya/PycharmProjects/kinosite-react/backend/app/database/kinobase.db"


engine = create_async_engine(DATABASE_URL)

async_session_maker = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False
)
ScopedSession = async_scoped_session(async_session_maker, scopefunc=asyncio.current_task)

Base = declarative_base()


active_connections = {}


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
                    new_members = current_members + [data['members']]
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


