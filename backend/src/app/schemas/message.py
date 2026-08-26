from pydantic import BaseModel
from datetime import datetime
from typing import List

class MessageBase(BaseModel):
    patient_id: int
    doctor_id: int
    sender_type: str
    content: str

class MessageCreate(MessageBase):
    pass

class MessageResponse(MessageBase):
    id: int
    read: bool
    created_at: datetime

    class Config:
        from_attributes = True

class MessageList(BaseModel):
    messages: List[MessageResponse]
