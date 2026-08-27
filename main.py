"""
VitalHealth FastApi Backend Application
Serves REST API endpoints for Onboarding Wizard, Profile Management, Draft Persistence,
PRD Section 9 Analytics Metrics, and Static Frontend Assets.
"""
import os
import json
from fastapi import FastAPI, HTTPException, status, Query, Request
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, Dict, Any, List

from database import (
    init_db,
    save_profile,
    get_profile_by_session,
    get_profile_by_id,
    list_profiles,
    update_profile_partial,
    delete_profile,
    save_draft,
    get_draft,
    log_analytics_event,
    get_analytics_metrics
)
from schemas import (
    Step1BasicInfoSchema,
    Step1_5MaternalStatusSchema,
    Step2VitalsSchema,
    Step3HealthStatusSchema,
    Step4AllergiesSchema,
    OnboardingCompletePayload,
    ProfileUpdatePayload,
    DraftSavePayload,
    AnalyticsEventPayload
)

# Initialize FastAPI App
app = FastAPI(
    title="VitalHealth Onboarding & Profile API",
    description="API for VitalHealth User Onboarding & Health Profile Setup Flow",
    version="1.0.0"
)

# Enable CORS for cross-origin flexibility
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

STATIC_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "static")


@app.on_event("startup")
def startup_event():
    init_db()


# ------------------------------------------------------------------
# Health & General Endpoints
# ------------------------------------------------------------------

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "VitalHealth API",
        "version": "1.0.0",
        "storage": "SQLite WAL"
    }


# ------------------------------------------------------------------
# Step Validation Endpoints
# ------------------------------------------------------------------

@app.post("/api/onboarding/validate-step/{step_id}")
async def validate_step(step_id: str, request: Request):
    """Validates step data payload according to specific PRD rules."""
    body = await request.json()
    try:
        if step_id in ["1", "step1", "basic_info"]:
            data = Step1BasicInfoSchema(**body)
            return {"valid": True, "step": "step1", "data": data.model_dump()}
        elif step_id in ["1.5", "1_5", "step1_5", "maternal"]:
            data = Step1_5MaternalStatusSchema(**body)
            return {"valid": True, "step": "step1_5", "data": data.model_dump()}
        elif step_id in ["2", "step2", "vitals"]:
            data = Step2VitalsSchema(**body)
            return {
                "valid": True,
                "step": "step2",
                "data": data.model_dump(),
                "calculated_bmi": data.bmi
            }
        elif step_id in ["3", "step3", "health_status"]:
            data = Step3HealthStatusSchema(**body)
            return {"valid": True, "step": "step3", "data": data.model_dump()}
        elif step_id in ["4", "step4", "allergies"]:
            data = Step4AllergiesSchema(**body)
            return {"valid": True, "step": "step4", "data": data.model_dump()}
        else:
            raise HTTPException(status_code=400, detail=f"Unknown step identifier: {step_id}")
    except Exception as e:
        error_msg = str(e)
        # Extract friendly validation message if Pydantic
        if hasattr(e, "errors"):
            errors = e.errors()
            error_msg = "; ".join([f"{(err.get('loc')[-1] if err.get('loc') else 'error')}: {err.get('msg', '')}" for err in errors])
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={"valid": False, "step": step_id, "error": error_msg}
        )


# ------------------------------------------------------------------
# Draft Save & Resume Endpoints
# ------------------------------------------------------------------

@app.post("/api/onboarding/draft")
def save_onboarding_draft(payload: DraftSavePayload):
    """Auto-saves user progress across the onboarding wizard."""
    result = save_draft(payload.session_id, payload.current_step, payload.draft_data)
    return {"status": "saved", "draft": result}


@app.get("/api/onboarding/draft/{session_id}")
def get_onboarding_draft(session_id: str):
    """Retrieves an existing draft to seamlessly resume onboarding."""
    draft = get_draft(session_id)
    if not draft:
        return {"exists": False, "draft": None}
    return {"exists": True, "draft": draft}


