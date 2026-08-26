"""病历管理模块API路由"""
from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from ...core.database import get_db
from .auth import get_current_active_user
from ...models.user import User, UserRole
from ...models.medical_record import MedicalRecord
import os
from datetime import datetime
import shutil

router = APIRouter()

# 上传目录
UPLOAD_DIR = "uploads/medical_records"

# 确保上传目录存在
print(f"[DEBUG] 上传目录: {UPLOAD_DIR}")
os.makedirs(UPLOAD_DIR, exist_ok=True)
print(f"[DEBUG] 目录存在: {os.path.exists(UPLOAD_DIR)}")
print(f"[DEBUG] 目录绝对路径: {os.path.abspath(UPLOAD_DIR)}")


@router.get("", response_model=List[dict])
async def get_medical_records(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    patient_id: int = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """获取病历列表
    
    Args:
        skip: 跳过数量
        limit: 限制数量
        patient_id: 患者ID（可选）
        db: 数据库会话
        current_user: 当前活跃用户
        
    Returns:
        List[dict]: 病历列表
    """
    # 构建查询
    query = db.query(MedicalRecord)
    
    # 如果是患者，只能查看自己的病历
    if current_user.role == UserRole.PATIENT:
        query = query.filter(MedicalRecord.patient_id == current_user.id)
    # 如果是医生，可以查看指定患者的病历
    elif current_user.role == UserRole.DOCTOR and patient_id:
        query = query.filter(MedicalRecord.patient_id == patient_id)
    # 管理员可以查看所有病历
    
    # 执行查询
    records = query.offset(skip).limit(limit).all()
    
    # 转换为字典列表
    result = []
    for record in records:
        result.append({
            "id": record.id,
            "patient_id": record.patient_id,
            "doctor_id": record.doctor_id,
            "visit_date": record.visit_date.isoformat() if record.visit_date else None,
            "department": record.department,
            "diagnosis": record.diagnosis,
            "treatment_plan": record.treatment_plan,
            "notes": record.notes,
            "image_paths": record.image_paths.split(",") if record.image_paths else [],
            "created_at": record.created_at.isoformat() if record.created_at else None,
            "updated_at": record.updated_at.isoformat() if record.updated_at else None
        })
    
    return result


@router.get("/{record_id}", response_model=dict)
async def get_medical_record(
    record_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """获取病历详情
    
    Args:
        record_id: 病历ID
        db: 数据库会话
        current_user: 当前活跃用户
        
    Returns:
        dict: 病历详情
    """
    # 查询病历
    record = db.query(MedicalRecord).filter(MedicalRecord.id == record_id).first()
    
    if not record:
        raise HTTPException(status_code=404, detail="病历不存在")
    
    # 权限检查
    if current_user.role == UserRole.PATIENT and record.patient_id != current_user.id:
        raise HTTPException(status_code=403, detail="无权限访问此病历")
    
    # 转换为字典
    return {
        "id": record.id,
        "patient_id": record.patient_id,
        "doctor_id": record.doctor_id,
        "visit_date": record.visit_date.isoformat() if record.visit_date else None,
        "department": record.department,
        "diagnosis": record.diagnosis,
        "treatment_plan": record.treatment_plan,
        "notes": record.notes,
        "image_paths": record.image_paths.split(",") if record.image_paths else [],
        "created_at": record.created_at.isoformat() if record.created_at else None,
        "updated_at": record.updated_at.isoformat() if record.updated_at else None
    }


@router.post("")
async def create_medical_record(
    patient_id: int = Form(...),
    doctor_id: int = Form(...),
    visit_date: str = Form(...),
    department: str = Form(...),
    diagnosis: str = Form(...),
    treatment_plan: Optional[str] = Form(None),
    notes: Optional[str] = Form(None),
    files: List[UploadFile] = File([]),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """创建病历
    
    Args:
        patient_id: 患者ID
        doctor_id: 医生ID
        visit_date: 就诊日期
        department: 科室
        diagnosis: 诊断
        treatment_plan: 治疗方案
        notes: 备注
        files: 上传的图片文件
        db: 数据库会话
        current_user: 当前活跃用户
        
    Returns:
        dict: 创建结果
    """
    # 打印接收到的参数
    print(f"[DEBUG] 接收到的参数:")
    print(f"  patient_id: {patient_id}")
    print(f"  doctor_id: {doctor_id}")
    print(f"  visit_date: {visit_date}")
    print(f"  department: {department}")
    print(f"  diagnosis: {diagnosis}")
    print(f"  treatment_plan: {treatment_plan}")
    print(f"  notes: {notes}")
    print(f"  files count: {len(files)}")
    
    for i, file in enumerate(files):
        print(f"  File {i+1}:")
        print(f"    filename: {file.filename}")
        print(f"    content_type: {file.content_type}")
    # 权限检查
    if current_user.role not in [UserRole.DOCTOR, UserRole.ADMIN, UserRole.PATIENT]:
        raise HTTPException(status_code=403, detail="无权限创建病历")
    
    # 如果是患者，只能创建自己的病历
    if current_user.role == UserRole.PATIENT and patient_id != current_user.id:
        raise HTTPException(status_code=403, detail="无权限为其他患者创建病历")
    
    # 处理上传的图片
    image_paths = []
    print(f"[DEBUG] 接收到的文件数量: {len(files)}")
    if files:
        for i, file in enumerate(files):
            try:
                print(f"[DEBUG] 处理文件 {i+1}: {file.filename}")
                print(f"[DEBUG] 文件类型: {file.content_type}")
                
                # 生成唯一文件名
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                filename = f"{timestamp}_{file.filename}"
                filepath = os.path.join(UPLOAD_DIR, filename)
                
                print(f"[DEBUG] 保存路径: {filepath}")
                
                # 确保上传目录存在
                os.makedirs(UPLOAD_DIR, exist_ok=True)
                print(f"[DEBUG] 目录存在: {os.path.exists(UPLOAD_DIR)}")
                
                # 保存文件
                try:
                    contents = await file.read()
                    print(f"[DEBUG] 读取文件成功，大小: {len(contents)} 字节")
                    
                    with open(filepath, "wb") as buffer:
                        buffer.write(contents)
                    print(f"[DEBUG] 文件写入成功")
                except Exception as e:
                    print(f"[DEBUG] 文件读写失败: {str(e)}")
                    raise
                
                # 添加到路径列表
                image_paths.append(f"medical_records/{filename}")
                print(f"[DEBUG] 文件保存成功: {filename}")
            except Exception as e:
                print(f"[DEBUG] 文件保存失败: {str(e)}")
                raise HTTPException(status_code=500, detail=f"文件上传失败: {str(e)}")
    else:
        print("[DEBUG] 没有上传文件")
    
    # 创建病历记录
    new_record = MedicalRecord(
        patient_id=patient_id,
        doctor_id=doctor_id,
        visit_date=datetime.strptime(visit_date, "%Y-%m-%d"),
        department=department,
        diagnosis=diagnosis,
        treatment_plan=treatment_plan,
        notes=notes,
        image_paths=",".join(image_paths) if image_paths else None
    )
    
    db.add(new_record)
    db.commit()
    db.refresh(new_record)
    
    # 返回创建结果
    return {
        "id": new_record.id,
        "message": "病历创建成功",
        "data": {
            "patient_id": new_record.patient_id,
            "doctor_id": new_record.doctor_id,
            "visit_date": new_record.visit_date.isoformat() if new_record.visit_date else None,
            "department": new_record.department,
            "diagnosis": new_record.diagnosis,
            "treatment_plan": new_record.treatment_plan,
            "notes": new_record.notes,
            "image_paths": image_paths
        }
    }


@router.put("/{record_id}")
async def update_medical_record(
    record_id: int,
    visit_date: Optional[str] = Form(None),
    department: Optional[str] = Form(None),
    diagnosis: Optional[str] = Form(None),
    treatment_plan: Optional[str] = Form(None),
    notes: Optional[str] = Form(None),
    files: List[UploadFile] = File([]),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """更新病历
    
    Args:
        record_id: 病历ID
        visit_date: 就诊日期
        department: 科室
        diagnosis: 诊断
        treatment_plan: 治疗方案
        notes: 备注
        files: 上传的图片文件
        db: 数据库会话
        current_user: 当前活跃用户
        
    Returns:
        dict: 更新结果
    """
    # 查询病历
    record = db.query(MedicalRecord).filter(MedicalRecord.id == record_id).first()
    
    if not record:
        raise HTTPException(status_code=404, detail="病历不存在")
    
    # 权限检查
    if current_user.role not in [UserRole.DOCTOR, UserRole.ADMIN]:
        raise HTTPException(status_code=403, detail="无权限更新病历")
    
    # 更新字段
    if visit_date:
        record.visit_date = datetime.strptime(visit_date, "%Y-%m-%d")
    if department:
        record.department = department
    if diagnosis:
        record.diagnosis = diagnosis
    if treatment_plan:
        record.treatment_plan = treatment_plan
    if notes:
        record.notes = notes
    
    # 处理上传的图片
    if files:
        image_paths = []
        for file in files:
            # 生成唯一文件名
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"{timestamp}_{file.filename}"
            filepath = os.path.join(UPLOAD_DIR, filename)
            
            # 保存文件
            with open(filepath, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            
            # 添加到路径列表
            image_paths.append(f"medical_records/{filename}")
        
        # 更新图片路径
        record.image_paths = ",".join(image_paths) if image_paths else None
    
    db.commit()
    db.refresh(record)
    
    # 返回更新结果
    return {
        "id": record.id,
        "message": "病历更新成功",
        "data": {
            "patient_id": record.patient_id,
            "doctor_id": record.doctor_id,
            "visit_date": record.visit_date.isoformat() if record.visit_date else None,
            "department": record.department,
            "diagnosis": record.diagnosis,
            "treatment_plan": record.treatment_plan,
            "notes": record.notes,
            "image_paths": record.image_paths.split(",") if record.image_paths else []
        }
    }


@router.delete("/{record_id}")
async def delete_medical_record(
    record_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """删除病历
    
    Args:
        record_id: 病历ID
        db: 数据库会话
        current_user: 当前活跃用户
        
    Returns:
        dict: 删除结果
    """
    # 查询病历
    record = db.query(MedicalRecord).filter(MedicalRecord.id == record_id).first()
    
    if not record:
        raise HTTPException(status_code=404, detail="病历不存在")
    
    # 权限检查
    print(f"[DEBUG] 当前用户: id={current_user.id}, role={current_user.role}")
    print(f"[DEBUG] 病历: id={record.id}, patient_id={record.patient_id}")
    
    # 只有患者可以删除病历
    if current_user.role != UserRole.PATIENT:
        print(f"[DEBUG] 非患者角色，拒绝删除")
        raise HTTPException(status_code=403, detail="只有患者可以删除病历")
    
    # 患者只能删除自己的病历
    if record.patient_id != current_user.id:
        print(f"[DEBUG] 患者ID不匹配，拒绝删除")
        raise HTTPException(status_code=403, detail="无权限删除此病历")
    else:
        print(f"[DEBUG] 患者ID匹配，允许删除")
    
    # 删除关联的图片文件
    if record.image_paths:
        for image_path in record.image_paths.split(","):
            full_path = os.path.join(UPLOAD_DIR, image_path.split("/")[-1])
            if os.path.exists(full_path):
                os.remove(full_path)
    
    # 删除病历记录
    db.delete(record)
    db.commit()
    
    # 返回删除结果
    return {
        "message": "病历删除成功",
        "id": record_id
    }