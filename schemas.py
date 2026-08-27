"""
Pydantic Schemas for VitalHealth Onboarding API
Encapsulates strict validation rules from PRD Sections 5 & 6.
"""
from pydantic import BaseModel, Field, field_validator, model_validator
from typing import Optional, Literal, Dict, Any, List
from datetime import datetime


class Step1BasicInfoSchema(BaseModel):
    full_name: str = Field(..., min_length=1, max_length=100, description="Full Name of the user")
    gender: Literal["Male", "Female"] = Field(..., description="Gender identifier")

    @field_validator("full_name")
    @classmethod
    def validate_name_not_empty(cls, v: str) -> str:
        cleaned = v.strip()
        if not cleaned:
            raise ValueError("Full Name cannot be empty or solely whitespace.")
        return cleaned


class Step1_5MaternalStatusSchema(BaseModel):
    maternal_status: Literal["Pregnant", "Postpartum", "Neither"] = Field(..., description="Maternal status for female users")


class Step2VitalsSchema(BaseModel):
    age: int = Field(..., ge=1, le=120, description="Age in years (1 to 120)")
    height_cm: float = Field(..., ge=50.0, le=250.0, description="Height in centimeters (50 to 250 cm)")
    weight_kg: float = Field(..., ge=2.0, le=300.0, description="Weight in kilograms (2 to 300 kg)")
    step_length_cm: Optional[float] = Field(None, ge=20.0, le=150.0, description="Step length in cm (optional, 20 to 150 cm)")

    @property
    def bmi(self) -> float:
        h_m = self.height_cm / 100.0
        return round(self.weight_kg / (h_m * h_m), 1)


class Step3HealthStatusSchema(BaseModel):
    wellbeing: Literal["Healthy", "Unhealthy"] = Field(..., description="Self-reported health status")
    condition_details: Optional[str] = Field(None, max_length=500, description="Description of health problem/condition")
    has_disability: bool = Field(False, description="Physical or cognitive disability flag")
    disability_details: Optional[str] = Field(None, max_length=300, description="Disability description if applicable")

    @model_validator(mode="after")
    def validate_condition_if_unhealthy(self):
        if self.wellbeing == "Unhealthy":
            if not self.condition_details or not self.condition_details.strip():
                raise ValueError("Please specify the health problem or condition you are managing.")
        return self


class Step4AllergiesSchema(BaseModel):
    has_allergies: bool = Field(False, description="Allergy presence flag")
    allergy_details: Optional[str] = Field(None, max_length=500, description="Details/names of allergies")
    primary_goal: str = Field("Manage Blood Pressure", max_length=100, description="Primary health goal")

    @model_validator(mode="after")
    def validate_allergy_details_if_yes(self):
        if self.has_allergies:
            if not self.allergy_details or not self.allergy_details.strip():
                raise ValueError("Please specify the allergies or substances you are allergic to.")
        return self


class OnboardingCompletePayload(BaseModel):
    session_id: str = Field(..., min_length=3, description="Client session identifier")
    full_name: str = Field(..., min_length=1, max_length=100)
    gender: Literal["Male", "Female"]
    maternal_status: Optional[Literal["Pregnant", "Postpartum", "Neither"]] = None
    age: int = Field(..., ge=1, le=120)
    height_cm: float = Field(..., ge=50.0, le=250.0)
    weight_kg: float = Field(..., ge=2.0, le=300.0)
    step_length_cm: Optional[float] = Field(None, ge=20.0, le=150.0)
    wellbeing: Literal["Healthy", "Unhealthy"]
    condition_details: Optional[str] = None
    has_disability: bool = False
    disability_details: Optional[str] = None
    has_allergies: bool = False
    allergy_details: Optional[str] = None
    primary_goal: str = "Manage Blood Pressure"

    @model_validator(mode="after")
    def validate_entire_profile(self):
        # Female maternal status requirement
        if self.gender == "Female" and not self.maternal_status:
            raise ValueError("Maternal status is required for female profiles.")
        if self.gender == "Male":
            self.maternal_status = None

        # Wellbeing condition requirement
        if self.wellbeing == "Unhealthy":
            if not self.condition_details or not self.condition_details.strip():
                raise ValueError("Condition details are required when wellbeing is marked as Unhealthy.")
        else:
            self.condition_details = None

        # Allergy details requirement
        if self.has_allergies:
            if not self.allergy_details or not self.allergy_details.strip():
                raise ValueError("Allergy details are required when allergies are indicated.")
        else:
            self.allergy_details = None

        return self

    def calculated_bmi(self) -> float:
        h_m = self.height_cm / 100.0
        return round(self.weight_kg / (h_m * h_m), 1)


class ProfileUpdatePayload(BaseModel):
    full_name: Optional[str] = Field(None, min_length=1, max_length=100)
    gender: Optional[Literal["Male", "Female"]] = None
    maternal_status: Optional[Literal["Pregnant", "Postpartum", "Neither"]] = None
    age: Optional[int] = Field(None, ge=1, le=120)
    height_cm: Optional[float] = Field(None, ge=50.0, le=250.0)
    weight_kg: Optional[float] = Field(None, ge=2.0, le=300.0)
    step_length_cm: Optional[float] = Field(None, ge=20.0, le=150.0)
    wellbeing: Optional[Literal["Healthy", "Unhealthy"]] = None
    condition_details: Optional[str] = None
    has_disability: Optional[bool] = None
    disability_details: Optional[str] = None
    has_allergies: Optional[bool] = None
    allergy_details: Optional[str] = None
    primary_goal: Optional[str] = None


class DraftSavePayload(BaseModel):
    session_id: str
    current_step: float
    draft_data: Dict[str, Any]


class AnalyticsEventPayload(BaseModel):
    session_id: str
    step_name: str
    event_type: str
    time_spent_seconds: float = 0
    metadata: Optional[Dict[str, Any]] = None