# ------------------------------------------------------------------
# Profile Completion & Submission Endpoint
# ------------------------------------------------------------------

@app.post("/api/onboarding/complete")
def complete_onboarding(payload: OnboardingCompletePayload):
    """
    Finalizes the onboarding wizard, validates the complete health profile,
    computes BMI, stores to SQLite database, logs analytics event, and returns complete profile.
    """
    bmi_value = payload.calculated_bmi()
    
    profile_record = {
        "session_id": payload.session_id,
        "full_name": payload.full_name,
        "gender": payload.gender,
        "maternal_status": payload.maternal_status,
        "age": payload.age,
        "height_cm": payload.height_cm,
        "weight_kg": payload.weight_kg,
        "bmi": bmi_value,
        "step_length_cm": payload.step_length_cm,
        "wellbeing": payload.wellbeing,
        "condition_details": payload.condition_details,
        "has_disability": payload.has_disability,
        "disability_details": payload.disability_details,
        "has_allergies": payload.has_allergies,
        "allergy_details": payload.allergy_details,
        "primary_goal": payload.primary_goal
    }

    saved = save_profile(profile_record)
    
    # Log flow completion analytics
    log_analytics_event(
        session_id=payload.session_id,
        step_name="complete",
        event_type="flow_complete",
        time_spent_seconds=0,
        metadata={"bmi": bmi_value, "gender": payload.gender}
    )

    return {
        "status": "success",
        "message": "Health profile successfully created!",
        "profile": saved
    }


# ------------------------------------------------------------------
# Profile Management Endpoints
# ------------------------------------------------------------------

@app.get("/api/profiles")
def get_all_profiles(
    search: Optional[str] = Query(None, description="Search by name, condition, or allergy"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0)
):
    """Returns all profiles with pagination and search."""
    profiles = list_profiles(search=search, limit=limit, offset=offset)
    return {"count": len(profiles), "profiles": profiles}


@app.get("/api/profiles/{identifier}")
def get_single_profile(identifier: str):
    """Retrieves profile either by database integer ID or session_id string."""
    if identifier.isdigit():
        profile = get_profile_by_id(int(identifier))
    else:
        profile = get_profile_by_session(identifier)
    
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found.")
    return profile


@app.put("/api/profiles/{profile_id}")
def update_profile(profile_id: int, payload: ProfileUpdatePayload):
    """Updates an existing health profile."""
    existing = get_profile_by_id(profile_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Profile not found.")
    
    update_data = {k: v for k, v in payload.model_dump().items() if v is not None}
    updated = update_profile_partial(profile_id, update_data)
    return {"status": "updated", "profile": updated}


@app.delete("/api/profiles/{profile_id}")
def remove_profile(profile_id: int):
    """Deletes a health profile."""
    success = delete_profile(profile_id)
    if not success:
        raise HTTPException(status_code=404, detail="Profile not found or already deleted.")
    return {"status": "deleted", "profile_id": profile_id}


# ------------------------------------------------------------------
# Analytics & Metrics Endpoints (PRD Section 9)
# ------------------------------------------------------------------

@app.post("/api/analytics/event")
def record_analytics_event(payload: AnalyticsEventPayload):
    """Records step views, durations, and validation drop-offs."""
    log_analytics_event(
        session_id=payload.session_id,
        step_name=payload.step_name,
        event_type=payload.event_type,
        time_spent_seconds=payload.time_spent_seconds,
        metadata=payload.metadata
    )
    return {"status": "recorded"}


@app.get("/api/analytics/metrics")
def get_metrics_summary():
    """Returns onboarding success metrics as defined in Section 9."""
    return get_analytics_metrics()


# ------------------------------------------------------------------
# Static Assets & Frontend Web App Serving
# ------------------------------------------------------------------

if os.path.exists(STATIC_DIR):
    app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

@app.get("/")
def serve_root():
    index_file = os.path.join(STATIC_DIR, "index.html")
    if os.path.exists(index_file):
        return FileResponse(index_file)
    return {"message": "VitalHealth API running. Please ensure static/index.html is created."}
