from datetime import date, time, timedelta, datetime, timezone
from backend.app.core.database import SessionLocal, Base, engine
from backend.app.core.security import get_password_hash
from backend.app.models import User, Service, Slot, Booking, Notification

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    try:
        # 1. Admin user
        admin = db.query(User).filter(User.email == "admin@servicezone.tech").first()
        if not admin:
            admin = User(
                name="Head Bench Engineer",
                email="admin@servicezone.tech",
                phone="+1 (555) 737-8491",
                password_hash=get_password_hash("admin123"),
                role="ADMIN",
                is_active=True
            )
            db.add(admin)
            print("Seeded admin user: admin@servicezone.tech / admin123")
        
        # 2. Demo customer
        customer = db.query(User).filter(User.email == "customer@example.com").first()
        if not customer:
            customer = User(
                name="Alex Vance",
                email="customer@example.com",
                phone="+1 (555) 392-1084",
                password_hash=get_password_hash("customer123"),
                role="CUSTOMER",
                is_active=True
            )
            db.add(customer)
            print("Seeded demo customer: customer@example.com / customer123")

        # 3. Seed Catalog Services
        services_data = [
            {
                "name": "Hardware Component Repair & Replacement",
                "slug": "hardware-repair",
                "category": "Hardware Repair",
                "summary": "Precision diagnostic and board-level repair for motherboards, displays, keyboards, batteries, and power subsystems.",
                "description": "Comprehensive bench inspection using micro-soldering, thermal imaging, and oscilloscopes. Covers logic board power rail faults, cracked laptop panels, battery degradation, thermal throttling, and damaged DC jacks.",
                "image_path": "/assets/services/hardware-repair.webp",
                "pricing_mode": "STARTING_AT",
                "display_price": 79.00,
                "estimated_duration_minutes": 120,
                "display_order": 1,
            },
            {
                "name": "System Software & OS Deployment",
                "slug": "software-services",
                "category": "Software Services",
                "summary": "Clean OS installation, UEFI/BIOS firmware updates, driver optimization, and stability stress-testing.",
                "description": "Certified OEM and clean operating system deployment (Windows 11 / Linux). Includes complete chipset driver validation, secure boot configuration, and thorough benchmark testing.",
                "image_path": "/assets/services/software-installation.webp",
                "pricing_mode": "FIXED",
                "display_price": 59.00,
                "estimated_duration_minutes": 90,
                "display_order": 2,
            },
            {
                "name": "Advanced Malware & Rootkit Sanitization",
                "slug": "virus-malware-removal",
                "category": "Virus & Malware Removal",
                "summary": "Deep forensic removal of ransomware, rootkits, spyware, and persistence hooks without data loss.",
                "description": "Offline-environment deep drive analysis, boot-sector inspection, registry clean-up, and installation of hardening measures to prevent reinfection.",
                "image_path": "/assets/services/virus-removal.webp",
                "pricing_mode": "FIXED",
                "display_price": 69.00,
                "estimated_duration_minutes": 90,
                "display_order": 3,
            },
            {
                "name": "Thermal Maintenance & Ultrasonic Cleaning",
                "slug": "computer-maintenance",
                "category": "Computer Maintenance",
                "summary": "Internal dust extraction, thermal interface material (liquid metal / high-conductivity paste) re-application, and fan overhaul.",
                "description": "Essential preventative servicing for gaming laptops, mobile workstations, and high-performance desktop rigs. Restores factory acoustic profiles and eliminates thermal throttling.",
                "image_path": "/assets/services/maintenance.webp",
                "pricing_mode": "FIXED",
                "display_price": 49.00,
                "estimated_duration_minutes": 60,
                "display_order": 4,
            },
            {
                "name": "Storage Recovery & Forensic Backup Assessment",
                "slug": "data-recovery",
                "category": "Data Recovery",
                "summary": "Non-invasive data extraction from failing NVMe SSDs, mechanical hard drives, and formatted partitions.",
                "description": "Clean-bench diagnostic extraction for drives suffering from firmware corruption, bad sectors, or accidental format. Full integrity verification and secure delivery.",
                "image_path": "/assets/services/data-recovery.webp",
                "pricing_mode": "STARTING_AT",
                "display_price": 99.00,
                "estimated_duration_minutes": 180,
                "display_order": 5,
            },
            {
                "name": "Custom PC Assembly & Precision Upgrades",
                "slug": "pc-assembly-upgrades",
                "category": "PC Assembly & Upgrades",
                "summary": "Turnkey custom rig construction, clean cable management, memory/storage upgrades, and custom loop cooling.",
                "description": "Precision system integration tailored for CAD, 3D rendering, machine learning, or esports. Includes component synergy checks, BIOS tuning, and 24-hour load stability validation.",
                "image_path": "/assets/services/pc-upgrade.webp",
                "pricing_mode": "STARTING_AT",
                "display_price": 89.00,
                "estimated_duration_minutes": 150,
                "display_order": 6,
            }
        ]

        for s_data in services_data:
            existing_s = db.query(Service).filter(Service.slug == s_data["slug"]).first()
            if not existing_s:
                s = Service(
                    name=s_data["name"],
                    slug=s_data["slug"],
                    category=s_data["category"],
                    summary=s_data["summary"],
                    description=s_data["description"],
                    image_path=s_data["image_path"],
                    pricing_mode=s_data["pricing_mode"],
                    display_price=s_data["display_price"],
                    estimated_duration_minutes=s_data["estimated_duration_minutes"],
                    display_order=s_data["display_order"],
                    is_active=True
                )
                db.add(s)
        
        db.commit()
        print("Seeded catalog services.")

        # 4. Seed Slots for the next 7 days
        today = date.today()
        intake_times = [
            (time(9, 30), time(10, 0)),
            (time(10, 0), time(10, 30)),
            (time(10, 30), time(11, 0)),
            (time(11, 0), time(11, 30)),
            (time(11, 30), time(12, 0)),
            (time(14, 0), time(14, 30)),
            (time(14, 30), time(15, 0)),
            (time(15, 0), time(15, 30)),
            (time(15, 30), time(16, 0)),
            (time(16, 0), time(16, 30)),
        ]

        slots_seeded = 0
        for day_offset in range(1, 8):
            target_date = today + timedelta(days=day_offset)
            # Skip Sundays
            if target_date.weekday() == 6:
                continue
            
            for start_t, end_t in intake_times:
                slot_exists = db.query(Slot).filter(
                    Slot.slot_date == target_date,
                    Slot.start_time == start_t,
                    Slot.end_time == end_t
                ).first()
                if not slot_exists:
                    new_slot = Slot(
                        slot_date=target_date,
                        start_time=start_t,
                        end_time=end_t,
                        is_active=True
                    )
                    db.add(new_slot)
                    slots_seeded += 1
        
        db.commit()
        print(f"Seeded {slots_seeded} availability slots for upcoming days.")

    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
