"""认证相关的数据模型"""
from typing import Optional
from pydantic import BaseModel, EmailStr


class UserLogin(BaseModel):
    """用户登录模型"""
    username: str
    password: str


class UserRegister(BaseModel):
    """用户注册模型"""
    username: str
    email: EmailStr
    password: str
    full_name: str
    role: str = "patient"


class Token(BaseModel):
    """令牌模型"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """令牌数据模型"""
    user_id: Optional[int] = None
    username: Optional[str] = None
    role: Optional[str] = None