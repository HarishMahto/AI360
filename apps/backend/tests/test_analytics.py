import pytest
from unittest.mock import MagicMock
from datetime import datetime, timezone
from domains.analytics.service import AnalyticsService

def test_manager_dashboard_fallback(mock_db):
    """
    Test that if no department is found, it uses the fallback logic gracefully.
    """
    # Setup mock
    mock_query = MagicMock()
    mock_query.stream.return_value = []
    
    mock_collection = MagicMock()
    mock_collection.where.return_value = mock_query
    
    mock_db.collection.return_value = mock_collection
    
    # Test
    service = AnalyticsService(mock_db)
    payload = service.get_manager_dashboard_payload("mgr_123")
    
    assert payload["today_spend_usd"] == 0
    assert payload["month_spend_usd"] == 0
    assert payload["team_adoption_score"] == 85
    assert len(payload["cost_trend"]) == 0
    
def test_executive_dashboard_aggregation(mock_db):
    """
    Test that the executive dashboard aggregates org records correctly.
    """
    mock_doc = MagicMock()
    mock_doc.to_dict.return_value = {
        "date": "2024-01-01",
        "totalCostUSD": 100.50
    }
    
    mock_query = MagicMock()
    mock_query.stream.return_value = [mock_doc, mock_doc] # two records
    
    mock_collection = MagicMock()
    mock_collection.where.return_value = mock_query
    
    mock_db.collection.return_value = mock_collection
    
    service = AnalyticsService(mock_db)
    payload = service.get_executive_dashboard_payload()
    
    # 2 records @ 100.50 each = 201.0
    assert payload["executive_kpis"]["total_spend"] == 201.0
    assert payload["roi_metrics"]["hours_saved"] == 30 # 2 records * 15
