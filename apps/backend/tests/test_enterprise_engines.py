import pytest

def test_model_routing_endpoint(client):
    """Test Section 11.2 Model Routing endpoint for coding vs general tasks."""
    coding_res = client.post("/recommendations/model-routing", json={"task_or_prompt": "Refactor this TypeScript react function with error handling"})
    assert coding_res.status_code == 200, coding_res.text
    c_data = coding_res.json()
    assert c_data["task_type"] == "Code Generation"
    assert "Claude" in c_data["recommended_model"]
    assert c_data["cost_savings_percent"] == 42

    general_res = client.post("/recommendations/model-routing", json={"task_or_prompt": "Summarize the key meeting takeaways from yesterday"})
    assert general_res.status_code == 200, general_res.text
    g_data = general_res.json()
    assert g_data["task_type"] == "Summarization"
    assert "Gemini" in g_data["recommended_model"]
    assert g_data["cost_savings_percent"] == 78

def test_smart_suggestions_endpoint(client):
    """Test Section 11.2 Smart Suggestions endpoint."""
    res = client.get("/recommendations/smart-suggestions?department=Engineering")
    assert res.status_code == 200, res.text
    data = res.json()
    assert len(data["prompt_improvements"]) >= 3
    assert len(data["cost_reduction_tips"]) >= 3
    assert len(data["learning_recommendations"]) >= 3
    assert len(data["department_recommendations"]) >= 3
    assert "Engineering" in data["department_recommendations"][0]["target_team"]

def test_employee_recommendations_default(client):
    """Test GET /recommendations/employee returns intelligent defaults when DB history is minimal."""
    res = client.get("/recommendations/employee")
    assert res.status_code == 200, res.text
    data = res.json()
    assert len(data) >= 1
    assert any("Gemini" in rec["title"] or "Caching" in rec["title"] for rec in data)

def test_roi_calculator_endpoint(client):
    """Test Section 11.3 FinOps ROI Calculator endpoint."""
    res = client.post("/finops/roi-calculator", json={"hours_saved": 1250.0, "hourly_cost_rate": 60.0, "ai_cost_incurred": 15800.0})
    assert res.status_code == 200, res.text
    data = res.json()
    assert data["business_value_generated"] == 75000.0
    assert data["net_roi_percentage"] > 300.0
    assert "Business Value" in data["formula_string"] and "ROI =" in data["formula_string"]

def test_ols_regression_endpoint(client):
    """Test Section 11.3 Ordinary Least Squares regression forecasting endpoint."""
    res = client.post("/forecast/ols-regression", json={"historical_costs": [1200.0, 1450.0, 1580.0, 1720.0, 1890.0, 2100.0]})
    assert res.status_code == 200, res.text
    data = res.json()
    assert data["slope"] > 0
    assert data["r_squared"] > 80.0
    assert len(data["forecast_points"]) == 10
    assert "Ordinary Least Squares" in data["roadmap_note"]

def test_leaderboards_endpoint(client):
    """Test Section 11.4 Gamification Leaderboards endpoint."""
    res = client.get("/analytics/leaderboards")
    assert res.status_code == 200, res.text
    data = res.json()
    assert len(data["top_prompt_writer"]) == 3
    assert len(data["top_ai_user"]) == 3
    assert len(data["most_improved"]) == 3
    assert len(data["most_efficient"]) == 3
    assert data["top_prompt_writer"][0]["badge_title"] == "🏆 Master Prompter"
