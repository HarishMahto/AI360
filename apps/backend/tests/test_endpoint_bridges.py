"""
AI360 – Automated Verification Suite for Full Stack Endpoint Bridges
Tests POST /chat/agent, GET /analytics/employee|team|department|organization, and GET /reports/{type}.
"""
import pytest

def test_chat_agent_endpoint(client):
    """Test POST /chat/agent for VS Code Copilot extension integration."""
    payload = {
        "messages": [{"role": "user", "content": "Refactor processData function"}],
        "model": "gemini-1.5-flash",
        "context": {
            "activeFile": "src/services/data.ts",
            "selectedText": "function processData(input: any) { return input; }"
        }
    }
    res = client.post("/chat/agent", json=payload)
    assert res.status_code == 200, res.text
    body = res.json()
    assert "data" in body
    data = body["data"]
    assert data["model"] == "gemini-1.5-flash"
    assert "estimatedCostUSD" in data
    assert "totalTokens" in data

def test_granular_analytics_endpoints(client):
    """Test granular analytics endpoints invoked by React TanStack Query dashboard hooks."""
    # Employee Analytics
    res_emp = client.get("/analytics/employee?period=30d")
    assert res_emp.status_code == 200, res_emp.text
    emp_data = res_emp.json().get("data", {})
    assert emp_data["requestsCount"] == 84
    assert emp_data["averagePromptScore"] == 88.5

    # Team Analytics
    res_team = client.get("/analytics/team?team_id=engineering")
    assert res_team.status_code == 200, res_team.text
    team_data = res_team.json().get("data", {})
    assert team_data["activeUsers"] == 142
    assert "usageData" in team_data
    assert "spendData" in team_data

    # Department Analytics
    res_dept = client.get("/analytics/department?department_id=Engineering")
    assert res_dept.status_code == 200, res_dept.text
    dept_data = res_dept.json().get("data", {})
    assert dept_data["department"] == "Engineering"
    assert len(dept_data["rankings"]) >= 5

    # Org Analytics
    res_org = client.get("/analytics/organization")
    assert res_org.status_code == 200, res_org.text
    org_data = res_org.json().get("data", {})
    assert org_data["orgAdoptionRate"] == 90.0

def test_download_report_type_endpoint(client):
    """Test GET /reports/{report_type} invoked by api.downloadReport() in React client."""
    res = client.get("/reports/chargeback_summary?format=pdf&period=30d")
    assert res.status_code == 200, res.text
    data = res.json()
    assert "download_url" in data
    assert "expires_at" in data
