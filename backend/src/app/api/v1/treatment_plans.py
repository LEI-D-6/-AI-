"""治疗计划管理模块API路由"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from ...core.database import get_db
from .auth import get_current_active_user
from ...models.user import User
from ...models.treatment_plan import TreatmentPlan, PlanStatus
from datetime import datetime

router = APIRouter()


@router.get("", response_model=List[Dict[str, Any]])
async def get_treatment_plans(
    patient_id: int = Query(None, description="患者ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """获取治疗计划列表
    
    Args:
        patient_id: 患者ID（可选）
        db: 数据库会话
        current_user: 当前活跃用户
        
    Returns:
        List[Dict]: 治疗计划列表
    """
    query = db.query(TreatmentPlan)
    
    if patient_id:
        query = query.filter(TreatmentPlan.patient_id == patient_id)
    
    plans = query.all()
    
    return [
        {
            "id": plan.id,
            "patient_id": plan.patient_id,
            "medication_name": plan.medication_name,
            "dosage": plan.dosage,
            "frequency": plan.frequency,
            "duration": plan.duration,
            "instructions": plan.instructions,
            "status": plan.status.value,
            "created_at": plan.created_at.isoformat(),
            "updated_at": plan.updated_at.isoformat()
        }
        for plan in plans
    ]


@router.post("", response_model=Dict[str, Any])
async def create_treatment_plan(
    plan_data: Dict[str, Any],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """创建治疗计划
    
    Args:
        plan_data: 治疗计划数据
        db: 数据库会话
        current_user: 当前活跃用户
        
    Returns:
        Dict: 创建的治疗计划
    """
    # 验证必要字段
    required_fields = ["patient_id", "medication_name", "dosage", "frequency", "duration"]
    for field in required_fields:
        if field not in plan_data:
            raise HTTPException(status_code=400, detail=f"缺少必要字段: {field}")
    
    # 创建治疗计划
    new_plan = TreatmentPlan(
        patient_id=plan_data["patient_id"],
        medication_name=plan_data["medication_name"],
        dosage=plan_data["dosage"],
        frequency=plan_data["frequency"],
        duration=plan_data["duration"],
        instructions=plan_data.get("instructions"),
        status=PlanStatus.ACTIVE
    )
    
    db.add(new_plan)
    db.commit()
    db.refresh(new_plan)
    
    return {
        "id": new_plan.id,
        "patient_id": new_plan.patient_id,
        "medication_name": new_plan.medication_name,
        "dosage": new_plan.dosage,
        "frequency": new_plan.frequency,
        "duration": new_plan.duration,
        "instructions": new_plan.instructions,
        "status": new_plan.status.value,
        "created_at": new_plan.created_at.isoformat(),
        "updated_at": new_plan.updated_at.isoformat()
    }


@router.delete("/{plan_id}", response_model=Dict[str, str])
async def delete_treatment_plan(
    plan_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """删除治疗计划
    
    Args:
        plan_id: 治疗计划ID
        db: 数据库会话
        current_user: 当前活跃用户
        
    Returns:
        Dict: 删除结果
    """
    plan = db.query(TreatmentPlan).filter(TreatmentPlan.id == plan_id).first()
    
    if not plan:
        raise HTTPException(status_code=404, detail="治疗计划不存在")
    
    db.delete(plan)
    db.commit()
    
    return {"message": "治疗计划删除成功"}


@router.put("/{plan_id}", response_model=Dict[str, Any])
async def update_treatment_plan(
    plan_id: int,
    plan_data: Dict[str, Any],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """更新治疗计划
    
    Args:
        plan_id: 治疗计划ID
        plan_data: 治疗计划数据
        db: 数据库会话
        current_user: 当前活跃用户
        
    Returns:
        Dict: 更新后的治疗计划
    """
    plan = db.query(TreatmentPlan).filter(TreatmentPlan.id == plan_id).first()
    
    if not plan:
        raise HTTPException(status_code=404, detail="治疗计划不存在")
    
    # 更新治疗计划字段
    if "medication_name" in plan_data:
        plan.medication_name = plan_data["medication_name"]
    if "dosage" in plan_data:
        plan.dosage = plan_data["dosage"]
    if "frequency" in plan_data:
        plan.frequency = plan_data["frequency"]
    if "duration" in plan_data:
        plan.duration = plan_data["duration"]
    if "instructions" in plan_data:
        plan.instructions = plan_data["instructions"]
    if "status" in plan_data:
        plan.status = PlanStatus(plan_data["status"])
    
    db.commit()
    db.refresh(plan)
    
    return {
        "id": plan.id,
        "patient_id": plan.patient_id,
        "medication_name": plan.medication_name,
        "dosage": plan.dosage,
        "frequency": plan.frequency,
        "duration": plan.duration,
        "instructions": plan.instructions,
        "status": plan.status.value,
        "created_at": plan.created_at.isoformat(),
        "updated_at": plan.updated_at.isoformat()
    }
