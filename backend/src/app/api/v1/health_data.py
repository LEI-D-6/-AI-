"""健康数据管理模块API路由"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from datetime import datetime, timedelta
from ...core.database import get_db
from .auth import get_current_active_user
from ...models.user import User
from ...models.health_data import HealthData

router = APIRouter()


@router.get("/{patient_id}", response_model=List[dict])
async def get_health_data_by_patient_id(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """获取指定患者的健康数据列表"""
    # 验证用户权限
    if current_user.role == "patient" and patient_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="患者只能查看自己的健康数据"
        )
    
    # 构建查询
    query = db.query(HealthData).filter(HealthData.patient_id == patient_id)
    
    # 执行查询
    health_data = query.order_by(HealthData.recorded_at.desc()).all()
    
    # 转换为字典列表
    result = []
    for data in health_data:
        result.append({
            "id": data.id,
            "patient_id": data.patient_id,
            "data_type": data.data_type,
            "value": data.value,
            "unit": data.unit,
            "recorded_at": data.recorded_at,
            "notes": data.notes
        })
    
    return result


@router.get("", response_model=List[dict])
async def get_health_data(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    patient_id: int = None,
    data_type: str = None,
    start_date: datetime = None,
    end_date: datetime = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """获取健康数据列表
    
    Args:
        skip: 跳过数量
        limit: 限制数量
        patient_id: 患者ID（可选）
        data_type: 数据类型（可选）
        start_date: 开始日期（可选）
        end_date: 结束日期（可选）
        db: 数据库会话
        current_user: 当前活跃用户
        
    Returns:
        List[dict]: 健康数据列表
    """
    # 验证用户权限
    if current_user.role == "patient" and patient_id is not None:
        # 确保类型一致
        try:
            patient_id_int = int(patient_id)
        except ValueError:
            patient_id_int = patient_id
        
        if patient_id_int != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="患者只能查看自己的健康数据"
            )
    
    # 如果是患者，默认查看自己的数据
    if current_user.role == "patient" and patient_id is None:
        patient_id = current_user.id
    
    # 构建查询
    query = db.query(HealthData)
    
    # 应用过滤条件
    if patient_id is not None:
        query = query.filter(HealthData.patient_id == patient_id)
    if data_type is not None:
        query = query.filter(HealthData.data_type == data_type)
    if start_date is not None:
        query = query.filter(HealthData.recorded_at >= start_date)
    if end_date is not None:
        query = query.filter(HealthData.recorded_at <= end_date)
    
    # 执行查询
    health_data = query.order_by(HealthData.recorded_at.desc()).offset(skip).limit(limit).all()
    
    # 转换为字典列表
    result = []
    for data in health_data:
        result.append({
            "id": data.id,
            "patient_id": data.patient_id,
            "data_type": data.data_type,
            "value": data.value,
            "unit": data.unit,
            "recorded_at": data.recorded_at,
            "notes": data.notes
        })
    
    return result


@router.get("/detail/{data_id}", response_model=dict)
async def get_health_data_detail(
    data_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """获取健康数据详情
    
    Args:
        data_id: 健康数据ID
        db: 数据库会话
        current_user: 当前活跃用户
        
    Returns:
        dict: 健康数据详情
    """
    # 查询健康数据
    health_data = db.query(HealthData).filter(HealthData.id == data_id).first()
    if not health_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="健康数据不存在"
        )
    
    # 验证用户权限
    if current_user.role == "patient" and health_data.patient_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="患者只能查看自己的健康数据"
        )
    
    # 返回健康数据详情
    return {
        "id": health_data.id,
        "patient_id": health_data.patient_id,
        "data_type": health_data.data_type,
        "value": health_data.value,
        "unit": health_data.unit,
        "recorded_at": health_data.recorded_at,
        "notes": health_data.notes
    }


@router.post("")
async def add_health_data(
    data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """添加健康数据
    
    Args:
        data: 健康数据
        db: 数据库会话
        current_user: 当前活跃用户
        
    Returns:
        dict: 添加结果
    """
    # 验证用户权限
    if current_user.role == "patient" and data.get("patient_id") is not None and data.get("patient_id") != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="患者只能添加自己的健康数据"
        )
    
    # 如果是患者，默认添加自己的数据
    if current_user.role == "patient" and data.get("patient_id") is None:
        data["patient_id"] = current_user.id
    
    # 验证健康数据
    required_fields = ["data_type", "value", "unit"]
    for field in required_fields:
        if field not in data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"缺少必要字段: {field}"
            )
    
    # 添加健康数据记录
    new_health_data = HealthData(
        patient_id=data["patient_id"],
        data_type=data["data_type"],
        value=data["value"],
        unit=data["unit"],
        notes=data.get("notes")
    )
    db.add(new_health_data)
    db.commit()
    db.refresh(new_health_data)
    
    # 返回添加结果
    return {
        "message": "健康数据添加成功",
        "data": {
            "id": new_health_data.id,
            "patient_id": new_health_data.patient_id,
            "data_type": new_health_data.data_type,
            "value": new_health_data.value,
            "unit": new_health_data.unit,
            "recorded_at": new_health_data.recorded_at,
            "notes": new_health_data.notes
        }
    }


@router.put("/{data_id}")
async def update_health_data(
    data_id: int,
    data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """更新健康数据
    
    Args:
        data_id: 健康数据ID
        data: 健康数据更新
        db: 数据库会话
        current_user: 当前活跃用户
        
    Returns:
        dict: 更新结果
    """
    # 查询健康数据
    health_data = db.query(HealthData).filter(HealthData.id == data_id).first()
    if not health_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="健康数据不存在"
        )
    
    # 验证用户权限
    if current_user.role == "patient" and health_data.patient_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="患者只能更新自己的健康数据"
        )
    
    # 更新健康数据记录
    if "data_type" in data:
        health_data.data_type = data["data_type"]
    if "value" in data:
        health_data.value = data["value"]
    if "unit" in data:
        health_data.unit = data["unit"]
    if "notes" in data:
        health_data.notes = data["notes"]
    
    db.commit()
    db.refresh(health_data)
    
    # 返回更新结果
    return {
        "message": "健康数据更新成功",
        "data": {
            "id": health_data.id,
            "patient_id": health_data.patient_id,
            "data_type": health_data.data_type,
            "value": health_data.value,
            "unit": health_data.unit,
            "recorded_at": health_data.recorded_at,
            "notes": health_data.notes
        }
    }


@router.delete("/{data_id}")
async def delete_health_data(
    data_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """删除健康数据
    
    Args:
        data_id: 健康数据ID
        db: 数据库会话
        current_user: 当前活跃用户
        
    Returns:
        dict: 删除结果
    """
    # 查询健康数据
    health_data = db.query(HealthData).filter(HealthData.id == data_id).first()
    if not health_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="健康数据不存在"
        )
    
    # 验证用户权限
    if current_user.role == "patient" and health_data.patient_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="患者只能删除自己的健康数据"
        )
    
    # 删除健康数据记录
    db.delete(health_data)
    db.commit()
    
    # 返回删除结果
    return {"message": "健康数据删除成功"}
