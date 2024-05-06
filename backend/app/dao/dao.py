from sqlalchemy import delete, insert, select, update
from sqlalchemy.exc import SQLAlchemyError

from backend.app.database.database import async_session_maker


class BaseDAO:
    model = None

    @classmethod
    async def find_one_or_none(cls, **filter_by):
        async with async_session_maker() as session:
            query = select(cls.model.__table__.columns).filter_by(**filter_by)
            result = await session.execute(query)
            return result.mappings().one_or_none()

    @classmethod
    async def find_all(cls, **filter_by):
        async with async_session_maker() as session:
            query = select(cls.model.__table__.columns).filter_by(**filter_by)
            result = await session.execute(query)
            return result.scalars().all()

    @classmethod
    async def find_all_columns(cls, **filter_by):
        async with async_session_maker() as session:
            query = select(cls.model).filter_by(**filter_by)
            result = await session.execute(query)
            return result.scalars().all()

    @classmethod
    async def find_status(cls, **filter_by):
        async with async_session_maker() as session:
            query = select(cls.model.__table__.columns).filter_by(**filter_by)
            result = await session.execute(query)
            return result.mappings().one_or_none()

    @classmethod
    async def add(cls, **data):
        try:
            query = insert(cls.model).values(**data).returning(cls.model.id)
            async with async_session_maker() as session:
                result = await session.execute(query)
                await session.commit()
                return result.mappings().first()
        except (SQLAlchemyError, Exception) as e:
            if isinstance(e, SQLAlchemyError):
                print(f"Database Exc: Cannot insert data into table: {e}")
            elif isinstance(e, Exception):
                print(f"Unknown Exc: Cannot insert data into table: {e}")

            return None

    @classmethod
    async def update(cls, id: int, **data):
        async with async_session_maker() as session:
            query = (
                update(cls.model).
                where(cls.model.id == id).
                values(**data).
                execution_options(synchronize_session="fetch")
                )
            try:
                result = await session.execute(query)
                await session.commit()
                return result.rowcount
            except (SQLAlchemyError, Exception) as e:
                print(f"Error updating data in table {cls.model.__tablename__}: {e}")
                await session.rollback()
                return None

    @classmethod
    async def delete(cls, **filter_by):
        async with async_session_maker() as session:
            query = delete(cls.model).filter_by(**filter_by)
            await session.execute(query)
            await session.commit()

