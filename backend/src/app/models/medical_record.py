"""病历相关模型"""
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from ..core.database import Base


class MedicalRecord(Base):
    """病历表模型"""
    __tablename__ = "medical_records"
    
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    doctor_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    visit_date = Column(DateTime, nullable=False)
    department = Column(String(100), nullable=False)
    diagnosis = Column(Text, nullable=False)
    treatment_plan = Column(Text)
    notes = Column(Text)
    image_paths = Column(Text)  # 存储图片路径，多个路径用逗号分隔
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # 关系
    patient = relationship("User", foreign_keys=[patient_id])
    doctor = relationship("User", foreign_keys=[doctor_id])
    
    # TODO: 添加与健康数据的关系
    
    def __repr__(self):
        return f"<MedicalRecord {self.id}>"