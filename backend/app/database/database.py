from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_scoped_session, async_sessionmaker
from sqlalchemy.orm import declarative_base, sessionmaker
import asyncio

# Local SQLite URL configuration
DATABASE_URL = "sqlite+aiosqlite:///backend/app/database/kinobase.db.db"


# Create an asynchronous engine
engine = create_async_engine(DATABASE_URL)

async_session_maker = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False
)
ScopedSession = async_scoped_session(async_session_maker, scopefunc=asyncio.current_task)

# Base class for declarative models
Base = declarative_base()
