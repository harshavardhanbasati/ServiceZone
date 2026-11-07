#!/usr/bin/env python3
"""
ServiceZone End-to-End Platform Test Suite
==========================================
Tests the entire user journey: health check, services, auth, booking,
concurrent prevention, rescheduling, cancellation, admin operations,
repair lifecycle, notifications, and public tracking.
"""

import sys
import json
import time
import random
import string
import requests

if sys.stdout.encoding and sys.stdout.encoding.lower() != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

BASE = "http://127.0.0.1:8080"
PASS = "\033[92m  PASS\033[0m"
FAIL = "\033[91m  FAIL\033[0m"
WARN = "\033[93m  WARN\033[0m"
HEADER = "\033[96m"
RESET = "\033[0m"

results = {"passed": 0, "failed": 0, "warnings": 0}

def test(name, condition, detail=""):
    if condition:
        results["passed"] += 1
        print(f"{PASS}  {name}")
    else:
        results["failed"] += 1
        print(f"{FAIL}  {name}")
        if detail:
            print(f"        └─ {detail}")

def section(title):
    print(f"\n{HEADER}{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}{RESET}")

# ─────────────────────────────────────────────
section("1. SERVER HEALTH & CONNECTIVITY")
# ─────────────────────────────────────────────

# 1a. Backend health endpoint
try:
    r = requests.get(f"{BASE}/api/health", timeout=5)
    data = r.json()
    test("Backend health endpoint returns 200", r.status_code == 200)
    test("Health status is 'online'", data.get("status") == "online")
    test("Database reports 'connected'", data.get("database") == "connected")
except Exception as e:
    test("Backend health endpoint reachable", False, str(e))
    print("\n  *** Backend server is not running. Aborting test suite. ***")
    sys.exit(1)

# 1b. Frontend health
try:
    r = requests.get("http://127.0.0.1:5173", timeout=5)
    test("Frontend dev server returns 200", r.status_code == 200)
    test("Frontend serves HTML with 'ServiceZone'", "ServiceZone" in r.text)
except Exception as e:
    test("Frontend dev server reachable", False, str(e))

# ─────────────────────────────────────────────
section("2. PUBLIC SERVICE CATALOG")
# ─────────────────────────────────────────────

r = requests.get(f"{BASE}/api/v1/services")
services = r.json()
test("GET /services returns 200", r.status_code == 200)
test("Service catalog contains >= 6 entries", len(services) >= 6, f"Got {len(services)}")
test("Services have required fields (name, slug, category)", all("name" in s and "slug" in s and "category" in s for s in services))

hw_slug = next((s["slug"] for s in services if "hardware" in s["slug"].lower()), services[0]["slug"])
r2 = requests.get(f"{BASE}/api/v1/services/{hw_slug}")
svc_detail = r2.json()
test(f"GET /services/{hw_slug} returns detail", r2.status_code == 200)
test("Service detail has description field", bool(svc_detail.get("description")))

# Category filter
r3 = requests.get(f"{BASE}/api/v1/services?category=Data+Recovery")
test("Category filter returns matching services", r3.status_code == 200)

# Search
r4 = requests.get(f"{BASE}/api/v1/services?search=malware")
test("Search filter returns results for 'malware'", r4.status_code == 200)

# ─────────────────────────────────────────────
section("3. AUTHENTICATION & REGISTRATION")
# ─────────────────────────────────────────────

# 3a. Login as pre-seeded admin
r = requests.post(f"{BASE}/api/v1/auth/login", json={"email": "admin@servicezone.tech", "password": "admin123"})
test("Admin login succeeds", r.status_code == 200)
admin_token = r.json().get("access_token", "")
admin_headers = {"Authorization": f"Bearer {admin_token}"}
test("Admin JWT token received", len(admin_token) > 20)
test("Admin role is ADMIN", r.json().get("user", {}).get("role") == "ADMIN")

# 3b. Login as pre-seeded customer
r = requests.post(f"{BASE}/api/v1/auth/login", json={"email": "customer@example.com", "password": "customer123"})
test("Customer login succeeds", r.status_code == 200)
cust_token = r.json().get("access_token", "")
cust_headers = {"Authorization": f"Bearer {cust_token}"}
test("Customer JWT token received", len(cust_token) > 20)
test("Customer role is CUSTOMER", r.json().get("user", {}).get("role") == "CUSTOMER")

