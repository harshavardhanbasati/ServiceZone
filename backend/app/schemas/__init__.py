from datetime import datetime, date, time
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field

# ----------------- User Schemas -----------------
class UserBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=120)
    email: EmailStr
    phone: str = Field(..., min_length=7, max_length=32)

class UserCreate(UserBase):
    password: str = Field(..., min_length=6, max_length=100)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserProfileUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=120)
    phone: Optional[str] = Field(None, min_length=7, max_length=32)
    password: Optional[str] = Field(None, min_length=6, max_length=100)

class UserOut(UserBase):
    id: str
    role: str
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserOut

# ----------------- Service Schemas -----------------
class ServiceBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=150)
    summary: str = Field(..., max_length=255)
    description: str
    category: str = Field(..., max_length=60)
    image_path: str = Field(..., max_length=255)
    pricing_mode: str = Field("STARTING_AT", pattern="^(STARTING_AT|FIXED|QUOTE_ONLY)$")
    display_price: Optional[float] = None
    estimated_duration_minutes: int = Field(60, ge=15, le=480)
    is_active: bool = True
    display_order: int = 0

class ServiceCreate(ServiceBase):
    slug: Optional[str] = None

class ServiceUpdate(BaseModel):
    name: Optional[str] = None
    summary: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    image_path: Optional[str] = None
    pricing_mode: Optional[str] = None
    display_price: Optional[float] = None
    estimated_duration_minutes: Optional[int] = None
    is_active: Optional[bool] = None
    display_order: Optional[int] = None

class ServiceOut(ServiceBase):
    id: str
    slug: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# ----------------- Slot Schemas -----------------
class SlotBase(BaseModel):
    slot_date: date
    start_time: time
    end_time: time
    is_active: bool = True

class SlotCreate(SlotBase):
    pass

class SlotBatchCreate(BaseModel):
    start_date: date
    end_date: date
    start_time: time
    end_time: time
    slot_duration_minutes: int = Field(30, ge=15, le=120)

class SlotOut(SlotBase):
    id: str
    is_reserved: bool = False

    class Config:
        from_attributes = True

# ----------------- Booking Schemas -----------------
class BookingCreate(BaseModel):
    service_id: str
    slot_id: str
    device_type: str = Field(..., min_length=2, max_length=50)
    device_brand: str = Field(..., min_length=1, max_length=100)
    device_model: str = Field(..., min_length=1, max_length=120)
    problem_description: str = Field(..., min_length=10, max_length=2000)
    additional_notes: Optional[str] = Field(None, max_length=1000)

class BookingReschedule(BaseModel):
    new_slot_id: str

class BookingCancel(BaseModel):
    reason: Optional[str] = Field(None, max_length=500)

class AppointmentStatusUpdate(BaseModel):
    appointment_status: str = Field(..., pattern="^(CONFIRMED|REJECTED|CANCELLED|COMPLETED)$")
    reason_or_notes: Optional[str] = None

class RepairStatusUpdate(BaseModel):
    repair_status: str = Field(..., pattern="^(NOT_STARTED|DIAGNOSING|WAITING_FOR_CUSTOMER_APPROVAL|WAITING_FOR_PARTS|IN_PROGRESS|READY_FOR_PICKUP|DELIVERED)$")
    note: str = Field(..., min_length=3, max_length=1000)
    quoted_price: Optional[float] = None
    final_price: Optional[float] = None

class RepairUpdateOut(BaseModel):
    id: str
    previous_status: Optional[str]
    new_status: str
    note: str
    created_at: datetime
    updated_by_name: Optional[str] = None

    class Config:
        from_attributes = True

class BookingOut(BaseModel):
    id: str
    reference_code: str
    user_id: str
    service_id: str
    slot_id: str
    device_type: str
    device_brand: str
    device_model: str
    problem_description: str
    additional_notes: Optional[str]
    appointment_status: str
    repair_status: str
    quoted_price: Optional[float]
    final_price: Optional[float]
    cancelled_at: Optional[datetime]
    created_at: datetime
    
    # Nested relations when populated
    service: Optional[ServiceOut] = None
    slot: Optional[SlotOut] = None
    repair_updates: List[RepairUpdateOut] = []

    class Config:
        from_attributes = True

# ----------------- Notification Schemas -----------------
class NotificationOut(BaseModel):
    id: str
    booking_id: Optional[str]
    title: str
    message: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True

# ----------------- Dashboard & Metrics -----------------
class DashboardStats(BaseModel):
    pending_appointments: int
    confirmed_upcoming: int
    active_bench_repairs: int
    ready_for_pickup: int
    total_customers: int
    total_completed: int
