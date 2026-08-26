"""应用配置模块"""
from typing import List
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """应用配置类"""
    # 应用基本配置
    APP_NAME: str = "Chronic Disease Management System"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    
    # 数据库配置
    # PostgreSQL配置
    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: int = 5432
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "123456"
    POSTGRES_DB: str = "postgres"
    POSTGRES_URL: str = ""  
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # 动态计算POSTGRES_URL
        self.POSTGRES_URL = f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
    
    # MongoDB配置
    MONGODB_URL: str = "mongodb://localhost:27017"
    MONGODB_DB: str = "chronic_disease"
    
    # 认证配置
    SECRET_KEY: str = "your-secret-key-here"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # CORS配置
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:3001"]
    
    # AI服务配置
    QIANWEN_API_KEY: str = "your-qianwen-api-key"
    QIANWEN_API_URL: str = "https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/completions"
    BAIDU_API_KEY: str = "tKMWZXh2vZpBlWWgLxYO6ZvY"
    BAIDU_SECRET_KEY: str = "s08EPu3JqgqmNREeywrowk6WBGdScfXo"
    
    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings():
    """获取配置实例（单例模式）"""
    return Settings()


# 导出配置实例
settings = get_settings()