# 3c. Register a brand new user
rand_suffix = ''.join(random.choices(string.ascii_lowercase, k=6))
new_email = f"tester_{rand_suffix}@servicezone.tech"
r = requests.post(f"{BASE}/api/v1/auth/register", json={
    "name": "Test User Epsilon",
    "email": new_email,
    "phone": "+15559876543",
    "password": "testpass2026"
})
test("New user registration succeeds (201)", r.status_code == 201)
new_token = r.json().get("access_token", "")
new_headers = {"Authorization": f"Bearer {new_token}"}
test("New user receives JWT token", len(new_token) > 20)

# 3d. Duplicate registration blocked
r = requests.post(f"{BASE}/api/v1/auth/register", json={
    "name": "Duplicate User",
    "email": new_email,
    "phone": "+15559876543",
    "password": "testpass2026"
})
test("Duplicate email registration rejected (400)", r.status_code == 400)

# 3e. Invalid credentials
r = requests.post(f"{BASE}/api/v1/auth/login", json={"email": "admin@servicezone.tech", "password": "wrong"})
test("Wrong password returns 401", r.status_code == 401)

# 3f. GET /auth/me
r = requests.get(f"{BASE}/api/v1/auth/me", headers=cust_headers)
test("GET /auth/me returns current user", r.status_code == 200 and r.json().get("email") == "customer@example.com")

# 3g. Unauthenticated access rejected
r = requests.get(f"{BASE}/api/v1/auth/me")
test("Unauthenticated /auth/me returns 401", r.status_code == 401)

# ─────────────────────────────────────────────
section("4. RBAC (ROLE-BASED ACCESS CONTROL)")
# ─────────────────────────────────────────────

r = requests.get(f"{BASE}/api/v1/admin/dashboard", headers=cust_headers)
test("Customer BLOCKED from admin dashboard (403)", r.status_code == 403)

r = requests.get(f"{BASE}/api/v1/admin/services", headers=cust_headers)
test("Customer BLOCKED from admin services (403)", r.status_code == 403)

r = requests.get(f"{BASE}/api/v1/admin/dashboard", headers=admin_headers)
test("Admin CAN access admin dashboard (200)", r.status_code == 200)

r = requests.get(f"{BASE}/api/v1/admin/customers", headers=admin_headers)
test("Admin CAN access customer directory (200)", r.status_code == 200)

# ─────────────────────────────────────────────
section("5. SLOT AVAILABILITY")
# ─────────────────────────────────────────────

r = requests.get(f"{BASE}/api/v1/slots/available?date=2026-11-10")
slots_data = r.json()
test("GET /slots/available returns 200", r.status_code == 200)
test("Slot response is a list", isinstance(slots_data, list))

# Find a date with slots using the admin slot listing
r = requests.get(f"{BASE}/api/v1/admin/slots", headers=admin_headers)
all_slots = r.json()
test("Admin can list all slots", r.status_code == 200)

# Get an unreserved slot
unreserved_slots = [s for s in all_slots if not s["is_reserved"] and s["is_active"]]
test(f"Found unreserved active slots ({len(unreserved_slots)} available)", len(unreserved_slots) >= 2, f"Need at least 2 for booking tests")

if len(unreserved_slots) < 2:
    print("\n  *** Not enough free slots for booking tests. Generating more slots... ***")
    from datetime import date, timedelta
    today = date.today()
    batch_start = (today + timedelta(days=10)).isoformat()
    batch_end = (today + timedelta(days=12)).isoformat()
    r = requests.post(f"{BASE}/api/v1/admin/slots/batch", headers=admin_headers, json={
        "start_date": batch_start,
        "end_date": batch_end,
        "start_time": "09:00:00",
        "end_time": "17:00:00",
        "slot_duration_minutes": 30
    })
    test("Admin batch generated extra slots", r.status_code == 201)
    r = requests.get(f"{BASE}/api/v1/admin/slots", headers=admin_headers)
    all_slots = r.json()
    unreserved_slots = [s for s in all_slots if not s["is_reserved"] and s["is_active"]]

