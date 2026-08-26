"""FastAPI应用主入口文件"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
from .core.config import settings
from .api.v1 import auth, users, patients, medical_records, health_data, ai, messages, doctor_patient, treatment_plans
from .core.database_init import init_databases
import os


@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期管理"""
    print("应用启动中...")
    await init_databases()
    yield
    print("应用关闭中...")


# 创建FastAPI应用实例
app = FastAPI(
    title="慢性病智能管理系统",
    description="基于患者结构化数据的慢性病智能管理系统API",
    version="1.0.0",
    lifespan=lifespan
)

# 确保上传目录存在
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# 挂载静态文件服务
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# 配置CORS
print(f"[DEBUG] CORS_ORIGINS: {settings.CORS_ORIGINS}")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 允许所有跨域请求
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(auth.router, prefix="/api/v1/auth", tags=["认证"])
app.include_router(users.router, prefix="/api/v1/users", tags=["用户管理"])
app.include_router(patients.router, prefix="/api/v1/patients", tags=["患者管理"])
app.include_router(medical_records.router, prefix="/api/v1/medical-records", tags=["病历管理"])
app.include_router(health_data.router, prefix="/api/v1/health-data", tags=["健康数据"])
app.include_router(ai.router, prefix="/api/v1/ai", tags=["AI服务"])
app.include_router(messages.router, prefix="/api/v1/messages", tags=["消息管理"])
app.include_router(doctor_patient.router, prefix="/api/v1", tags=["医生患者关系"])
app.include_router(treatment_plans.router, prefix="/api/v1/treatment-plans", tags=["治疗计划管理"])

# 根路径
@app.get("/")
async def root():
    """根路径，返回系统信息"""
    return {
        "message": "欢迎使用慢性病智能管理系统API",
        "version": "1.0.0",
        "docs": "/docs"
    }

# 健康检查
@app.get("/health")
async def health_check():
    """健康检查接口"""
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8004)