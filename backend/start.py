"""启动应用脚本（修复路径版）"""
import subprocess
import time
import os
import sys
import uvicorn
import logging

# 确保能导入 src 模块
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# 修复打包环境中 sys.stdout 或 sys.stderr 为 None 的问题
class DummyStream:
    def write(self, data):
        pass
    def flush(self):
        pass
    def isatty(self):
        return False

if sys.stdout is None:
    sys.stdout = DummyStream()
if sys.stderr is None:
    sys.stderr = DummyStream()

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

# 显式导入 passlib，确保 PyInstaller 能正确打包
from passlib.handlers.pbkdf2 import pbkdf2_sha256

def start_mongodb():
    print("正在检查 MongoDB...")
    try:
        subprocess.run('net start MongoDB', shell=True, capture_output=True)
        time.sleep(2)
        print("MongoDB 已启动")
    except Exception as e:
        print(f"MongoDB启动异常: {e}")

def init_database():
    print("正在初始化数据库...")
    try:
        # 直接导入并运行数据库初始化
        from src.app.core.database_init import init_databases
        import asyncio
        asyncio.run(init_databases())
        print("数据库初始化完成")
    except Exception as e:
        print(f"数据库初始化异常: {e}")

if __name__ == "__main__":
    # 切换到 backend 目录（start.py所在目录）
    os.chdir(os.path.dirname(__file__))
    
    # 启动MongoDB
    start_mongodb()
    
    # 初始化数据库
    init_database()

    # 配置 uvicorn 日志
    log_config = {
        "version": 1,
        "disable_existing_loggers": False,
        "formatters": {
            "default": {
                "format": "%(asctime)s - %(name)s - %(levelname)s - %(message)s",
            },
        },
        "handlers": {
            "default": {
                "formatter": "default",
                "class": "logging.StreamHandler",
            },
        },
        "loggers": {
            "uvicorn": {
                "handlers": ["default"],
                "level": "INFO",
            },
            "uvicorn.error": {
                "handlers": ["default"],
                "level": "INFO",
                "propagate": False,
            },
            "uvicorn.access": {
                "handlers": ["default"],
                "level": "INFO",
                "propagate": False,
            },
        },
    }

    # 直接导入 app 实例
    from src.app.main import app
    
    # 直接使用 uvicorn.run 启动服务
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        reload=False,  # 打包必须关闭 reload
        log_config=log_config
    )