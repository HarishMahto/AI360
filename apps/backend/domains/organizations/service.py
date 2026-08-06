"""
AI360 – Organizations Service
"""
import logging
from typing import List, Optional
from datetime import datetime, timezone
import uuid
from google.cloud import firestore
from core.firebase import Collections
from domains.organizations.schemas import OrganizationCreate, OrganizationResponse, DepartmentCreate, DepartmentResponse, AIProviderConfig

logger = logging.getLogger(__name__)

class OrganizationService:
    def __init__(self, db: firestore.Client):
        self.db = db

    def get_organization(self, org_id: str) -> Optional[OrganizationResponse]:
        doc = self.db.collection(Collections.ORGANIZATIONS).document(org_id).get()
        if not doc.exists:
            return None
        data = doc.to_dict()
        data["id"] = doc.id
        return OrganizationResponse(**data)

    def create_organization(self, org: OrganizationCreate) -> OrganizationResponse:
        org_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc).isoformat()
        
        data = org.dict()
        data["created_at"] = now
        data["updated_at"] = now
        
        self.db.collection(Collections.ORGANIZATIONS).document(org_id).set(data)
        
        data["id"] = org_id
        return OrganizationResponse(**data)
        
    def update_provider_config(self, org_id: str, config: AIProviderConfig):
        # In a real app, encrypt these keys before saving
        data = config.dict(exclude_none=True)
        if data:
            self.db.collection(Collections.ORGANIZATIONS).document(org_id).update({"api_keys": data})
        return {"status": "success"}

    def get_departments(self, org_id: str) -> List[DepartmentResponse]:
        docs = self.db.collection(Collections.DEPARTMENTS).where("organization_id", "==", org_id).stream()
        results = []
        for doc in docs:
            d = doc.to_dict()
            d["id"] = doc.id
            results.append(DepartmentResponse(**d))
        return results

    def create_department(self, org_id: str, dept: DepartmentCreate) -> DepartmentResponse:
        dept_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc).isoformat()
        
        data = dept.dict()
        data["organization_id"] = org_id
        data["created_at"] = now
        
        self.db.collection(Collections.DEPARTMENTS).document(dept_id).set(data)
        
        # Also create a budget entry
        if dept.monthly_budget_usd is not None:
            self.db.collection(Collections.BUDGETS).document(dept_id).set({
                "target_id": dept_id,
                "target_type": "department",
                "monthly_limit_usd": dept.monthly_budget_usd,
                "created_at": now
            })
            
        data["id"] = dept_id
        return DepartmentResponse(**data)
