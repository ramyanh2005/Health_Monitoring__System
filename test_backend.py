"""
Comprehensive Automated Test Suite for VitalHealth Backend & Database
Tests PRD business logic, range validation, conditional branching, profile CRUD,
and Section 9 analytics metrics calculations.
"""
import sys
import unittest
from fastapi.testclient import TestClient

from main import app
from database import init_db, get_db_connection

client = TestClient(app)


class TestVitalHealthBackend(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        init_db()

    def test_01_health_check(self):
        """Test API health endpoint"""
        res = client.get("/api/health")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["status"], "healthy")

    def test_02_step_validation_step1(self):
        """Test Step 1 (Basic Info) validation rules"""
        # Missing/empty name
        res = client.post("/api/onboarding/validate-step/1", json={"full_name": "", "gender": "Male"})
        self.assertEqual(res.status_code, 422)

        # Invalid gender
        res = client.post("/api/onboarding/validate-step/1", json={"full_name": "John Doe", "gender": "Other"})
        self.assertEqual(res.status_code, 422)

        # Valid payload
        res = client.post("/api/onboarding/validate-step/1", json={"full_name": "John Doe", "gender": "Male"})
        self.assertEqual(res.status_code, 200)
        self.assertTrue(res.json()["valid"])

    def test_03_step_validation_step1_5_maternal(self):
        """Test Step 1.5 (Maternal Status) validation"""
        # Invalid maternal status
        res = client.post("/api/onboarding/validate-step/1.5", json={"maternal_status": "Unknown"})
        self.assertEqual(res.status_code, 422)

        # Valid options
        for opt in ["Pregnant", "Postpartum", "Neither"]:
            res = client.post("/api/onboarding/validate-step/1.5", json={"maternal_status": opt})
            self.assertEqual(res.status_code, 200)

    def test_04_step_validation_step2_vitals(self):
        """Test Step 2 (Vitals) range validation and BMI calculation"""
        # Out of bounds age (<1 or >120)
        res = client.post("/api/onboarding/validate-step/2", json={"age": 0, "height_cm": 170, "weight_kg": 70})
        self.assertEqual(res.status_code, 422)

        res = client.post("/api/onboarding/validate-step/2", json={"age": 125, "height_cm": 170, "weight_kg": 70})
        self.assertEqual(res.status_code, 422)

        # Out of bounds height (<50 or >250)
        res = client.post("/api/onboarding/validate-step/2", json={"age": 30, "height_cm": 40, "weight_kg": 70})
        self.assertEqual(res.status_code, 422)

        # Out of bounds weight (<2 or >300)
        res = client.post("/api/onboarding/validate-step/2", json={"age": 30, "height_cm": 170, "weight_kg": 1})
        self.assertEqual(res.status_code, 422)

        # Valid vitals and verify BMI calculation
        # Height 180cm, Weight 81kg -> BMI = 81 / (1.8^2) = 25.0
        res = client.post("/api/onboarding/validate-step/2", json={
            "age": 35,
            "height_cm": 180.0,
            "weight_kg": 81.0,
            "step_length_cm": 75.0
        })
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["calculated_bmi"], 25.0)

    def test_05_step_validation_step3_health_status(self):
        """Test Step 3 (Health Status) conditional condition requirement"""
        # Healthy does not require condition details
        res = client.post("/api/onboarding/validate-step/3", json={
            "wellbeing": "Healthy",
            "has_disability": False
        })
        self.assertEqual(res.status_code, 200)

        # Unhealthy MUST have condition details
        res = client.post("/api/onboarding/validate-step/3", json={
            "wellbeing": "Unhealthy",
            "condition_details": "",
            "has_disability": False
        })
        self.assertEqual(res.status_code, 422)

        # Unhealthy with condition details passes
        res = client.post("/api/onboarding/validate-step/3", json={
            "wellbeing": "Unhealthy",
            "condition_details": "Hypertension Stage 1",
            "has_disability": True,
            "disability_details": "Mild hearing impairment"
        })
        self.assertEqual(res.status_code, 200)

    def test_06_step_validation_step4_allergies(self):
        """Test Step 4 (Allergies) validation"""
        # No allergies
        res = client.post("/api/onboarding/validate-step/4", json={
            "has_allergies": False,
            "primary_goal": "Manage Blood Pressure"
        })
        self.assertEqual(res.status_code, 200)

        # Allergies indicated without details
        res = client.post("/api/onboarding/validate-step/4", json={
            "has_allergies": True,
            "allergy_details": "",
            "primary_goal": "Manage Blood Pressure"
        })
        self.assertEqual(res.status_code, 422)

        # Allergies with details
        res = client.post("/api/onboarding/validate-step/4", json={
            "has_allergies": True,
            "allergy_details": "Penicillin, Peanuts",
            "primary_goal": "Cardiovascular Fitness"
        })
        self.assertEqual(res.status_code, 200)

    def test_07_male_onboarding_full_flow(self):
        """Test complete onboarding flow for Male user (skips maternal)"""
        session_id = "test-session-male-101"
        payload = {
            "session_id": session_id,
            "full_name": "Alexander Sterling",
            "gender": "Male",
            "maternal_status": None,
            "age": 42,
            "height_cm": 178.0,
            "weight_kg": 76.0,
            "step_length_cm": 74.0,
            "wellbeing": "Healthy",
            "condition_details": None,
            "has_disability": False,
            "disability_details": None,
            "has_allergies": False,
            "allergy_details": None,
            "primary_goal": "Cardiovascular Fitness"
        }

        res = client.post("/api/onboarding/complete", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["status"], "success")
        self.assertEqual(data["profile"]["full_name"], "Alexander Sterling")
        self.assertEqual(data["profile"]["gender"], "Male")
        self.assertIsNone(data["profile"]["maternal_status"])
        self.assertEqual(data["profile"]["bmi"], 24.0)

    def test_08_female_onboarding_full_flow(self):
        """Test complete onboarding flow for Female user (includes maternal status)"""
        session_id = "test-session-female-202"
        payload = {
            "session_id": session_id,
            "full_name": "Elena Rostova",
            "gender": "Female",
            "maternal_status": "Pregnant",
            "age": 29,
            "height_cm": 165.0,
            "weight_kg": 62.0,
            "step_length_cm": 68.0,
            "wellbeing": "Unhealthy",
            "condition_details": "Gestational diabetes risk",
            "has_disability": False,
            "disability_details": None,
            "has_allergies": True,
            "allergy_details": "Amoxicillin",
            "primary_goal": "Postpartum Health"
        }

        res = client.post("/api/onboarding/complete", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["status"], "success")
        self.assertEqual(data["profile"]["full_name"], "Elena Rostova")
        self.assertEqual(data["profile"]["maternal_status"], "Pregnant")
        self.assertEqual(data["profile"]["wellbeing"], "Unhealthy")
        self.assertEqual(data["profile"]["allergy_details"], "Amoxicillin")

    def test_09_draft_save_and_retrieve(self):
        """Test draft persistence and resume functionality"""
        session_id = "test-draft-session-999"
        draft_body = {
            "session_id": session_id,
            "current_step": 2.0,
            "draft_data": {
                "full_name": "Draft Tester",
                "gender": "Male",
                "age": 50,
                "height_cm": 172,
                "weight_kg": 80
            }
        }

        # Save draft
        res = client.post("/api/onboarding/draft", json=draft_body)
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()["status"], "saved")

        # Retrieve draft
        res = client.get(f"/api/onboarding/draft/{session_id}")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(data["exists"])
        self.assertEqual(data["draft"]["draft_data"]["full_name"], "Draft Tester")
        self.assertEqual(data["draft"]["current_step"], 2.0)

    def test_10_profile_crud_and_search(self):
        """Test listing, searching, updating, and deleting profiles"""
        # List profiles
        res = client.get("/api/profiles")
        self.assertEqual(res.status_code, 200)
        profiles = res.json()["profiles"]
        self.assertGreater(len(profiles), 0)

        # Search profiles
        res = client.get("/api/profiles?search=Alexander")
        self.assertEqual(res.status_code, 200)
        results = res.json()["profiles"]
        self.assertTrue(any(p["full_name"] == "Alexander Sterling" for p in results))

        # Get profile by session_id
        res = client.get("/api/profiles/test-session-male-101")
        self.assertEqual(res.status_code, 200)
        profile_id = res.json()["id"]

        # Update profile (weight change -> auto BMI recalculation)
        # Height 178, new Weight 85 -> BMI = 85 / (1.78^2) = 26.8
        res = client.put(f"/api/profiles/{profile_id}", json={"weight_kg": 85.0})
        self.assertEqual(res.status_code, 200)
        updated = res.json()["profile"]
        self.assertEqual(updated["weight_kg"], 85.0)
        self.assertEqual(updated["bmi"], 26.8)

        # Delete profile
        res = client.delete(f"/api/profiles/{profile_id}")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()["status"], "deleted")

        # Verify 404 after deletion
        res = client.get(f"/api/profiles/{profile_id}")
        self.assertEqual(res.status_code, 404)

    def test_11_analytics_and_metrics(self):
        """Test PRD Section 9 metrics calculation"""
        # Log some events
        client.post("/api/analytics/event", json={
            "session_id": "test-analytics-s1",
            "step_name": "step1_basic_info",
            "event_type": "step_view",
            "time_spent_seconds": 10
        })
        client.post("/api/analytics/event", json={
            "session_id": "test-analytics-s1",
            "step_name": "step2_vitals",
            "event_type": "step_view",
            "time_spent_seconds": 15
        })

        res = client.get("/api/analytics/metrics")
        self.assertEqual(res.status_code, 200)
        metrics = res.json()
        self.assertIn("completion_rate_pct", metrics)
        self.assertIn("avg_completion_time_seconds", metrics)
        self.assertIn("step_dropoff_funnel", metrics)
        self.assertIn("vitals_completeness_pct", metrics)
        self.assertGreaterEqual(metrics["vitals_completeness_pct"], 0)


if __name__ == "__main__":
    unittest.main()
