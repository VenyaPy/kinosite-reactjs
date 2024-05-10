import asyncio

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


class BaseDAO:
    model = None

    @classmethod
    async def find_one_or_none(cls, **filter_by):
        async with ScopedSession() as session:
            query = select(cls.model).filter_by(**filter_by)
            result = await session.execute(query)
            return result.scalars().one_or_none()

    @classmethod
    async def find_all(cls, **filter_by):
        async with ScopedSession() as session:
            query = select(cls.model).filter_by(**filter_by)
            result = await session.execute(query)
            return result.scalars().all()

    @classmethod
    async def find_all_columns(cls, **filter_by):
        async with ScopedSession() as session:
            query = select(cls.model).filter_by(**filter_by)
            result = await session.execute(query)
            return result.scalars().all()

    @classmethod
    async def find_status(cls, **filter_by):
        async with ScopedSession() as session:
            query = select(cls.model).filter_by(**filter_by)
            result = await session.execute(query)
            return result.scalars().one_or_none()

    @classmethod
    async def add(cls, **data):
        try:
            query = insert(cls.model).values(**data)
            async with ScopedSession() as session:
                await session.execute(query)
                await session.commit()
                return session.get_bind().execute('SELECT last_insert_rowid()').fetchone()[0]
        except (SQLAlchemyError, Exception) as e:
            print(f"Database Exc: Cannot insert data into table: {e}")
            return None

    @classmethod
    async def update(cls, id: int, **data):
        try:
            query = (
                update(cls.model).
                where(cls.model.id == id).
                values(**data)
            )
            async with ScopedSession() as session:
                result = await session.execute(query)
                await session.commit()
                return result.rowcount
        except (SQLAlchemyError, Exception) as e:
            print(f"Error updating data in table {cls.model.__tablename__}: {e}")
            await session.rollback()
            return None

    @classmethod
    async def delete(cls, **filter_by):
        async with ScopedSession() as session:
            query = delete(cls.model).filter_by(**filter_by)
            await session.execute(query)
            await session.commit()

