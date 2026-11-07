from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.models import Service
from backend.app.schemas import ServiceOut

router = APIRouter(prefix="/services", tags=["Services"])

@router.get("", response_model=List[ServiceOut])
def list_services(
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Service).filter(Service.is_active == True)
    
    if category and category.lower() != "all":
        query = query.filter(Service.category.ilike(f"%{category}%"))
    if search:
        search_fmt = f"%{search}%"
        query = query.filter(
            (Service.name.ilike(search_fmt)) | 
            (Service.summary.ilike(search_fmt)) | 
            (Service.description.ilike(search_fmt))
        )
        
    services = query.order_by(Service.display_order.asc(), Service.name.asc()).all()
    return [ServiceOut.model_validate(s) for s in services]

@router.get("/{slug_or_id}", response_model=ServiceOut)
def get_service(slug_or_id: str, db: Session = Depends(get_db)):
    service = db.query(Service).filter(
        (Service.id == slug_or_id) | (Service.slug == slug_or_id)
    ).first()
    
    if not service or not service.is_active:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service not found or is currently unavailable."
        )
    return ServiceOut.model_validate(service)