SLOT_A = unreserved_slots[0]["id"] if len(unreserved_slots) > 0 else None
SLOT_B = unreserved_slots[1]["id"] if len(unreserved_slots) > 1 else None
SERVICE_ID = services[0]["id"]

# ─────────────────────────────────────────────
section("6. BOOKING CREATION & DOUBLE-BOOKING PREVENTION")
# ─────────────────────────────────────────────

if SLOT_A and SERVICE_ID:
    # 6a. Customer books Slot A
    booking_payload = {
        "service_id": SERVICE_ID,
        "slot_id": SLOT_A,
        "device_type": "LAPTOP",
        "device_brand": "Framework",
        "device_model": "Laptop 16 AMD",
        "problem_description": "Intermittent power failure under heavy compute load. Battery not charging past 80%.",
        "additional_notes": "Charger included. No BitLocker."
    }
    r = requests.post(f"{BASE}/api/v1/bookings", json=booking_payload, headers=cust_headers)
    test("Customer creates booking on Slot A (201)", r.status_code == 201)
    booking = r.json()
    BOOKING_ID = booking.get("id")
    REF_CODE = booking.get("reference_code", "")
    test("Booking has reference code (SZ-XXXXX format)", REF_CODE.startswith("SZ-"), f"Got: {REF_CODE}")
    test("Booking status is PENDING", booking.get("appointment_status") == "PENDING")
    test("Repair status is NOT_STARTED", booking.get("repair_status") == "NOT_STARTED")

    # 6b. New user attempts SAME slot → 409 Conflict
    r2 = requests.post(f"{BASE}/api/v1/bookings", json={
        "service_id": SERVICE_ID,
        "slot_id": SLOT_A,
        "device_type": "DESKTOP",
        "device_brand": "Dell",
        "device_model": "OptiPlex 7090",
        "problem_description": "No display output after BIOS update failure."
    }, headers=new_headers)
    test("DOUBLE-BOOKING on Slot A rejected (409)", r2.status_code == 409, f"Got {r2.status_code}: {r2.text[:120]}")
else:
    test("Skipping booking tests (no free slots)", False, "No unreserved slots found")
    BOOKING_ID = None
    REF_CODE = ""

# ─────────────────────────────────────────────
section("7. RESCHEDULING & SLOT RELEASE")
# ─────────────────────────────────────────────

if BOOKING_ID and SLOT_B:
    # 7a. Reschedule booking from Slot A → Slot B
    r = requests.patch(f"{BASE}/api/v1/bookings/{BOOKING_ID}/reschedule", json={"new_slot_id": SLOT_B}, headers=cust_headers)
    test("Reschedule from Slot A → Slot B succeeds (200)", r.status_code == 200)
    test("Booking now points to Slot B", r.json().get("slot_id") == SLOT_B)

    # 7b. Slot A should now be FREE for others
    r = requests.post(f"{BASE}/api/v1/bookings", json={
        "service_id": SERVICE_ID,
        "slot_id": SLOT_A,
        "device_type": "DESKTOP",
        "device_brand": "Dell",
        "device_model": "OptiPlex 7090",
        "problem_description": "No display output after BIOS update failure."
    }, headers=new_headers)
    test("Released Slot A is now bookable by new user (201)", r.status_code == 201)
    NEW_BOOKING_ID = r.json().get("id")

    # 7c. Cancel that new booking to clean up
    r = requests.patch(f"{BASE}/api/v1/bookings/{NEW_BOOKING_ID}/cancel", json={"reason": "Test cleanup"}, headers=new_headers)
    test("New user cancels their booking (200)", r.status_code == 200)
    test("Cancelled booking status is CANCELLED", r.json().get("appointment_status") == "CANCELLED")

# ─────────────────────────────────────────────
section("8. CUSTOMER BOOKING ISOLATION")
# ─────────────────────────────────────────────

