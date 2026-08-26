from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
from ...core.database import get_db
from .auth import get_current_user
from ...models.message import Message
from ...models.user import User
from ...models.doctor_patient import DoctorPatient
from ...schemas.message import MessageCreate, MessageResponse, MessageList

# 辅助函数：获取用户角色
async def get_user_role(current_user: User = Depends(get_current_user)):
    """获取当前用户角色
    
    Args:
        current_user: 当前用户
        
    Returns:
        str: 用户角色
    """
    return current_user.role

router = APIRouter()

@router.post("/", response_model=MessageResponse)
def create_message(
    message: MessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    user_role: str = Depends(get_user_role)
):
    # 验证发送者类型
    if user_role == "patient" and message.sender_type != "patient":
        raise HTTPException(status_code=403, detail="患者只能发送患者类型的消息")
    if user_role == "doctor" and message.sender_type != "doctor":
        raise HTTPException(status_code=403, detail="医生只能发送医生类型的消息")

    # 验证医患关系
    doctor_patient_relationship = db.query(DoctorPatient).filter(
        DoctorPatient.patient_id == message.patient_id,
        DoctorPatient.doctor_id == message.doctor_id
    ).first()
    
    if not doctor_patient_relationship:
        raise HTTPException(status_code=403, detail="您不是该医生的患者，无法发送消息")

    # 创建消息
    db_message = Message(
        patient_id=message.patient_id,
        doctor_id=message.doctor_id,
        sender_type=message.sender_type,
        content=message.content
    )
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    return db_message

@router.get("/", response_model=List[MessageResponse])
def get_messages(
    patient_id: int = Query(..., description="患者ID"),
    doctor_id: int = Query(..., description="医生ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    user_role: str = Depends(get_user_role)
):
    # 验证权限
    if user_role == "patient" and current_user.id != patient_id:
        raise HTTPException(status_code=403, detail="患者只能查看自己的消息")
    if user_role == "doctor" and current_user.id != doctor_id:
        raise HTTPException(status_code=403, detail="医生只能查看自己的消息")

    # 验证医患关系
    doctor_patient_relationship = db.query(DoctorPatient).filter(
        DoctorPatient.patient_id == patient_id,
        DoctorPatient.doctor_id == doctor_id
    ).first()
    
    if not doctor_patient_relationship:
        raise HTTPException(status_code=403, detail="您不是该医生的患者，无法查看消息")

    # 获取消息
    messages = db.query(Message).filter(
        Message.patient_id == patient_id,
        Message.doctor_id == doctor_id
    ).order_by(Message.created_at).all()

    # 标记消息为已读
    for message in messages:
        if message.sender_type == "patient" and user_role == "doctor":
            message.read = True
    db.commit()

    return messages

@router.get("/unread-count", response_model=dict)
def get_unread_count(
    patient_id: int = Query(..., description="患者ID"),
    doctor_id: int = Query(..., description="医生ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    user_role: str = Depends(get_user_role)
):
    # 验证权限
    if user_role == "patient" and current_user.id != patient_id:
        raise HTTPException(status_code=403, detail="患者只能查看自己的未读消息数")
    if user_role == "doctor" and current_user.id != doctor_id:
        raise HTTPException(status_code=403, detail="医生只能查看自己的未读消息数")

    # 验证医患关系
    doctor_patient_relationship = db.query(DoctorPatient).filter(
        DoctorPatient.patient_id == patient_id,
        DoctorPatient.doctor_id == doctor_id
    ).first()
    
    if not doctor_patient_relationship:
        raise HTTPException(status_code=403, detail="您不是该医生的患者，无法查看未读消息数")

    # 获取未读消息数
    unread_count = db.query(Message).filter(
        Message.patient_id == patient_id,
        Message.doctor_id == doctor_id,
        Message.sender_type == "patient" if user_role == "doctor" else "doctor",
        Message.read == False
    ).count()

    return {"unread_count": unread_count}
