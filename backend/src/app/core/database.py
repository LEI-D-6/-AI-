"""数据库连接配置模块"""
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from motor.motor_asyncio import AsyncIOMotorClient
from .config import settings

# 延迟初始化数据库连接
engine = None
SessionLocal = None
Base = declarative_base()
mongodb_client = None
mongodb_db = None


def init_db():
    """初始化数据库连接"""
    global engine, SessionLocal, mongodb_client, mongodb_db
    
    # PostgreSQL配置
    engine = create_engine(
        settings.POSTGRES_URL,
        pool_pre_ping=True,
        pool_size=10,
        max_overflow=20
    )
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    
    # MongoDB配置
    mongodb_client = AsyncIOMotorClient(settings.MONGODB_URL)
    mongodb_db = mongodb_client[settings.MONGODB_DB]


def get_db():
    """获取数据库会话"""
    if SessionLocal is None:
        init_db()
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_mongodb():
    """获取MongoDB数据库实例"""
    if mongodb_db is None:
        init_db()
    return mongodb_db