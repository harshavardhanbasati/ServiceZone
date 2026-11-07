import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.app.core.database import Base, get_db
from backend.app.main import app
from backend.app.db.seed import seed_database
from backend.app.core.security import create_access_token

# Use an in-memory or dedicated test sqlite db
TEST_DATABASE_URL = "sqlite:///./test_servicezone.db"
test_engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    Base.metadata.drop_all(bind=test_engine)
    Base.metadata.create_all(bind=test_engine)
    
    # Override get_db in app
    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()
            
    app.dependency_overrides[get_db] = override_get_db
    
    # Run seed
    from backend.app.models import User, Service, Slot
    from backend.app.core.security import get_password_hash
    from datetime import date, time
    
    db = TestingSessionLocal()
    # Create test admin
    admin = User(
        id="test-admin-uuid",
        name="Admin Test",
        email="testadmin@servicezone.tech",
        phone="+15550001",
        password_hash=get_password_hash("adminpass123"),
        role="ADMIN",
        is_active=True
    )
    # Create test customer 1
    cust1 = User(
        id="test-cust1-uuid",
        name="Customer One",
        email="cust1@servicezone.tech",
        phone="+15550002",
        password_hash=get_password_hash("custpass123"),
        role="CUSTOMER",
        is_active=True
    )
    # Create test customer 2
    cust2 = User(
        id="test-cust2-uuid",
        name="Customer Two",
        email="cust2@servicezone.tech",
        phone="+15550003",
        password_hash=get_password_hash("custpass123"),
        role="CUSTOMER",
        is_active=True
    )
    # Create test service
    service = Service(
        id="test-service-uuid",
        name="Motherboard Micro-Soldering",
        slug="motherboard-repair",
        summary="Logic board level diagnostic and repair",
        description="Full diagnostic and micro-soldering repair.",
        category="Hardware Repair",
        image_path="/assets/services/hardware-repair.webp",
        pricing_mode="STARTING_AT",
        display_price=89.0,
        estimated_duration_minutes=120,
        is_active=True,
        display_order=1
    )
    # Create two test slots
    slot1 = Slot(
        id="test-slot-1",
        slot_date=date(2026, 12, 1),
        start_time=time(10, 0),
        end_time=time(10, 30),
        is_active=True
    )
    slot2 = Slot(
        id="test-slot-2",
        slot_date=date(2026, 12, 1),
        start_time=time(11, 0),
        end_time=time(11, 30),
        is_active=True
    )
    db.add_all([admin, cust1, cust2, service, slot1, slot2])
    db.commit()
    db.close()
    
    yield
    
    Base.metadata.drop_all(bind=test_engine)

@pytest.fixture
def client():
    return TestClient(app)

@pytest.fixture
def admin_headers():
    token = create_access_token(subject="test-admin-uuid")
    return {"Authorization": f"Bearer {token}"}

@pytest.fixture
def customer1_headers():
    token = create_access_token(subject="test-cust1-uuid")
    return {"Authorization": f"Bearer {token}"}

@pytest.fixture
def customer2_headers():
    token = create_access_token(subject="test-cust2-uuid")
    return {"Authorization": f"Bearer {token}"}