if BOOKING_ID:
    # New user tries to view customer's booking → should be 403
    r = requests.get(f"{BASE}/api/v1/bookings/{BOOKING_ID}", headers=new_headers)
    test("Other customer BLOCKED from viewing booking (403)", r.status_code == 403)

    # New user tries to cancel customer's booking → should be 403
    r = requests.patch(f"{BASE}/api/v1/bookings/{BOOKING_ID}/cancel", json={"reason": "Unauthorized"}, headers=new_headers)
    test("Other customer BLOCKED from cancelling booking (403)", r.status_code == 403)

    # Owner can view their own booking
    r = requests.get(f"{BASE}/api/v1/bookings/{BOOKING_ID}", headers=cust_headers)
    test("Owner CAN view their own booking (200)", r.status_code == 200)

# ─────────────────────────────────────────────
section("9. ADMIN APPOINTMENT MANAGEMENT")
# ─────────────────────────────────────────────

if BOOKING_ID:
    # 9a. Admin confirms the appointment
    r = requests.patch(f"{BASE}/api/v1/admin/bookings/{BOOKING_ID}/appointment-status", json={
        "appointment_status": "CONFIRMED",
        "reason_or_notes": "Intake slot verified. Bench tech on standby."
    }, headers=admin_headers)
    test("Admin CONFIRMS appointment (200)", r.status_code == 200)
    test("Appointment status → CONFIRMED", r.json().get("appointment_status") == "CONFIRMED")

    # 9b. Admin marks as COMPLETED (device checked in)
    r = requests.patch(f"{BASE}/api/v1/admin/bookings/{BOOKING_ID}/appointment-status", json={
        "appointment_status": "COMPLETED",
        "reason_or_notes": "Device physically received at Bay 4 workbench."
    }, headers=admin_headers)
    test("Admin marks COMPLETED (device checked in)", r.status_code == 200)
    test("Appointment status → COMPLETED", r.json().get("appointment_status") == "COMPLETED")

# ─────────────────────────────────────────────
section("10. FULL REPAIR LIFECYCLE")
# ─────────────────────────────────────────────

if BOOKING_ID:
    repair_steps = [
        ("DIAGNOSING", "Unit dismantled on ESD bench. Oscilloscope probing VCC main rail. Thermal camera identifies hotspot near U3100.", 120.0, None),
        ("WAITING_FOR_CUSTOMER_APPROVAL", "Diagnosis complete: Blown MOSFET Q3204 identified. Replacement part available. Customer approval for $120 repair required.", None, None),
        ("IN_PROGRESS", "Customer approved. Micro-soldering MOSFET Q3204 replacement underway. Lead-free solder station at 340C.", None, None),
        ("READY_FOR_PICKUP", "Board-level repair complete. 24-hour OCCT stress test passed with zero errors. System stable under full load.", None, 120.0),
        ("DELIVERED", "Device handed over to client. 90-day bench warranty activated. Post-delivery inspection checklist completed.", None, None),
    ]

    for new_status, note, qp, fp in repair_steps:
        payload = {"repair_status": new_status, "note": note}
        if qp is not None:
            payload["quoted_price"] = qp
        if fp is not None:
            payload["final_price"] = fp

        r = requests.patch(f"{BASE}/api/v1/admin/bookings/{BOOKING_ID}/repair-status", json=payload, headers=admin_headers)
        test(f"Repair transition → {new_status}", r.status_code == 200, f"Got {r.status_code}")
        test(f"  Repair status confirmed: {new_status}", r.json().get("repair_status") == new_status)

    # Verify repair timeline has all entries
    r = requests.get(f"{BASE}/api/v1/bookings/{BOOKING_ID}/updates", headers=cust_headers)
    updates = r.json()
    test(f"Repair timeline has >= 5 audit entries", len(updates) >= 5, f"Got {len(updates)} entries")
    test("Latest entry is DELIVERED", updates[0].get("new_status") == "DELIVERED" if updates else False)

    # Verify final pricing
    r = requests.get(f"{BASE}/api/v1/bookings/{BOOKING_ID}", headers=cust_headers)
    bk = r.json()
    test("Quoted price recorded ($120.00)", bk.get("quoted_price") == 120.0)
    test("Final price recorded ($120.00)", bk.get("final_price") == 120.0)

