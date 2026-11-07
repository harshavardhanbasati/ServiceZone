from datetime import datetime, date, timedelta, time
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.app.core.database import get_db
from backend.app.core.config import settings
from backend.app.models import (
    User, Service, Slot, Booking, RepairUpdate, Notification
)
from backend.app.schemas import (
    ServiceCreate, ServiceUpdate, ServiceOut,
    SlotCreate, SlotBatchCreate, SlotOut,
    BookingOut, AppointmentStatusUpdate, RepairStatusUpdate,
    DashboardStats, UserOut
)
from backend.app.api.deps import require_admin

router = APIRouter(prefix="/admin", tags=["Administrator Operations"], dependencies=[Depends(require_admin)])

@router.get("/dashboard", response_model=DashboardStats)
def get_dashboard_metrics(db: Session = Depends(get_db)):
    pending_appts = db.query(Booking).filter(Booking.appointment_status == "PENDING").count()
    confirmed_appts = db.query(Booking).filter(Booking.appointment_status == "CONFIRMED").count()
    
    bench_repairs = db.query(Booking).filter(
        Booking.repair_status.in_(["DIAGNOSING", "WAITING_FOR_CUSTOMER_APPROVAL", "WAITING_FOR_PARTS", "IN_PROGRESS"])
    ).count()
    
    ready_pickup = db.query(Booking).filter(Booking.repair_status == "READY_FOR_PICKUP").count()
    total_customers = db.query(User).filter(User.role == "CUSTOMER").count()
    total_completed = db.query(Booking).filter(
        (Booking.appointment_status == "COMPLETED") | (Booking.repair_status == "DELIVERED")
    ).count()
    
    return DashboardStats(
        pending_appointments=pending_appts,
        confirmed_upcoming=confirmed_appts,
        active_bench_repairs=bench_repairs,
        ready_for_pickup=ready_pickup,
        total_customers=total_customers,
        total_completed=total_completed
    )

# ----------------- Service Management -----------------
@router.get("/services", response_model=List[ServiceOut])
def admin_list_services(db: Session = Depends(get_db)):
    services = db.query(Service).order_by(Service.display_order.asc(), Service.created_at.desc()).all()
    return [ServiceOut.model_validate(s) for s in services]

@router.post("/services", response_model=ServiceOut, status_code=status.HTTP_201_CREATED)
def admin_create_service(service_in: ServiceCreate, db: Session = Depends(get_db)):
    slug = service_in.slug or service_in.name.lower().replace(" ", "-").replace("/", "-")
    existing = db.query(Service).filter(Service.slug == slug).first()
    if existing:
        slug = f"{slug}-{int(datetime.now().timestamp())}"
    
    service = Service(
        name=service_in.name,
        slug=slug,
        summary=service_in.summary,
        description=service_in.description,
        category=service_in.category,
        image_path=service_in.image_path,
        pricing_mode=service_in.pricing_mode,
        display_price=service_in.display_price,
        estimated_duration_minutes=service_in.estimated_duration_minutes,
        is_active=service_in.is_active,
        display_order=service_in.display_order
    )
    db.add(service)
    db.commit()
    db.refresh(service)
    return ServiceOut.model_validate(service)

@router.patch("/services/{service_id}", response_model=ServiceOut)
def admin_update_service(service_id: str, service_in: ServiceUpdate, db: Session = Depends(get_db)):
    service = db.query(Service).filter(Service.id == service_id).first()
    if not service:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service not found.")
    
    update_data = service_in.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(service, field, val)
    
    db.commit()
    db.refresh(service)
    return ServiceOut.model_validate(service)

# ----------------- Slot Management -----------------
@router.post("/slots/batch", status_code=status.HTTP_201_CREATED)
def admin_batch_create_slots(batch_in: SlotBatchCreate, db: Session = Depends(get_db)):
    created_count = 0
    current_day = batch_in.start_date
    delta_day = timedelta(days=1)
    slot_delta = timedelta(minutes=batch_in.slot_duration_minutes)
    
    while current_day <= batch_in.end_date:
        # Generate time slices between start_time and end_time
        curr_dt = datetime.combine(current_day, batch_in.start_time)
        end_dt = datetime.combine(current_day, batch_in.end_time)
        
        while curr_dt + slot_delta <= end_dt:
            slot_s_time = curr_dt.time()
            slot_e_time = (curr_dt + slot_delta).time()
            
            # Check duplicate
            existing = db.query(Slot).filter(
                Slot.slot_date == current_day,
                Slot.start_time == slot_s_time,
                Slot.end_time == slot_e_time
            ).first()
            
            if not existing:
                new_slot = Slot(
                    slot_date=current_day,
                    start_time=slot_s_time,
                    end_time=slot_e_time,
                    is_active=True
                )
                db.add(new_slot)
                created_count += 1
            
            curr_dt += slot_delta
            
        current_day += delta_day
    
    db.commit()
    return {"message": f"Successfully generated {created_count} availability intake slots."}

