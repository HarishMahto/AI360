"""
AI360 – Automated Verification Suite for Section 10.2 Employee Dashboard AI Engine
Tests Prompt Coach (10.2.1), Token Optimizer (10.2.2), Model Recommendations (10.2.3),
Prompt History (10.2.4), Prompt Marketplace (10.2.5), Learning Coach (10.2.6), and Session Summary (10.2.7).
"""
import pytest

def test_prompt_coach_and_token_optimizer(client):
    """Test 10.2.1 Prompt Coach and 10.2.2 Token Optimizer with 'Write Java API' demo case."""
    res = client.post("/prompt/coach", json={"prompt": "Write Java API", "model": "gemini-1.5-flash"})
    assert res.status_code == 200, res.text
    data = res.json()
    
    # Assert side-by-side coaching suggestion and rewrite
    assert data["original_prompt"] == "Write Java API"
    assert "Add the framework version" in data["suggestion"]
    assert "Spring Boot 3 REST API using Java 21" in data["optimized_prompt"]
    
    # Assert 5-dimension rubric score
    assert data["score_out_of_100"] == 82
    dims = data["dimensions"]
    assert dims["clarity"] == 17.0
    assert dims["specificity"] == 17.0
    assert dims["overall_score"] == 82
    
    # Assert 10.2.2 Token Optimizer efficiency metric
    tokens = data["token_optimizer"]
    assert tokens["current_tokens"] == 650
    assert tokens["optimized_tokens"] == 180
    assert tokens["savings_percent"] == 72
    assert tokens["savings_label"] == "72% cheaper"

def test_model_recommendation_signals(client):
    """Test 10.2.3 AI Model Recommendation triggers and savings percentages."""
    res = client.get("/prompt/model-recommendations")
    assert res.status_code == 200, res.text
    data = res.json()
    assert len(data) >= 2
    
    signals = {item["signal"]: item for item in data}
    assert "Task type: Summarization" in signals
    assert signals["Task type: Summarization"]["recommendation"] == "Switch to Gemini Flash"
    assert signals["Task type: Summarization"]["estimated_saving"] == "~70% cheaper"
    assert signals["Task type: Summarization"]["is_reversible"] is True
    
    assert "Current model: GPT-5 (general use)" in signals
    assert signals["Current model: GPT-5 (general use)"]["recommendation"] == "Switch to Gemini Flash"
    assert signals["Current model: GPT-5 (general use)"]["estimated_saving"] == "~40% cheaper"

def test_prompt_history_and_search(client):
    """Test 10.2.4 Prompt History full-text search, pinning, and saving."""
    res = client.get("/prompt/history?query=SAP")
    assert res.status_code == 200, res.text
    items = res.json()
    assert len(items) >= 1
    assert items[0]["title"] == "SAP Prompt Spec"
    assert items[0]["uses_count"] == 520
    assert items[0]["hours_saved"] == 1100.0
    
    # Test saving a new prompt to history
    save_res = client.post("/prompt/history", json={
        "title": "Custom Kubernetes Debugger",
        "prompt_text": "Analyze pod crash loop logs and pinpoint failing init containers.",
        "category": "DEBUGGING",
        "prompt_score": 89,
        "is_favorite": True
    })
    assert save_res.status_code == 200, save_res.text
    new_id = save_res.json()["id"]
    
    # Toggle favorite
    fav_res = client.put(f"/prompt/history/{new_id}/favorite")
    assert fav_res.status_code == 200, fav_res.text
    assert fav_res.json()["is_favorite"] is False

def test_prompt_marketplace_registry(client):
    """Test 10.2.5 Prompt Marketplace app-store style listing with ratings and usage counts."""
    res = client.get("/prompt/marketplace")
    assert res.status_code == 200, res.text
    items = res.json()
    assert len(items) >= 4
    
    top_item = items[0]  # sorted by usage count dynamically
    assert top_item["title"] == "SAP Prompt"
    assert top_item["star_display"] == "★★★★★"
    assert top_item["used_by_count"] == 520
    assert top_item["hours_saved"] == 1100.0
    assert "Used by 520 developers" in top_item["description"]
    
    # Publish a history item to marketplace
    pub_res = client.post("/prompt/marketplace/prompt_java_rest/publish")
    assert pub_res.status_code == 200, pub_res.text
    pub_data = pub_res.json()
    assert "Spring Boot REST API" in pub_data["title"]

def test_learning_coach_pattern_tips(client):
    """Test 10.2.6 AI Learning Coach targeted coaching tips based on observed prompting weaknesses."""
    res = client.get("/prompt/learning-coach")
    assert res.status_code == 200, res.text
    data = res.json()
    assert data["score_trajectory"] == [68, 72, 75, 78, 82]
    assert "specificity has improved" in data["current_pattern_summary"]
    
    tips_text = [t["tip"] for t in data["tips"]]
    assert "Use concrete examples." in tips_text
    assert "Mention the language or framework version." in tips_text
    assert "Specify the desired output format." in tips_text

def test_session_and_usage_summary(client):
    """Test 10.2.7 Session & Usage Summary telemetry for mid-day snapshot vs end-of-day summary."""
    res = client.get("/prompt/session-summary")
    assert res.status_code == 200, res.text
    data = res.json()
    snapshots = {s["period"]: s for s in data["snapshots"]}
    
    mid_day = snapshots["Live snapshot (mid-day)"]
    assert mid_day["prompts"] == 34
    assert mid_day["cost"] == "$1.32"
    assert mid_day["hours_saved"] == 2.3
    
    end_day = snapshots["End-of-day summary"]
    assert end_day["prompts"] == 43
    assert end_day["tokens"] == "8,300"
    assert end_day["cost"] == "₹1.80"
    assert end_day["hours_saved"] == 2.8