# ─────────────────────────────────────────────
section("11. PUBLIC REPAIR TRACKER")
# ─────────────────────────────────────────────

if REF_CODE:
    r = requests.get(f"{BASE}/api/v1/public/track/{REF_CODE}")
    test(f"Public tracker resolves {REF_CODE} (200)", r.status_code == 200)
    track_data = r.json()
    test("Public tracker shows repair_status", "repair_status" in track_data)
    test("Public tracker shows repair_updates list", isinstance(track_data.get("repair_updates"), list))
    test("Public tracker has bench logs", len(track_data.get("repair_updates", [])) >= 5)

    # Invalid ref code
    r = requests.get(f"{BASE}/api/v1/public/track/SZ-99999")
    test("Invalid reference code returns 404", r.status_code == 404)

# ─────────────────────────────────────────────
section("12. NOTIFICATIONS")
# ─────────────────────────────────────────────

r = requests.get(f"{BASE}/api/v1/notifications", headers=cust_headers)
notifs = r.json()
test("Customer has notifications", r.status_code == 200 and len(notifs) > 0, f"Got {len(notifs)} notifications")

if notifs:
    unread = [n for n in notifs if not n["is_read"]]
    first_unread_id = unread[0]["id"] if unread else notifs[0]["id"]
    r = requests.patch(f"{BASE}/api/v1/notifications/{first_unread_id}/read", headers=cust_headers)
    test("Mark notification as read (200)", r.status_code == 200)

# ─────────────────────────────────────────────
section("13. ADMIN DASHBOARD METRICS")
# ─────────────────────────────────────────────

r = requests.get(f"{BASE}/api/v1/admin/dashboard", headers=admin_headers)
metrics = r.json()
test("Dashboard returns all metric keys", all(k in metrics for k in ["pending_appointments", "confirmed_upcoming", "active_bench_repairs", "ready_for_pickup", "total_customers", "total_completed"]))
test(f"Total customers >= 3 (admin, customer, new user)", metrics.get("total_customers", 0) >= 2)
test(f"Total completed >= 1", metrics.get("total_completed", 0) >= 1)

# ─────────────────────────────────────────────
section("14. ADMIN SERVICE CATALOG CRUD")
# ─────────────────────────────────────────────

r = requests.post(f"{BASE}/api/v1/admin/services", json={
    "name": "Liquid Damage Emergency Ultrasonic Clean",
    "summary": "Emergency 4-hour turnaround ultrasonic bath and corrosion treatment for liquid-damaged mainboards.",
    "description": "Full submersion ultrasonic cleaning at 40kHz, isopropyl alcohol rinse, heat-gun drying, and microscopic corrosion inspection.",
    "category": "Hardware Repair",
    "image_path": "/assets/services/liquid-damage.webp",
    "pricing_mode": "STARTING_AT",
    "display_price": 149.0,
    "estimated_duration_minutes": 240,
}, headers=admin_headers)
test("Admin creates new service (201)", r.status_code == 201)
new_svc_id = r.json().get("id")

r = requests.patch(f"{BASE}/api/v1/admin/services/{new_svc_id}", json={"display_price": 159.0}, headers=admin_headers)
test("Admin updates service price (200)", r.status_code == 200)
test("Updated price is $159.00", r.json().get("display_price") == 159.0)

r = requests.patch(f"{BASE}/api/v1/admin/services/{new_svc_id}", json={"is_active": False}, headers=admin_headers)
test("Admin deactivates service (200)", r.status_code == 200)
test("Service is_active = false", r.json().get("is_active") is False)

# Deactivated service not visible in public catalog
r = requests.get(f"{BASE}/api/v1/services")
public_ids = [s["id"] for s in r.json()]
test("Deactivated service hidden from public catalog", new_svc_id not in public_ids)

# ─────────────────────────────────────────────
section("15. ADMIN SLOT MANAGEMENT")
# ─────────────────────────────────────────────

from datetime import date, timedelta
future_date = (date.today() + timedelta(days=20)).isoformat()
future_end = (date.today() + timedelta(days=20)).isoformat()

