"""Database initialization module"""
import asyncio
from sqlalchemy import create_engine, text
from motor.motor_asyncio import AsyncIOMotorClient
from src.app.core.config import settings
from src.app.core.database import Base, init_db
from src.app.models.user import User
from src.app.models.health_data import HealthData
from src.app.models.medical_record import MedicalRecord
from src.app.models.doctor_patient import DoctorPatient, DoctorRequest
from src.app.models.treatment_plan import TreatmentPlan
from src.app.core.security import get_password_hash


def init_postgresql():
    """Initialize PostgreSQL database
    
    - Create database tables
    - Initialize base data
    """
    init_db()
    
    from .database import engine, SessionLocal
    
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("Database tables created")
    
    print("Initializing base data...")
    db = SessionLocal()
    try:
        admin_exists = db.query(User).filter(User.username == "admin").first()
        if not admin_exists:
            admin = User(
                username="admin",
                email="admin@example.com",
                password_hash=get_password_hash("password123"),
                full_name="System Admin",
                role="admin",
                is_active=True
            )
            db.add(admin)
            print("Admin account created: admin / password123")
        else:
            print("Admin account already exists")
        
        doctor_exists = db.query(User).filter(User.username == "doctor").first()
        if not doctor_exists:
            doctor = User(
                username="doctor",
                email="doctor@example.com",
                password_hash=get_password_hash("password123"),
                full_name="Doctor Zhang",
                role="doctor",
                is_active=True
            )
            db.add(doctor)
            print("Doctor account created: doctor / password123")
        else:
            print("Doctor account already exists")
        
        patient_exists = db.query(User).filter(User.username == "patient").first()
        if not patient_exists:
            patient = User(
                username="patient",
                email="patient@example.com",
                password_hash=get_password_hash("password123"),
                full_name="Test Patient",
                role="patient",
                is_active=True
            )
            db.add(patient)
            print("Patient account created: patient / password123")
        else:
            print("Patient account already exists")
        
        db.commit()
    except Exception as e:
        print(f"Error initializing base data: {e}")
        db.rollback()
    finally:
        db.close()


async def init_mongodb():
    """Initialize MongoDB database
    
    - Create collections
    - Initialize indexes
    """
    init_db()
    
    from .database import mongodb_db
    
    print("Initializing MongoDB...")
    
    try:
        collections = await mongodb_db.list_collection_names()
        
        if "health_records" not in collections:
            await mongodb_db.create_collection("health_records")
            print("Created collection: health_records")
        
        if "medical_notes" not in collections:
            await mongodb_db.create_collection("medical_notes")
            print("Created collection: medical_notes")
        
        await mongodb_db.health_records.create_index("patient_id")
        await mongodb_db.health_records.create_index("record_date")
        await mongodb_db.medical_notes.create_index("patient_id")
        await mongodb_db.medical_notes.create_index("created_at")
        
        print("MongoDB indexes created")
    except Exception as e:
        print(f"MongoDB initialization error: {e}")


async def init_databases():
    """Initialize all databases
    
    - Initialize PostgreSQL
    - Initialize MongoDB
    """
    print("Starting database initialization...")
    init_postgresql()
    await init_mongodb()
    print("Database initialization completed")


if __name__ == "__main__":
    asyncio.run(init_databases())