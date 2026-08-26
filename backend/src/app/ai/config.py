"""AI服务配置模块"""
from ..core.config import settings


class AIConfig:
    """AI服务配置类"""
    # 百度千问API配置
    QIANWEN_API_KEY = settings.QIANWEN_API_KEY
    QIANWEN_API_URL = settings.QIANWEN_API_URL
    BAIDU_API_KEY = settings.BAIDU_API_KEY
    BAIDU_SECRET_KEY = settings.BAIDU_SECRET_KEY
    
    # 数据处理配置
    MAX_SEQUENCE_LENGTH = 512
    BATCH_SIZE = 32


# 导出配置实例
ai_config = AIConfig()