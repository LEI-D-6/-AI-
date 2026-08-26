"""健康数据相关模型"""
from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey, String
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from ..core.database import Base


class HealthData(Base):
    """健康数据表模型"""
    __tablename__ = "health_data"
    
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    data_type = Column(String(50), nullable=False)  # 如：blood_pressure, blood_sugar, heart_rate等
    value = Column(Float, nullable=False)
    unit = Column(String(20), nullable=False)
    recorded_at = Column(DateTime(timezone=True), server_default=func.now())
    notes = Column(String(255))
    
    # 关系
    patient = relationship("User", foreign_keys=[patient_id])
    
    def __repr__(self):
        return f"<HealthData {self.id}: {self.data_type} = {self.value} {self.unit}>"