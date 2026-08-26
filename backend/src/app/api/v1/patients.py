"""患者管理模块API路由"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
from ...core.database import get_db
from .auth import get_current_active_user
from ...models.user import User

router = APIRouter()


@router.get("", response_model=List[dict])
async def get_patients(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """获取患者列表
    
    Args:
        skip: 跳过数量
        limit: 限制数量
        db: 数据库会话
        current_user: 当前活跃用户
        
    Returns:
        List[dict]: 患者列表
    """
    # 验证用户权限（医生或管理员）
    if current_user.role not in ["doctor", "admin"]:
        raise HTTPException(status_code=403, detail="无权限获取患者列表")
    
    # 查询患者数据
    patients = db.query(User).filter(User.role == "patient").offset(skip).limit(limit).all()
    
    # 返回患者列表
    return [
        {
            "id": patient.id,
            "username": patient.username,
            "email": patient.email,
            "full_name": patient.full_name,
            "is_active": patient.is_active,
            "created_at": patient.created_at.isoformat() if patient.created_at else None
        }
        for patient in patients
    ]


@router.get("/{patient_id}", response_model=dict)
async def get_patient(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """获取患者详情
    
    Args:
        patient_id: 患者ID
        db: 数据库会话
        current_user: 当前活跃用户
        
    Returns:
        dict: 患者详情
    """
    # 查询患者数据
    patient = db.query(User).filter(User.id == patient_id, User.role == "patient").first()
    
    if not patient:
        raise HTTPException(status_code=404, detail="患者不存在")
    
    # 返回患者详情
    return {
        "id": patient.id,
        "username": patient.username,
        "email": patient.email,
        "full_name": patient.full_name,
        "role": patient.role,
        "is_active": patient.is_active,
        "created_at": patient.created_at.isoformat() if patient.created_at else None
    }


@router.post("")
async def create_patient(
    patient_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """创建患者
    
    Args:
        patient_data: 患者数据
        db: 数据库会话
        current_user: 当前活跃用户
        
    Returns:
        dict: 创建结果
    """
    # TODO: 实现创建患者逻辑
    # 1. 验证用户权限（医生或管理员）
    # 2. 验证患者数据
    # 3. 创建患者记录
    # 4. 返回创建结果
    pass


@router.put("/{patient_id}")
async def update_patient(
    patient_id: int,
    patient_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """更新患者信息
    
    Args:
        patient_id: 患者ID
        patient_data: 患者更新数据
        db: 数据库会话
        current_user: 当前活跃用户
        
    Returns:
        dict: 更新结果
    """
    # TODO: 实现更新患者信息逻辑
    # 1. 验证用户权限
    # 2. 验证患者数据
    # 3. 更新患者记录
    # 4. 返回更新结果
    pass