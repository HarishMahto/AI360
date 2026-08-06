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
    """
    Test GET /reports/{report_type} invoked by api.downloadReport() in React client.
    The client requests this with axios `responseType: 'blob'`, so the endpoint must
    return real file bytes (not a JSON {download_url, expires_at} envelope).
    """
    res = client.get("/reports/chargeback_summary?format=pdf&period=30d")
    assert res.status_code == 200, res.text
    assert res.headers["content-type"].startswith("text/csv")
    assert "attachment" in res.headers.get("content-disposition", "")
    assert "chargeback_summary" in res.headers.get("content-disposition", "")
    # Requested format is kept as the filename extension even though real
    # PDF/Excel rendering is a follow-up and CSV bytes are served today.
    assert res.headers["content-disposition"].endswith('.pdf"')
    # Body must be genuine, non-empty CSV content (not a fabricated storage URL).
    body = res.text
    assert body.strip()
    assert "storage.googleapis.com" not in body


def test_list_reports_endpoint(client):
    """Test GET /reports (list) returns an empty list without crashing on a fresh org."""
    res = client.get("/reports", params={"scope": "manager"})
    assert res.status_code == 200, res.text
    assert isinstance(res.json(), list)


def test_generate_report_endpoint_returns_real_metadata(client):
    """Test POST /reports/generate persists metadata and no longer returns a fake bucket URL."""
    res = client.post("/reports/generate", json={"target_id": "org_123", "target_type": "executive", "format": "csv", "period": "30d"})
    assert res.status_code == 200, res.text
    data = res.json()
    assert "download_url" in data
    assert "storage.googleapis.com" not in data["download_url"]
    assert "expires_at" in data