@router.get("/slots", response_model=List[SlotOut])
def admin_list_slots(
    date_val: Optional[date] = Query(None, alias="date"),
    db: Session = Depends(get_db)
):
    query = db.query(Slot)
    if date_val:
        query = query.filter(Slot.slot_date == date_val)
    
    slots = query.order_by(Slot.slot_date.desc(), Slot.start_time.asc()).limit(100).all()
    
    active_bookings = db.query(Booking.slot_id).filter(
        Booking.appointment_status.notin_(["CANCELLED", "REJECTED"])
    ).all()
    reserved_ids = {b.slot_id for b in active_bookings}
    
    res = []
    for s in slots:
        res.append(SlotOut(
            id=s.id,
            slot_date=s.slot_date,
            start_time=s.start_time,
            end_time=s.end_time,
            is_active=s.is_active,
            is_reserved=s.id in reserved_ids
        ))
    return res

@router.patch("/slots/{slot_id}")
def admin_toggle_slot(slot_id: str, is_active: bool = Query(...), db: Session = Depends(get_db)):
    slot = db.query(Slot).filter(Slot.id == slot_id).first()
    if not slot:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Slot not found.")
    slot.is_active = is_active
    db.commit()
    return {"message": f"Slot state updated to {'active' if is_active else 'disabled'}."}

# ----------------- Booking & Repair Management -----------------
@router.get("/bookings", response_model=List[BookingOut])
def admin_list_bookings(
    status: Optional[str] = None,
    repair_status: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Booking)
    if status:
        query = query.filter(Booking.appointment_status == status.upper())
    if repair_status:
        query = query.filter(Booking.repair_status == repair_status.upper())
    if search:
        s_fmt = f"%{search}%"
        query = query.filter(
            (Booking.reference_code.ilike(s_fmt)) |
            (Booking.device_brand.ilike(s_fmt)) |
            (Booking.device_model.ilike(s_fmt))
        )
    
    bookings = query.order_by(Booking.created_at.desc()).all()
    return [BookingOut.model_validate(b) for b in bookings]

@router.patch("/bookings/{booking_id}/appointment-status", response_model=BookingOut)
def admin_update_appointment_status(
    booking_id: str,
    status_update: AppointmentStatusUpdate,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin)
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found.")
    
    prev_status = booking.appointment_status
    new_status = status_update.appointment_status
    booking.appointment_status = new_status
    
    if new_status == "COMPLETED" and booking.repair_status == "NOT_STARTED":
        booking.repair_status = "DIAGNOSING"
        # Log initial bench intake
        up = RepairUpdate(
            booking_id=booking.id,
            previous_status="NOT_STARTED",
            new_status="DIAGNOSING",
            note="Device received at workshop. Diagnostic testing initiated.",
            updated_by=admin_user.id
        )
        db.add(up)
    
    # Notify customer
    notify = Notification(
        user_id=booking.user_id,
        booking_id=booking.id,
        title=f"Appointment {new_status.title()}",
        message=f"Your intake appointment ({booking.reference_code}) has been marked as {new_status}. {status_update.reason_or_notes or ''}"
    )
    db.add(notify)
    db.commit()
    db.refresh(booking)
    return BookingOut.model_validate(booking)

@router.patch("/bookings/{booking_id}/repair-status", response_model=BookingOut)
def admin_update_repair_status(
    booking_id: str,
    status_update: RepairStatusUpdate,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin)
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found.")
    
    prev_repair_status = booking.repair_status
    booking.repair_status = status_update.repair_status
    
    if status_update.quoted_price is not None:
        booking.quoted_price = status_update.quoted_price
    if status_update.final_price is not None:
        booking.final_price = status_update.final_price
    
    # Record immutable audit history
    update_log = RepairUpdate(
        booking_id=booking.id,
        previous_status=prev_repair_status,
        new_status=status_update.repair_status,
        note=status_update.note,
        updated_by=admin_user.id
    )
    db.add(update_log)
    
    # Notify customer
    notify = Notification(
        user_id=booking.user_id,
        booking_id=booking.id,
        title=f"Repair Status: {status_update.repair_status.replace('_', ' ').title()}",
        message=f"Update for {booking.reference_code}: {status_update.note}"
    )
    db.add(notify)
    
    db.commit()
    db.refresh(booking)
    return BookingOut.model_validate(booking)

# ----------------- Customers Directory -----------------
@router.get("/customers", response_model=List[UserOut])
def admin_list_customers(db: Session = Depends(get_db)):
    customers = db.query(User).filter(User.role == "CUSTOMER").order_by(User.created_at.desc()).all()
    return [UserOut.model_validate(c) for c in customers]

# ----------------- Workshop Settings -----------------
@router.get("/settings")
def get_workshop_settings():
    return {
        "business_name": settings.BUSINESS_NAME,
        "business_phone": settings.BUSINESS_PHONE,
        "business_email": settings.BUSINESS_EMAIL,
        "business_address": settings.BUSINESS_ADDRESS,
        "timezone": settings.TIMEZONE,
        "auto_confirm_bookings": settings.AUTO_CONFIRM_BOOKINGS
    }
