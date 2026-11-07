from fastapi import APIRouter
from backend.app.api.v1.auth import router as auth_router
from backend.app.api.v1.services import router as services_router
from backend.app.api.v1.slots import router as slots_router
from backend.app.api.v1.bookings import router as bookings_router
from backend.app.api.v1.admin import router as admin_router
from backend.app.api.v1.notifications import router as notifications_router

api_router = APIRouter()
api_router.include_router(auth_router)
api_router.include_router(services_router)
api_router.include_router(slots_router)
api_router.include_router(bookings_router)
api_router.include_router(admin_router)
api_router.include_router(notifications_router)
