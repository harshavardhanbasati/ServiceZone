from datetime import date
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.models import Slot, Booking, RepairUpdate
from backend.app.schemas import SlotOut, BookingOut, RepairUpdateOut

router = APIRouter(tags=["Availability & Tracking"])

@router.get("/slots/available", response_model=List[SlotOut])
def get_available_slots(
    date_val: Optional[date] = Query(None, alias="date"),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Slot).filter(Slot.is_active == True)
    
    if date_val:
        query = query.filter(Slot.slot_date == date_val)
    elif start_date and end_date:
        query = query.filter(Slot.slot_date >= start_date, Slot.slot_date <= end_date)
    elif start_date:
        query = query.filter(Slot.slot_date >= start_date)
    
    all_slots = query.order_by(Slot.slot_date.asc(), Slot.start_time.asc()).all()
    
    # Query all active reservations (not CANCELLED or REJECTED)
    active_bookings = db.query(Booking.slot_id).filter(
        Booking.appointment_status.notin_(["CANCELLED", "REJECTED"])
    ).all()
    reserved_slot_ids = {b.slot_id for b in active_bookings}
    
    # Return slots with reservation flag
    result = []
    for s in all_slots:
        is_res = s.id in reserved_slot_ids
        slot_dict = {
            "id": s.id,
            "slot_date": s.slot_date,
            "start_time": s.start_time,
            "end_time": s.end_time,
            "is_active": s.is_active,
            "is_reserved": is_res
        }
        result.append(SlotOut(**slot_dict))
    
    return result

@router.get("/public/track/{reference_code}")
def track_repair_public(reference_code: str, db: Session = Depends(get_db)):
    booking = db.query(Booking).filter(
        Booking.reference_code.ilike(reference_code.strip())
    ).first()
    
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No booking found with this reference code. Please verify the code and try again."
        )
    
    # Return sanitized public status details without PII
    return {
        "reference_code": booking.reference_code,
        "service_name": booking.service.name if booking.service else "Service Intake",
        "device_type": booking.device_type,
        "device_brand": booking.device_brand,
        "device_model": booking.device_model,
        "appointment_status": booking.appointment_status,
        "repair_status": booking.repair_status,
        "checkin_date": booking.slot.slot_date if booking.slot else None,
        "quoted_price": float(booking.quoted_price) if booking.quoted_price else None,
        "repair_updates": [
            {
                "previous_status": u.previous_status,
                "new_status": u.new_status,
                "note": u.note,
                "created_at": u.created_at
            }
            for u in booking.repair_updates
        ]
    }
