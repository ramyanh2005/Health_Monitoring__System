"""
Database Layer for VitalHealth Onboarding & Profile Management
Uses SQLite with WAL mode for fast concurrent operations and high reliability.
"""
import sqlite3
import os
import json
from datetime import datetime
from typing import Optional, Dict, Any, List

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "vitalhealth.db")


def get_db_connection() -> sqlite3.Connection:
    """Creates a database connection with Row factory and WAL mode enabled."""
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL;")
    conn.execute("PRAGMA foreign_keys=ON;")
    return conn


def init_db():
    """Initializes the database tables and indexes if they do not exist."""
    conn = get_db_connection()
    with conn:
        # Profiles table
        conn.execute("""
            CREATE TABLE IF NOT EXISTS profiles (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT UNIQUE NOT NULL,
                full_name TEXT NOT NULL,
                gender TEXT NOT NULL,
                maternal_status TEXT,
                age INTEGER NOT NULL,
                height_cm REAL NOT NULL,
                weight_kg REAL NOT NULL,
                bmi REAL NOT NULL,
                step_length_cm REAL,
                wellbeing TEXT NOT NULL,
                condition_details TEXT,
                has_disability BOOLEAN NOT NULL DEFAULT 0,
                disability_details TEXT,
                has_allergies BOOLEAN NOT NULL DEFAULT 0,
                allergy_details TEXT,
                primary_goal TEXT NOT NULL DEFAULT 'Manage Blood Pressure',
                status TEXT NOT NULL DEFAULT 'completed',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)

        # Onboarding drafts for save-and-resume capability
        conn.execute("""
            CREATE TABLE IF NOT EXISTS onboarding_drafts (
                session_id TEXT PRIMARY KEY,
                current_step REAL NOT NULL DEFAULT 1,
                draft_data TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)

        # Analytics events tracking PRD Section 9 success metrics
        conn.execute("""
            CREATE TABLE IF NOT EXISTS analytics_events (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT NOT NULL,
                step_name TEXT NOT NULL,
                event_type TEXT NOT NULL,
                time_spent_seconds REAL DEFAULT 0,
                metadata TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)

        # Indexes for query performance
        conn.execute("CREATE INDEX IF NOT EXISTS idx_profiles_session ON profiles(session_id);")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_analytics_session ON analytics_events(session_id);")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics_events(event_type);")

    conn.close()


def save_profile(profile_data: Dict[str, Any]) -> Dict[str, Any]:
    """Inserts or updates a completed user health profile."""
    conn = get_db_connection()
    now = datetime.utcnow().isoformat()
    with conn:
        cursor = conn.execute("""
            INSERT INTO profiles (
                session_id, full_name, gender, maternal_status, age,
                height_cm, weight_kg, bmi, step_length_cm, wellbeing,
                condition_details, has_disability, disability_details,
                has_allergies, allergy_details, primary_goal, status,
                created_at, updated_at
            ) VALUES (
                :session_id, :full_name, :gender, :maternal_status, :age,
                :height_cm, :weight_kg, :bmi, :step_length_cm, :wellbeing,
                :condition_details, :has_disability, :disability_details,
                :has_allergies, :allergy_details, :primary_goal, 'completed',
                :now, :now
            )
            ON CONFLICT(session_id) DO UPDATE SET
                full_name=excluded.full_name,
                gender=excluded.gender,
                maternal_status=excluded.maternal_status,
                age=excluded.age,
                height_cm=excluded.height_cm,
                weight_kg=excluded.weight_kg,
                bmi=excluded.bmi,
                step_length_cm=excluded.step_length_cm,
                wellbeing=excluded.wellbeing,
                condition_details=excluded.condition_details,
                has_disability=excluded.has_disability,
                disability_details=excluded.disability_details,
                has_allergies=excluded.has_allergies,
                allergy_details=excluded.allergy_details,
                primary_goal=excluded.primary_goal,
                status='completed',
                updated_at=excluded.updated_at
        """, {**profile_data, "now": now})
        profile_id = cursor.lastrowid

    conn.close()
    return get_profile_by_session(profile_data["session_id"])


def get_profile_by_session(session_id: str) -> Optional[Dict[str, Any]]:
    """Retrieves profile by session ID."""
    conn = get_db_connection()
    row = conn.execute("SELECT * FROM profiles WHERE session_id = ?", (session_id,)).fetchone()
    conn.close()
    if row:
        return dict(row)
    return None


def get_profile_by_id(profile_id: int) -> Optional[Dict[str, Any]]:
    """Retrieves profile by primary key ID."""
    conn = get_db_connection()
    row = conn.execute("SELECT * FROM profiles WHERE id = ?", (profile_id,)).fetchone()
    conn.close()
    if row:
        return dict(row)
    return None


def list_profiles(search: Optional[str] = None, limit: int = 50, offset: int = 0) -> List[Dict[str, Any]]:
    """Lists profiles with optional text search."""
    conn = get_db_connection()
    if search:
        query = """
            SELECT * FROM profiles
            WHERE full_name LIKE ? OR condition_details LIKE ? OR allergy_details LIKE ?
            ORDER BY created_at DESC LIMIT ? OFFSET ?
        """
        pattern = f"%{search}%"
        rows = conn.execute(query, (pattern, pattern, pattern, limit, offset)).fetchall()
    else:
        query = "SELECT * FROM profiles ORDER BY created_at DESC LIMIT ? OFFSET ?"
        rows = conn.execute(query, (limit, offset)).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def update_profile_partial(profile_id: int, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """Updates specific fields of an existing profile."""
    conn = get_db_connection()
    allowed_keys = {
        "full_name", "gender", "maternal_status", "age", "height_cm",
        "weight_kg", "bmi", "step_length_cm", "wellbeing", "condition_details",
        "has_disability", "disability_details", "has_allergies", "allergy_details",
        "primary_goal"
    }
    filtered_updates = {k: v for k, v in updates.items() if k in allowed_keys}
    if not filtered_updates:
        return get_profile_by_id(profile_id)

    # Recalculate BMI if height or weight is updated
    if "height_cm" in filtered_updates or "weight_kg" in filtered_updates:
        current = get_profile_by_id(profile_id)
        if current:
            h = filtered_updates.get("height_cm", current["height_cm"])
            w = filtered_updates.get("weight_kg", current["weight_kg"])
            if h and h > 0:
                filtered_updates["bmi"] = round(w / ((h / 100) ** 2), 1)

    filtered_updates["updated_at"] = datetime.utcnow().isoformat()

    set_clauses = ", ".join([f"{k} = :{k}" for k in filtered_updates.keys()])
    with conn:
        conn.execute(
            f"UPDATE profiles SET {set_clauses} WHERE id = :id",
            {**filtered_updates, "id": profile_id}
        )
    conn.close()
    return get_profile_by_id(profile_id)


def delete_profile(profile_id: int) -> bool:
    """Deletes a profile by ID."""
    conn = get_db_connection()
    with conn:
        cursor = conn.execute("DELETE FROM profiles WHERE id = ?", (profile_id,))
        deleted = cursor.rowcount > 0
    conn.close()
    return deleted


def save_draft(session_id: str, current_step: float, draft_data: Dict[str, Any]) -> Dict[str, Any]:
    """Saves or updates an in-progress onboarding draft."""
    conn = get_db_connection()
    now = datetime.utcnow().isoformat()
    draft_json = json.dumps(draft_data)
    with conn:
        conn.execute("""
            INSERT INTO onboarding_drafts (session_id, current_step, draft_data, updated_at)
            VALUES (?, ?, ?, ?)
            ON CONFLICT(session_id) DO UPDATE SET
                current_step=excluded.current_step,
                draft_data=excluded.draft_data,
                updated_at=excluded.updated_at
        """, (session_id, current_step, draft_json, now))
    conn.close()
    return {"session_id": session_id, "current_step": current_step, "updated_at": now}


def get_draft(session_id: str) -> Optional[Dict[str, Any]]:
    """Retrieves an onboarding draft by session ID."""
    conn = get_db_connection()
    row = conn.execute("SELECT * FROM onboarding_drafts WHERE session_id = ?", (session_id,)).fetchone()
    conn.close()
    if row:
        return {
            "session_id": row["session_id"],
            "current_step": row["current_step"],
            "draft_data": json.loads(row["draft_data"]),
            "updated_at": row["updated_at"]
        }
    return None


def log_analytics_event(session_id: str, step_name: str, event_type: str,
                        time_spent_seconds: float = 0, metadata: Optional[Dict[str, Any]] = None):
    """Records an analytics event for onboarding funnel tracking."""
    conn = get_db_connection()
    meta_json = json.dumps(metadata) if metadata else None
    with conn:
        conn.execute("""
            INSERT INTO analytics_events (session_id, step_name, event_type, time_spent_seconds, metadata)
            VALUES (?, ?, ?, ?, ?)
        """, (session_id, step_name, event_type, time_spent_seconds, meta_json))
    conn.close()


def get_analytics_metrics() -> Dict[str, Any]:
    """Calculates PRD Section 9 onboarding performance metrics."""
    conn = get_db_connection()
    
    # Total unique sessions started (step 1 viewed)
    starts = conn.execute("""
        SELECT COUNT(DISTINCT session_id) as count 
        FROM analytics_events 
        WHERE step_name = 'step1_basic_info' AND event_type = 'step_view'
    """).fetchone()["count"]

    # Total unique sessions completed
    completes = conn.execute("""
        SELECT COUNT(DISTINCT session_id) as count 
        FROM profiles 
        WHERE status = 'completed'
    """).fetchone()["count"]

    # Step view counts for drop-off calculation
    steps = ["step1_basic_info", "step1_5_maternal", "step2_vitals", "step3_health_status", "step4_allergies"]
    step_counts = {}
    for step in steps:
        c = conn.execute("""
            SELECT COUNT(DISTINCT session_id) as count 
            FROM analytics_events 
            WHERE step_name = ? AND event_type = 'step_view'
        """, (step,)).fetchone()["count"]
        step_counts[step] = c

    # Average completion time in seconds
    avg_time_row = conn.execute("""
        SELECT AVG(total_time) as avg_time FROM (
            SELECT session_id, SUM(time_spent_seconds) as total_time
            FROM analytics_events
            WHERE session_id IN (SELECT session_id FROM profiles WHERE status = 'completed')
            GROUP BY session_id
        )
    """).fetchone()
    avg_time = round(avg_time_row["avg_time"], 1) if avg_time_row and avg_time_row["avg_time"] else 0.0

    # Vitals completeness rate
    vitals_complete_row = conn.execute("""
        SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN age IS NOT NULL AND height_cm IS NOT NULL AND weight_kg IS NOT NULL THEN 1 ELSE 0 END) as complete_vitals,
            SUM(CASE WHEN step_length_cm IS NOT NULL THEN 1 ELSE 0 END) as with_step_length
        FROM profiles
    """).fetchone()

    total_profiles = vitals_complete_row["total"] or 0
    complete_vitals = vitals_complete_row["complete_vitals"] or 0
    with_step_length = vitals_complete_row["with_step_length"] or 0

    completion_rate = round((completes / max(starts, 1)) * 100, 1) if starts > 0 else (100.0 if completes > 0 else 0.0)
    vitals_rate = round((complete_vitals / max(total_profiles, 1)) * 100, 1) if total_profiles > 0 else 100.0

    conn.close()

    return {
        "total_started": max(starts, completes),
        "total_completed": completes,
        "completion_rate_pct": completion_rate,
        "avg_completion_time_seconds": avg_time,
        "step_dropoff_funnel": step_counts,
        "profiles_count": total_profiles,
        "vitals_completeness_pct": vitals_rate,
        "step_length_optional_provided_pct": round((with_step_length / max(total_profiles, 1)) * 100, 1) if total_profiles > 0 else 0.0
    }


def seed_sample_data():
    """Seeds initial demonstration data if database is empty."""
    conn = get_db_connection()
    count = conn.execute("SELECT COUNT(*) as c FROM profiles").fetchone()["c"]
    conn.close()
    if count == 0:
        samples = [
            {
                "session_id": "seed-female-001",
                "full_name": "Dr. Sarah Jenkins",
                "gender": "Female",
                "maternal_status": "Postpartum",
                "age": 32,
                "height_cm": 168.0,
                "weight_kg": 64.5,
                "bmi": 22.9,
                "step_length_cm": 72.0,
                "wellbeing": "Healthy",
                "condition_details": None,
                "has_disability": False,
                "disability_details": None,
                "has_allergies": True,
                "allergy_details": "Penicillin, Pollen",
                "primary_goal": "Cardiovascular Health"
            },
            {
                "session_id": "seed-male-002",
                "full_name": "Marcus Vance",
                "gender": "Male",
                "maternal_status": None,
                "age": 45,
                "height_cm": 182.0,
                "weight_kg": 88.0,
                "bmi": 26.6,
                "step_length_cm": 78.0,
                "wellbeing": "Unhealthy",
                "condition_details": "Hypertension (mild stage 1)",
                "has_disability": False,
                "disability_details": None,
                "has_allergies": False,
                "allergy_details": None,
                "primary_goal": "Manage Blood Pressure"
            }
        ]
        for s in samples:
            save_profile(s)
            log_analytics_event(s["session_id"], "step1_basic_info", "step_view", 12)
            log_analytics_event(s["session_id"], "step2_vitals", "step_view", 18)
            log_analytics_event(s["session_id"], "step3_health_status", "step_view", 15)
            log_analytics_event(s["session_id"], "step4_allergies", "step_view", 20)
            log_analytics_event(s["session_id"], "complete", "flow_complete", 65)


# Auto-initialize on module load
init_db()
seed_sample_data()
