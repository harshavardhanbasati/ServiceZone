import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column, String, Text, Boolean, Integer, Numeric, Date, Time, 
    DateTime, ForeignKey, UniqueConstraint, Index
)
from sqlalchemy.orm import relationship
from backend.app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

def utc_now():
    return datetime.now(timezone.utc)

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(120), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    phone = Column(String(32), nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False, default="CUSTOMER")  # CUSTOMER, ADMIN
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=utc_now)
    updated_at = Column(DateTime(timezone=True), nullable=False, default=utc_now, onupdate=utc_now)

    bookings = relationship("Booking", back_populates="user", cascade="all, delete-orphan")
    devices = relationship("Device", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")


class Service(Base):
    __tablename__ = "services"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(150), nullable=False)
    slug = Column(String(160), unique=True, index=True, nullable=False)
    summary = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(60), index=True, nullable=False)
    image_path = Column(String(255), nullable=False)
    pricing_mode = Column(String(30), nullable=False, default="STARTING_AT")  # STARTING_AT, FIXED, QUOTE_ONLY
    display_price = Column(Numeric(10, 2), nullable=True)
    estimated_duration_minutes = Column(Integer, nullable=False, default=60)
    is_active = Column(Boolean, nullable=False, default=True, index=True)
    display_order = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime(timezone=True), nullable=False, default=utc_now)
    updated_at = Column(DateTime(timezone=True), nullable=False, default=utc_now, onupdate=utc_now)

    bookings = relationship("Booking", back_populates="service")


class Device(Base):
    __tablename__ = "devices"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    device_type = Column(String(50), nullable=False)  # LAPTOP, DESKTOP, AIO, CUSTOM_PC, OTHER
    brand = Column(String(100), nullable=False)
    model = Column(String(120), nullable=False)
    serial_number = Column(String(100), nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=utc_now)
    updated_at = Column(DateTime(timezone=True), nullable=False, default=utc_now, onupdate=utc_now)

    user = relationship("User", back_populates="devices")


class Slot(Base):
    __tablename__ = "slots"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    slot_date = Column(Date, nullable=False, index=True)
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    is_active = Column(Boolean, nullable=False, default=True, index=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=utc_now)
    updated_at = Column(DateTime(timezone=True), nullable=False, default=utc_now, onupdate=utc_now)

    __table_args__ = (
        UniqueConstraint("slot_date", "start_time", "end_time", name="uq_slot_window"),
    )

    bookings = relationship("Booking", back_populates="slot")


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    reference_code = Column(String(20), unique=True, index=True, nullable=False)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    service_id = Column(String(36), ForeignKey("services.id"), nullable=False, index=True)
    slot_id = Column(String(36), ForeignKey("slots.id"), nullable=False, index=True)
    
    # Historical snapshot of device at booking time
    device_type = Column(String(50), nullable=False)
    device_brand = Column(String(100), nullable=False)
    device_model = Column(String(120), nullable=False)
    
    problem_description = Column(Text, nullable=False)
    additional_notes = Column(Text, nullable=True)
    
    # Dual-lifecycle states
    appointment_status = Column(String(30), nullable=False, default="PENDING", index=True)
    # PENDING, CONFIRMED, REJECTED, CANCELLED, COMPLETED
    
    repair_status = Column(String(40), nullable=False, default="NOT_STARTED", index=True)
    # NOT_STARTED, DIAGNOSING, WAITING_FOR_CUSTOMER_APPROVAL, WAITING_FOR_PARTS, IN_PROGRESS, READY_FOR_PICKUP, DELIVERED
    
    quoted_price = Column(Numeric(10, 2), nullable=True)
    final_price = Column(Numeric(10, 2), nullable=True)
    cancelled_at = Column(DateTime(timezone=True), nullable=True)
    cancellation_reason = Column(Text, nullable=True)
    
    created_at = Column(DateTime(timezone=True), nullable=False, default=utc_now)
    updated_at = Column(DateTime(timezone=True), nullable=False, default=utc_now, onupdate=utc_now)

    user = relationship("User", back_populates="bookings")
    service = relationship("Service", back_populates="bookings")
    slot = relationship("Slot", back_populates="bookings")
    repair_updates = relationship("RepairUpdate", back_populates="booking", cascade="all, delete-orphan", order_by="RepairUpdate.created_at.desc()")
    notifications = relationship("Notification", back_populates="booking")

    # Partial unique index ensuring only 1 active booking per slot while allowing cancelled/rejected bookings to retain slot_id
    __table_args__ = (
        Index(
            "uq_active_slot_booking",
            "slot_id",
            unique=True,
            postgresql_where=(appointment_status.notin_(["CANCELLED", "REJECTED"])),
            sqlite_where=(appointment_status.notin_(["CANCELLED", "REJECTED"]))
        ),
    )


class RepairUpdate(Base):
    __tablename__ = "repair_updates"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    booking_id = Column(String(36), ForeignKey("bookings.id", ondelete="CASCADE"), nullable=False, index=True)
    previous_status = Column(String(40), nullable=True)
    new_status = Column(String(40), nullable=False)
    note = Column(Text, nullable=False)
    updated_by = Column(String(36), ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), nullable=False, default=utc_now)

    booking = relationship("Booking", back_populates="repair_updates")
    author = relationship("User")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    booking_id = Column(String(36), ForeignKey("bookings.id", ondelete="SET NULL"), nullable=True, index=True)
    title = Column(String(150), nullable=False)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime(timezone=True), nullable=False, default=utc_now)

    user = relationship("User", back_populates="notifications")
    booking = relationship("Booking", back_populates="notifications")
