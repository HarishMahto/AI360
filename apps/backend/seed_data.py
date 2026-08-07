import os
import sys
import random
from datetime import datetime, timedelta, timezone

# Add the apps/backend path so imports work correctly
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from core.firebase import get_firestore, Collections
from domains.analytics.service import AnalyticsService

def seed_data():
    db = get_firestore()
    if not db:
        print("Failed to initialize Firestore.")
        return

    print("Seeding Users and Departments...")
    
    # Departments
    departments = [
        {"id": "engineering_team", "name": "Engineering", "manager_email": "admin@acme.com", "departmentName": "Engineering"},
        {"id": "marketing_team", "name": "Marketing", "manager_email": "marketing@acme.com", "departmentName": "Marketing"},
        {"id": "sales_team", "name": "Sales", "manager_email": "sales@acme.com", "departmentName": "Sales"}
    ]
    for dept in departments:
        db.collection(Collections.DEPARTMENTS).document(dept["id"]).set(dept)
        
    # Users
    users = [
        {"userId": "user1", "email": "aarav@acme.com", "displayName": "Aarav Sharma", "departmentId": "engineering_team"},
        {"userId": "user2", "email": "sarah@acme.com", "displayName": "Sarah Jenkins", "departmentId": "marketing_team"},
        {"userId": "user3", "email": "priyanka@acme.com", "displayName": "Priyanka Patel", "departmentId": "sales_team"},
        {"userId": "admin_user", "email": "admin@acme.com", "displayName": "Admin User", "departmentId": "engineering_team"}
    ]
    for user in users:
        db.collection(Collections.USERS).document(user["userId"]).set(user)
        
    print("Seeding Usage Data...")
    
    categories = ["Code Generation", "Debugging", "Content Writing", "Data Analysis", "Chat"]
    models = ["gpt-4o", "gpt-4o-mini", "claude-3-sonnet", "gemini-1.5-pro"]
    
    # Generate data for the past 30 days
    now = datetime.now(timezone.utc)
    batch = db.batch()
    count = 0
    
    for i in range(30):
        target_date = now - timedelta(days=i)
        
        # Each day has 10-50 usage records
        num_records = random.randint(10, 50)
        for _ in range(num_records):
            user = random.choice(users)
            
            record_time = target_date.replace(
                hour=random.randint(0, 23),
                minute=random.randint(0, 59),
                second=random.randint(0, 59)
            )
            
            in_tokens = random.randint(100, 2000)
            out_tokens = random.randint(50, 1000)
            
            usage = {
                "userId": user["userId"],
                "organizationId": "acme_org",
                "departmentId": user["departmentId"],
                "timestamp": record_time.isoformat(),
                "inputTokens": in_tokens,
                "outputTokens": out_tokens,
                "totalTokens": in_tokens + out_tokens,
                "estimatedCostUSD": round(random.uniform(0.001, 0.05), 4),
                "promptScore": random.randint(60, 100),
                "latencyMs": random.randint(200, 2500),
                "category": random.choice(categories),
                "model": random.choice(models)
            }
            
            doc_ref = db.collection(Collections.USAGE).document()
            batch.set(doc_ref, usage)
            count += 1
            
            if count >= 400:
                batch.commit()
                batch = db.batch()
                count = 0

    if count > 0:
        batch.commit()
        
    print("Running Analytics Aggregation...")
    service = AnalyticsService(db)
    
    # Run aggregation for the past 30 days
    for i in range(30):
        target_date = now - timedelta(days=i)
        target_date_str = target_date.strftime("%Y-%m-%d")
        print(f"Aggregating for {target_date_str}...")
        service.run_daily_aggregation(target_date_str)
        
    print("Seed complete.")

if __name__ == "__main__":
    seed_data()