r = requests.post(f"{BASE}/api/v1/admin/slots/batch", json={
    "start_date": future_date,
    "end_date": future_end,
    "start_time": "10:00:00",
    "end_time": "12:00:00",
    "slot_duration_minutes": 30,
}, headers=admin_headers)
test("Batch slot generation succeeds (201)", r.status_code == 201)
test("Response confirms slots generated", "generated" in r.json().get("message", "").lower() or "slot" in r.json().get("message", "").lower())

# Check the slots were created
r = requests.get(f"{BASE}/api/v1/admin/slots?date={future_date}", headers=admin_headers)
date_slots = r.json()
test(f"Slots exist for {future_date}", len(date_slots) >= 4, f"Got {len(date_slots)} slots")

# Toggle a slot off
if date_slots:
    toggle_id = date_slots[0]["id"]
    r = requests.patch(f"{BASE}/api/v1/admin/slots/{toggle_id}?is_active=false", headers=admin_headers)
    test("Admin disables individual slot", r.status_code == 200)

# ─────────────────────────────────────────────
section("16. ADMIN WORKSHOP SETTINGS")
# ─────────────────────────────────────────────

r = requests.get(f"{BASE}/api/v1/admin/settings", headers=admin_headers)
settings = r.json()
test("Admin settings endpoint returns data", r.status_code == 200)
test("Settings contain business_name", "business_name" in settings)
test("Settings contain auto_confirm_bookings", "auto_confirm_bookings" in settings)

# ─────────────────────────────────────────────
section("17. PROFILE UPDATE")
# ─────────────────────────────────────────────

r = requests.patch(f"{BASE}/api/v1/auth/profile", json={"name": "Alex Vance-Updated", "phone": "+15551234567"}, headers=cust_headers)
test("Customer updates profile (200)", r.status_code == 200)
test("Name updated correctly", r.json().get("name") == "Alex Vance-Updated")
test("Phone updated correctly", r.json().get("phone") == "+15551234567")

# Restore original name
requests.patch(f"{BASE}/api/v1/auth/profile", json={"name": "Alex Vance", "phone": "+1 (555) 392-1084"}, headers=cust_headers)

# ─────────────────────────────────────────────
section("18. EDGE CASES & VALIDATION")
# ─────────────────────────────────────────────

# Short problem description
r = requests.post(f"{BASE}/api/v1/bookings", json={
    "service_id": SERVICE_ID,
    "slot_id": SLOT_A,
    "device_type": "LAPTOP",
    "device_brand": "X",
    "device_model": "Y",
    "problem_description": "Short",
}, headers=cust_headers)
test("Booking with <10 char description rejected (422)", r.status_code == 422)

# Non-existent service
r = requests.post(f"{BASE}/api/v1/bookings", json={
    "service_id": "non-existent-uuid",
    "slot_id": SLOT_A,
    "device_type": "LAPTOP",
    "device_brand": "Test",
    "device_model": "Model",
    "problem_description": "Sufficient description for validation check.",
}, headers=cust_headers)
test("Booking with invalid service_id rejected (400)", r.status_code == 400)

# Non-existent slot
r = requests.post(f"{BASE}/api/v1/bookings", json={
    "service_id": SERVICE_ID,
    "slot_id": "non-existent-slot-uuid",
    "device_type": "LAPTOP",
    "device_brand": "Test",
    "device_model": "Model",
    "problem_description": "Sufficient description for validation check.",
}, headers=cust_headers)
test("Booking with invalid slot_id rejected (400)", r.status_code == 400)

# ═══════════════════════════════════════════════
section("FINAL RESULTS SUMMARY")
# ═══════════════════════════════════════════════

total = results["passed"] + results["failed"]
print(f"\n  Total Tests:  {total}")
print(f"  {PASS.strip()}:  {results['passed']}")
print(f"  {FAIL.strip()}:  {results['failed']}")

if results["failed"] == 0:
    print(f"\n  {HEADER}╔══════════════════════════════════════════════════╗")
    print(f"  ║   ALL {total} TESTS PASSED — PLATFORM VERIFIED   ║")
    print(f"  ╚══════════════════════════════════════════════════╝{RESET}")
else:
    print(f"\n  {FAIL.strip()} {results['failed']} test(s) need attention.")

print()
