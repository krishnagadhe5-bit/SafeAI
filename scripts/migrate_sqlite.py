"""Database migration script: migrate historical records from legacy safeai.db to new database."""

import os
import sqlite3
from datetime import datetime, timezone
from pathlib import Path

# Paths
ROOT = Path(__file__).resolve().parents[1]
OLD_DB = ROOT / "backend" / "safeai.db"
NEW_DB = ROOT / "backend" / "safeai_new.db"


def migrate():
    if not OLD_DB.exists():
        print(f"Old database not found at {OLD_DB}. Nothing to migrate.")
        return

    # Check old records
    with sqlite3.connect(OLD_DB) as old_conn:
        old_cur = old_conn.cursor()
        old_rows = old_cur.execute(
            "SELECT id, created, venue, crowd, weather, event, risk, score FROM assessments ORDER BY id"
        ).fetchall()

    print(f"Found {len(old_rows)} records in legacy safeai.db.")
    if not old_rows:
        return

    # Connect to new database
    with sqlite3.connect(NEW_DB) as new_conn:
        new_cur = new_conn.cursor()
        # Ensure new table exists
        new_cur.execute("""
            CREATE TABLE IF NOT EXISTS assessments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                created_at TIMESTAMP NOT NULL,
                user_id INTEGER,
                venue VARCHAR(200) NOT NULL,
                event_type VARCHAR(50) NOT NULL,
                crowd_size INTEGER NOT NULL,
                venue_capacity INTEGER NOT NULL,
                weather VARCHAR(50) NOT NULL,
                temperature_c FLOAT NOT NULL,
                previous_incidents INTEGER NOT NULL,
                holiday INTEGER NOT NULL,
                time_slot VARCHAR(20) NOT NULL,
                day_of_week VARCHAR(20) NOT NULL,
                risk_level VARCHAR(20) NOT NULL,
                risk_score INTEGER NOT NULL,
                confidence FLOAT,
                model_version VARCHAR(100),
                security_personnel INTEGER,
                police_units INTEGER,
                medical_teams INTEGER,
                ambulances INTEGER,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        """)

        # Get existing count in new DB
        existing_count = new_cur.execute("SELECT COUNT(*) FROM assessments").fetchone()[0]
        if existing_count > 0:
            print(f"New database already has {existing_count} records. Skipping to prevent duplicates.")
            return

        migrated = 0
        mult = {"Low": 0.65, "Medium": 0.85, "High": 1.15, "Critical": 1.4}
        for r in old_rows:
            old_id, created, venue, crowd, weather, event, risk, score = r

            # Calculate illustrative resources
            m = mult.get(risk, 1.0)
            sec = max(2, round(crowd / 500 * m))
            pol = max(1, round(crowd / 1800 * m))
            med = max(1, round(crowd / 3500 * m))
            amb = max(1, round(crowd / 5000 * m))

            # Approximation for missing legacy fields:
            capacity = max(crowd, round(crowd * 1.25))
            temp = 25.0
            inc = 0
            holiday = 0
            time_slot = "Evening"
            day_of_week = "Saturday"

            new_cur.execute(
                """
                INSERT INTO assessments (
                    id, created_at, user_id, venue, event_type, crowd_size,
                    venue_capacity, weather, temperature_c, previous_incidents,
                    holiday, time_slot, day_of_week, risk_level, risk_score,
                    confidence, model_version, security_personnel, police_units,
                    medical_teams, ambulances
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    old_id, created, None, venue, event, crowd,
                    capacity, weather, temp, inc,
                    holiday, time_slot, day_of_week, risk, score,
                    70.0, "v1-legacy-migration", sec, pol,
                    med, amb
                )
            )
            migrated += 1

        new_conn.commit()
        print(f"Successfully migrated {migrated} historical records to {NEW_DB}.")


if __name__ == "__main__":
    migrate()

