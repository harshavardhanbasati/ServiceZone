import random
import string
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from backend.app.core.database import get_db
from backend.app.models import Booking, Slot, Service, User, Notification, RepairUpdate
from backend.app.schemas import (
    BookingCreate, BookingOut, BookingCancel, BookingReschedule, 
    RepairUpdateOut
)
from backend.app.api.deps import get_current_active_user

router = APIRouter(prefix="/bookings", tags=["Customer Bookings"])

def generate_reference_code() -> str:
    digits = ''.join(random.choices(string.digits, k=5))
    return f"SZ-{digits}"

@router.post("", response_model=BookingOut, status_code=status.HTTP_201_CREATED)
def create_booking(
    booking_in: BookingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # 1. Validate service
    service = db.query(Service).filter(Service.id == booking_in.service_id, Service.is_active == True).first()
    if not service:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Selected service is unavailable or inactive."
        )
    
    # 2. Check and lock slot
    slot = db.query(Slot).filter(Slot.id == booking_in.slot_id, Slot.is_active == True).first()
    if not slot:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Selected appointment slot does not exist or is disabled."
        )
    
    # 3. Check for existing active reservation on this slot
    existing_active = db.query(Booking).filter(
        Booking.slot_id == booking_in.slot_id,
        Booking.appointment_status.notin_(["CANCELLED", "REJECTED"])
    ).first()
    
    if existing_active:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This appointment slot was just reserved by another customer. Please select another slot."
        )
    
    # 4. Generate unique reference code
    ref_code = generate_reference_code()
    while db.query(Booking).filter(Booking.reference_code == ref_code).first():
        ref_code = generate_reference_code()
    
    # 5. Create booking inside transaction
    booking = Booking(
        reference_code=ref_code,
        user_id=current_user.id,
        service_id=service.id,
        slot_id=slot.id,
        device_type=booking_in.device_type,
        device_brand=booking_in.device_brand,
        device_model=booking_in.device_model,
        problem_description=booking_in.problem_description,
        additional_notes=booking_in.additional_notes,
        appointment_status="PENDING",
        repair_status="NOT_STARTED"
    )
    
    # Create an initial user notification
    notification = Notification(
        user_id=current_user.id,
        booking=booking,
        title="Intake Appointment Booked",
        message=f"Appointment {ref_code} scheduled for {slot.slot_date} at {slot.start_time.strftime('%H:%M')}. Pending workshop confirmation."
    )
    
    try:
        db.add(booking)
        db.add(notification)
        db.commit()
        db.refresh(booking)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Conflict reserving this appointment slot. Please pick an alternative time."
        )
    
    return BookingOut.model_validate(booking)

@router.get("/my", response_model=List[BookingOut])
def get_my_bookings(
    status_filter: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    query = db.query(Booking).filter(Booking.user_id == current_user.id)
    if status_filter:
        query = query.filter(Booking.appointment_status == status_filter.upper())
    
    bookings = query.order_by(Booking.created_at.desc()).all()
    return [BookingOut.model_validate(b) for b in bookings]

@router.get("/{booking_id}", response_model=BookingOut)
def get_booking_detail(
    booking_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found.")
    
    # Ensure ownership
    if booking.user_id != current_user.id and current_user.role != "ADMIN":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")
    
    return BookingOut.model_validate(booking)

@router.patch("/{booking_id}/cancel", response_model=BookingOut)
def cancel_booking(
    booking_id: str,
    cancel_in: BookingCancel,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found.")
    
    if booking.user_id != current_user.id and current_user.role != "ADMIN":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")
    
    if booking.appointment_status in ["CANCELLED", "REJECTED", "COMPLETED"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot cancel a booking that is already {booking.appointment_status}."
        )
    
    booking.appointment_status = "CANCELLED"
    booking.cancelled_at = datetime.now(timezone.utc)
    booking.cancellation_reason = cancel_in.reason or "Cancelled by customer"
    
    # Notify customer
    notification = Notification(
        user_id=booking.user_id,
        booking_id=booking.id,
        title="Appointment Cancelled",
        message=f"Appointment {booking.reference_code} has been cancelled and the slot released."
    )
    db.add(notification)
    db.commit()
    db.refresh(booking)
    
    return BookingOut.model_validate(booking)

@router.patch("/{booking_id}/reschedule", response_model=BookingOut)
def reschedule_booking(
    booking_id: str,
    reschedule_in: BookingReschedule,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found.")
    
    if booking.user_id != current_user.id and current_user.role != "ADMIN":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")
    
    if booking.appointment_status not in ["PENDING", "CONFIRMED"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only pending or confirmed appointments can be rescheduled."
        )
    
    # Verify new slot
    new_slot = db.query(Slot).filter(Slot.id == reschedule_in.new_slot_id, Slot.is_active == True).first()
    if not new_slot:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Selected new slot does not exist.")
    
    # Check if new slot already has an active booking
    conflict = db.query(Booking).filter(
        Booking.slot_id == new_slot.id,
        Booking.id != booking.id,
        Booking.appointment_status.notin_(["CANCELLED", "REJECTED"])
    ).first()
    
    if conflict:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="The requested new appointment slot is already reserved."
        )
    
    # Atomically reassign slot
    old_slot_date = booking.slot.slot_date if booking.slot else ""
    booking.slot_id = new_slot.id
    
    # Notify customer
    notification = Notification(
        user_id=booking.user_id,
        booking_id=booking.id,
        title="Appointment Rescheduled",
        message=f"Appointment {booking.reference_code} rescheduled to {new_slot.slot_date} at {new_slot.start_time.strftime('%H:%M')}."
    )
    db.add(notification)
    
    try:
        db.commit()
        db.refresh(booking)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Slot reservation conflict during reschedule."
        )
    
    return BookingOut.model_validate(booking)

@router.get("/{booking_id}/updates", response_model=List[RepairUpdateOut])
def get_repair_updates(
    booking_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found.")
    
    if booking.user_id != current_user.id and current_user.role != "ADMIN":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")
    
    updates = db.query(RepairUpdate).filter(
        RepairUpdate.booking_id == booking_id
    ).order_by(RepairUpdate.created_at.desc()).all()
    
    return [RepairUpdateOut.model_validate(u) for u in updates]
