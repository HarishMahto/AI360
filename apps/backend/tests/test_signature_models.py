import pytest

def test_cost_advisor_endpoint(client):
    """Test Section 11.5.1 AI Cost Advisor endpoint."""
    response = client.get("/finops/cost-advisor")
    assert response.status_code == 200, response.text
    data = response.json()
    assert data["period"] == "Yesterday"
    assert data["department"] == "Engineering"
    assert "Gemini Flash" in data["recommendation"]
    assert data["spent_formatted"] == "₹820" or "₹" in data["spent_formatted"]

def test_team_benchmarks_endpoint(client):
    """Test Section 11.5.2 AI Team Benchmarks endpoint."""
    response = client.get("/analytics/team-benchmarks")
    assert response.status_code == 200, response.text
    data = response.json()
    assert len(data) == 4
    qa_team = next(t for t in data if t["team_name"] == "QA")
    assert qa_team["score"] == 67 or qa_team["score"] < 75
    assert "Coaching Signal" in qa_team["coaching_signal"]
    backend_team = next(t for t in data if t["team_name"] == "Backend")
    assert backend_team["status"] == "Elite"
    assert backend_team["coaching_signal"] is None

def test_maturity_score_endpoint(client):
    """
    Test Section 11.5.3 AI Maturity Score endpoint.
    maturity_index/current_level are now derived from the real team-benchmark average
    (see AnalyticsService.get_organization_maturity_score) instead of a hardcoded 86/4.
    In this test environment there's no live departmentAnalytics data, so
    get_team_benchmarks() falls back to its specification scores (92, 88, 84, 67),
    averaging to 83 -> level 3 "Productive".
    """
    response = client.get("/analytics/maturity-score")
    assert response.status_code == 200, response.text
    data = response.json()
    assert data["current_level"] == 3
    assert data["current_level_name"] == "Productive"
    assert data["maturity_index"] == 83
    assert len(data["ladder"]) == 4
    assert data["ladder"][2]["status"] == "Active"
    assert data["ladder"][3]["status"] == "Upcoming"

def test_prompt_privacy_layer_endpoint(client):
    """Test Section 11.5.4 AI Prompt Privacy Layer endpoint."""
    payload = {
        "prompt": "Customer ABC SAP password is SuperSecret! Write a Python function for SAP RFC connection.",
        "allow_full_prompt_storage": False,
        "target_model": "gemini-1.5-flash"
    }
    response = client.post("/prompt/privacy-layer", json=payload)
    assert response.status_code == 200, response.text
    data = response.json()
    assert data["contains_sensitive_data"] is True
    assert "CUSTOMER_NAME" in data["detected_types"] or "SAP_PASSWORD" in data["detected_types"]
    assert "[MASKED_CUSTOMER_ID]" in data["masked_prompt"]
    assert "[MASKED_PASSWORD]" in data["masked_prompt"]
    assert "Security Guardrail Triggered" in data["warning_message"]
    assert data["stored_payload_type"] == "metadata_only"
    assert data["metadata"]["model"] == "gemini-1.5-flash"
    assert data["metadata"]["token_count"] > 0
