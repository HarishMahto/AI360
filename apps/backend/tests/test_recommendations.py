import pytest
from unittest.mock import MagicMock
from domains.recommendations.service import RecommendationEngine
from domains.recommendations.schemas import RecommendationType

def test_better_prompt_recommendation(mock_db):
    """
    Test that an average score < 60 triggers a BETTER_PROMPT recommendation.
    """
    mock_doc = MagicMock()
    mock_doc.to_dict.return_value = {
        "promptScore": 50,
        "category": "CODING",
        "model": "gpt-4o-mini"
    }
    
    mock_query = MagicMock()
    mock_query.stream.return_value = [mock_doc, mock_doc] # Avg score 50
    
    mock_collection = MagicMock()
    mock_collection.where.return_value.where.return_value = mock_query
    mock_db.collection.return_value = mock_collection
    
    engine = RecommendationEngine(mock_db)
    recs = engine.generate_employee_recommendations("user_123")
    
    assert len(recs) >= 1
    assert any(r.type == RecommendationType.BETTER_PROMPT for r in recs)

def test_better_model_recommendation(mock_db):
    """
    Test that using expensive models for simple tasks triggers BETTER_MODEL recommendation.
    """
    mock_doc = MagicMock()
    mock_doc.to_dict.return_value = {
        "promptScore": 90,
        "category": "SUMMARIZATION",
        "model": "gpt-4o"
    }
    
    mock_query = MagicMock()
    # Mock > 5 occurrences to trigger the rule
    mock_query.stream.return_value = [mock_doc] * 6 
    
    mock_collection = MagicMock()
    mock_collection.where.return_value.where.return_value = mock_query
    mock_db.collection.return_value = mock_collection
    
    engine = RecommendationEngine(mock_db)
    recs = engine.generate_employee_recommendations("user_123")
    
    assert len(recs) >= 1
    assert any(r.type == RecommendationType.BETTER_MODEL for r in recs)
    
    # Check savings calculation (6 tasks * 0.01 * 30 = 1.80)
    model_rec = next(r for r in recs if r.type == RecommendationType.BETTER_MODEL)
    assert model_rec.estimated_savings_usd == 1.80
