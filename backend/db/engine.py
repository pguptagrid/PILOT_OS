"""Async SQLite engine + session factory. FSE-A owns this."""

import os

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from backend.core.config import settings

os.makedirs("data", exist_ok=True)


class Base(DeclarativeBase):
    pass


engine = create_async_engine(settings.DATABASE_URL, echo=False)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)


async def init_db():
    from backend.db import models  # noqa — registers all ORM classes

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

        def migrate_status_col(connection):
            # Using raw SQLite connection to safely add the column if missing
            dbapi_conn = connection.connection
            cursor = dbapi_conn.cursor()
            cursor.execute("PRAGMA table_info(users);")
            cols = [c[1] for c in cursor.fetchall()]
            if "status" not in cols:
                cursor.execute("ALTER TABLE users ADD COLUMN status VARCHAR DEFAULT 'offline';")
                dbapi_conn.commit()

        await conn.run_sync(migrate_status_col)


async def get_db() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        yield session
