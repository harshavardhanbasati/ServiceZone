def test_health_check(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert data["service"] == "ServiceZone API"

def test_list_services(client):
    response = client.get("/api/v1/services")
    assert response.status_code == 200
    services = response.json()
    assert len(services) >= 1
    assert any(s["slug"] == "motherboard-repair" for s in services)

def test_auth_registration(client):
    reg_payload = {
        "name": "Sarah Connor",
        "email": "sarah@cyberdyne.org",
        "phone": "+15559988",
        "password": "resistance2026"
    }
    response = client.post("/api/v1/auth/register", json=reg_payload)
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "sarah@cyberdyne.org"
    assert data["user"]["role"] == "CUSTOMER"

def test_auth_login(client):
    response = client.post("/api/v1/auth/login", json={
        "email": "cust1@servicezone.tech",
        "password": "custpass123"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["name"] == "Customer One"

def test_rbac_protection(client, customer1_headers):
    # Customer should be forbidden from accessing admin dashboard
    response = client.get("/api/v1/admin/dashboard", headers=customer1_headers)
    assert response.status_code == 403

def test_admin_dashboard(client, admin_headers):
    response = client.get("/api/v1/admin/dashboard", headers=admin_headers)
    assert response.status_code == 200
    data = response.json()
    assert "pending_appointments" in data
    assert "total_customers" in data

def test_slot_availability_and_concurrent_booking_prevention(client, customer1_headers, customer2_headers):
    # 1. Available slots query
    response = client.get("/api/v1/slots/available?date=2026-12-01")
    assert response.status_code == 200
    slots = response.json()
    target_slot = next(s for s in slots if s["id"] == "test-slot-1")
    assert target_slot["is_reserved"] is False

    # 2. Customer 1 books slot 1
    booking_payload = {
        "service_id": "test-service-uuid",
        "slot_id": "test-slot-1",
        "device_type": "LAPTOP",
        "device_brand": "Framework",
        "device_model": "Laptop 16",
        "problem_description": "Intermittent power cutoff under heavy compute load.",
        "additional_notes": "Urgent diagnostic requested."
    }
    book_resp = client.post("/api/v1/bookings", json=booking_payload, headers=customer1_headers)
    assert book_resp.status_code == 201
    booking_data = book_resp.json()
    booking_id = booking_data["id"]
    assert booking_data["reference_code"].startswith("SZ-")
    assert booking_data["appointment_status"] == "PENDING"
    assert booking_data["repair_status"] == "NOT_STARTED"

    # 3. Customer 2 attempts to double-book the same slot 1 -> MUST BE REJECTED WITH 409
    double_payload = {
        "service_id": "test-service-uuid",
        "slot_id": "test-slot-1",
        "device_type": "DESKTOP",
        "device_brand": "Custom",
        "device_model": "Workstation",
        "problem_description": "No display output."
    }
    double_resp = client.post("/api/v1/bookings", json=double_payload, headers=customer2_headers)
    assert double_resp.status_code == 409
    assert "already reserved" in double_resp.json()["detail"].lower() or "conflict" in double_resp.json()["detail"].lower()

    # 4. Customer 1 reschedules to slot 2
    reschedule_resp = client.patch(
        f"/api/v1/bookings/{booking_id}/reschedule",
        json={"new_slot_id": "test-slot-2"},
        headers=customer1_headers
    )
    assert reschedule_resp.status_code == 200
    assert reschedule_resp.json()["slot_id"] == "test-slot-2"

    # 5. Since slot 1 was released by rescheduling, Customer 2 can now book slot 1 successfully!
    cust2_resp = client.post("/api/v1/bookings", json=double_payload, headers=customer2_headers)
    assert cust2_resp.status_code == 201
    cust2_booking_id = cust2_resp.json()["id"]

    # 6. Customer 2 cancels their booking
    cancel_resp = client.patch(
        f"/api/v1/bookings/{cust2_booking_id}/cancel",
        json={"reason": "Device resolved itself"},
        headers=customer2_headers
    )
    assert cancel_resp.status_code == 200
    assert cancel_resp.json()["appointment_status"] == "CANCELLED"

def test_admin_repair_lifecycle_audit(client, admin_headers, customer1_headers):
    # Customer 1 has an active booking on test-slot-2
    my_bookings = client.get("/api/v1/bookings/my", headers=customer1_headers).json()
    active_booking = my_bookings[0]
    b_id = active_booking["id"]

    # Admin confirms appointment
    confirm_resp = client.patch(
        f"/api/v1/admin/bookings/{b_id}/appointment-status",
        json={"appointment_status": "CONFIRMED", "reason_or_notes": "Intake technician ready"},
        headers=admin_headers
    )
    assert confirm_resp.status_code == 200
    assert confirm_resp.json()["appointment_status"] == "CONFIRMED"

    # Admin updates repair progress to DIAGNOSING with customer note
    repair_resp = client.patch(
        f"/api/v1/admin/bookings/{b_id}/repair-status",
        json={
            "repair_status": "DIAGNOSING",
            "note": "Unit dismantled on ESD bench. Oscilloscope testing main power rail.",
            "quoted_price": 120.0
        },
        headers=admin_headers
    )
    assert repair_resp.status_code == 200
    assert repair_resp.json()["repair_status"] == "DIAGNOSING"
    assert repair_resp.json()["quoted_price"] == 120.0

    # Customer verifies the chronological repair update timeline
    updates_resp = client.get(f"/api/v1/bookings/{b_id}/updates", headers=customer1_headers)
    assert updates_resp.status_code == 200
    updates = updates_resp.json()
    assert len(updates) >= 1
    assert updates[0]["new_status"] == "DIAGNOSING"
    assert "Oscilloscope testing" in updates[0]["note"]
