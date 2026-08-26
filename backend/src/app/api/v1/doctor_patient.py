"""医生患者关系API"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ...core.database import get_db
from .auth import get_current_user
from ...models.user import User, UserRole
from ...models.doctor_patient import DoctorPatient, DoctorRequest, RequestStatus
from ...schemas.doctor_patient import (
    DoctorRequestCreate, DoctorRequestResponse, 
    DoctorRequestUpdate, DoctorPatientResponse
)

router = APIRouter()


@router.post("/doctor-requests", response_model=DoctorRequestResponse, status_code=status.HTTP_201_CREATED)
async def create_doctor_request(
    request: DoctorRequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """创建添加医生请求"""
    # 确保当前用户是患者
    if current_user.role != UserRole.PATIENT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="只有患者可以发送添加医生请求"
        )
    
    # 检查目标用户是否是医生
    doctor = db.query(User).filter(User.id == request.doctor_id).first()
    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="医生不存在"
        )
    if doctor.role != UserRole.DOCTOR:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="目标用户不是医生"
        )
    
    # 检查是否已经存在未处理的请求
    existing_request = db.query(DoctorRequest).filter(
        DoctorRequest.doctor_id == request.doctor_id,
        DoctorRequest.patient_id == current_user.id,
        DoctorRequest.status == RequestStatus.PENDING
    ).first()
    if existing_request:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="已经存在未处理的添加医生请求"
        )
    
    # 检查是否已经是医患关系
    existing_relationship = db.query(DoctorPatient).filter(
        DoctorPatient.doctor_id == request.doctor_id,
        DoctorPatient.patient_id == current_user.id
    ).first()
    if existing_relationship:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="已经是该医生的患者"
        )
    
    # 创建新的请求
    new_request = DoctorRequest(
        doctor_id=request.doctor_id,
        patient_id=current_user.id
    )
    db.add(new_request)
    db.commit()
    db.refresh(new_request)
    
    return new_request


@router.get("/doctor-requests", response_model=List[DoctorRequestResponse])
async def get_doctor_requests(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取医生请求
    - 患者：获取自己发送的请求
    - 医生：获取自己收到的请求
    """
    if current_user.role == UserRole.PATIENT:
        # 患者获取自己发送的请求
        requests = db.query(DoctorRequest).filter(
            DoctorRequest.patient_id == current_user.id
        ).all()
    elif current_user.role == UserRole.DOCTOR:
        # 医生获取自己收到的请求
        requests = db.query(DoctorRequest).filter(
            DoctorRequest.doctor_id == current_user.id
        ).all()
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="无权限访问"
        )
    
    return requests


@router.put("/doctor-requests/{request_id}", response_model=DoctorRequestResponse)
async def update_doctor_request(
    request_id: int,
    update: DoctorRequestUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """更新医生请求状态（仅医生可操作）"""
    # 确保当前用户是医生
    if current_user.role != UserRole.DOCTOR:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="只有医生可以处理添加请求"
        )
    
    # 查找请求
    request = db.query(DoctorRequest).filter(
        DoctorRequest.id == request_id,
        DoctorRequest.doctor_id == current_user.id
    ).first()
    if not request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="请求不存在"
        )
    
    # 检查请求状态
    if request.status != RequestStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="请求已经处理过"
        )
    
    # 更新状态
    request.status = update.status
    db.commit()
    
    # 如果接受请求，创建医患关系
    if update.status == RequestStatus.ACCEPTED:
        new_relationship = DoctorPatient(
            doctor_id=request.doctor_id,
            patient_id=request.patient_id
        )
        db.add(new_relationship)
        db.commit()
    
    db.refresh(request)
    return request


@router.get("/my-doctors", response_model=List[DoctorPatientResponse])
async def get_my_doctors(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取我的医生（仅患者可操作）"""
    if current_user.role != UserRole.PATIENT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="只有患者可以查看自己的医生"
        )
    
    relationships = db.query(DoctorPatient).filter(
        DoctorPatient.patient_id == current_user.id
    ).all()
    
    return relationships


@router.get("/my-patients", response_model=List[dict])
async def get_my_patients(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取我的患者（仅医生可操作）"""
    if current_user.role != UserRole.DOCTOR:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="只有医生可以查看自己的患者"
        )
    
    # 查询医患关系，并关联患者信息
    relationships = db.query(DoctorPatient, User).join(
        User, DoctorPatient.patient_id == User.id
    ).filter(
        DoctorPatient.doctor_id == current_user.id
    ).all()
    
    # 构建包含患者详细信息的响应
    result = []
    for relationship, patient in relationships:
        result.append({
            "id": patient.id,
            "full_name": patient.full_name,
            "username": patient.username,
            "email": patient.email,
            "gender": getattr(patient, 'gender', None),
            "age": getattr(patient, 'age', None),
            "diagnosis": getattr(patient, 'diagnosis', None),
            "last_visit": getattr(patient, 'last_visit', None),
            "next_appointment": getattr(patient, 'next_appointment', None),
            "status": getattr(patient, 'status', None),
            "adherence": getattr(patient, 'adherence', 0),
            "phone": getattr(patient, 'phone', None)
        })
    
    return result


@router.get("/doctors", response_model=List[dict])
async def get_doctors(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取未添加的医生列表"""
    # 获取当前患者已经添加的医生ID
    added_doctor_ids = db.query(DoctorPatient.doctor_id).filter(
        DoctorPatient.patient_id == current_user.id
    ).all()
    added_doctor_ids = [id[0] for id in added_doctor_ids]
    
    # 获取所有医生，并过滤掉已经添加的医生
    doctors = db.query(User).filter(
        User.role == UserRole.DOCTOR,
        User.id.notin_(added_doctor_ids)
    ).all()
    
    return [{
        "id": doctor.id,
        "full_name": doctor.full_name,
        "username": doctor.username,
        "email": doctor.email
    } for doctor in doctors]
