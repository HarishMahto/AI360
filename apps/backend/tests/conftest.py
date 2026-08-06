import pytest
from fastapi.testclient import TestClient
from unittest.mock import MagicMock
import os

# Set testing environment before importing app
os.environ["ENVIRONMENT"] = "testing"

from main import app
from core.firebase import get_firestore
from core.rbac import get_current_user, CurrentUser, UserRole

@pytest.fixture
def mock_db():
    return MagicMock()

@pytest.fixture
def mock_user():
    return CurrentUser(
        user_id="test_user_123",
        email="test@acme.com",
        role=UserRole.ADMIN,
        organization_id="org_123",
        department_id="dept_123"
    )


@pytest.fixture
def client(mock_db, mock_user):
    # Override dependencies
    app.dependency_overrides[get_firestore] = lambda: mock_db
    app.dependency_overrides[get_current_user] = lambda: mock_user
    
    with TestClient(app) as c:
        yield c
    
    # Clean up overrides
    app.dependency_overrides.clear()
