"""医生患者关系相关的数据传输对象"""
from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class DoctorRequestCreate(BaseModel):
    """创建医生请求的输入模型"""
    doctor_id: int


class DoctorRequestUpdate(BaseModel):
    """更新医生请求的输入模型"""
    status: str


class UserInfo(BaseModel):
    """用户信息模型"""
    id: int
    full_name: str
    username: str
    email: str
    
    class Config:
        from_attributes = True


class DoctorRequestResponse(BaseModel):
    """医生请求的响应模型"""
    id: int
    doctor_id: int
    patient_id: int
    status: str
    created_at: datetime
    updated_at: datetime
    
    # 关联的用户信息
    doctor: Optional[UserInfo] = None
    patient: Optional[UserInfo] = None
    
    class Config:
        from_attributes = True


class DoctorPatientResponse(BaseModel):
    """医生患者关系的响应模型"""
    id: int
    doctor_id: int
    patient_id: int
    created_at: datetime
    
    # 关联的用户信息
    doctor: Optional[UserInfo] = None
    patient: Optional[UserInfo] = None
    
    class Config:
        from_attributes = True
