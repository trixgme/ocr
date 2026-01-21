"""Database connection management."""

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

from app.config import settings

# Create async engine
engine = create_async_engine(
    settings.database_url,
    echo=settings.debug,
)

# Session factory (compatible with older SQLAlchemy)
async_session = sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


async def get_db():
    """Dependency for getting database session."""
    async with async_session() as session:
        try:
            yield session
        finally:
            await session.close()
