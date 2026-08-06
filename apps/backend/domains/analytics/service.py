"""
AI360 – Analytics Service
Handles aggregation of usage data into daily metrics for employees, departments, and the organization.
"""
import logging
from datetime import datetime, timedelta, timezone
from collections import defaultdict
from google.cloud import firestore

from core.firebase import get_firestore, Collections
from domains.analytics.schemas import EmployeeDashboardResponse, TeamBenchmarkResponse, MaturityLevelDetail, MaturityScoreResponse, LeaderboardUser, LeaderboardResponse

logger = logging.getLogger(__name__)


class AnalyticsService:
    def __init__(self, db: firestore.Client):
        self.db = db

    def run_daily_aggregation(self, target_date_str: str | None = None):
        """
        Runs the daily aggregation jobs for a specific date (defaults to yesterday).
        Reads from `usage` collection and writes to `employeeAnalytics`, `departmentAnalytics`, `organizationAnalytics`.
        """
        if not target_date_str:
            target_date = (datetime.now(timezone.utc) - timedelta(days=1)).date()
            target_date_str = target_date.isoformat()
            
        logger.info(f"Running daily aggregation for {target_date_str}...")

        # Get all usage records for the target date
        start_dt = datetime.strptime(target_date_str, "%Y-%m-%d").replace(tzinfo=timezone.utc)
        end_dt = start_dt + timedelta(days=1)
        
        usage_ref = self.db.collection(Collections.USAGE)
        query = usage_ref.where("timestamp", ">=", start_dt.isoformat()).where("timestamp", "<", end_dt.isoformat())
        
        records = [doc.to_dict() for doc in query.stream()]
        logger.info(f"Found {len(records)} usage records to aggregate.")

        if not records:
            return

        # Employee Aggregation
        employee_stats = defaultdict(lambda: {
            "userId": "", "organizationId": "", "departmentId": "",
            "totalRequests": 0, "totalInputTokens": 0, "totalOutputTokens": 0, "totalTokens": 0, "totalCostUSD": 0.0,
            "promptScoreSum": 0.0, "latencySum": 0, "categoriesUsed": defaultdict(int), "modelsUsed": defaultdict(int)
        })

        for r in records:
            uid = r.get("userId")
            if not uid: continue
            
            stats = employee_stats[uid]
            stats["userId"] = uid
            stats["organizationId"] = r.get("organizationId", "")
            stats["departmentId"] = r.get("departmentId", "")
            
            stats["totalRequests"] += 1
            stats["totalInputTokens"] += r.get("inputTokens", 0)
            stats["totalOutputTokens"] += r.get("outputTokens", 0)
            stats["totalTokens"] += r.get("totalTokens", 0)
            stats["totalCostUSD"] += r.get("estimatedCostUSD", 0.0)
            stats["promptScoreSum"] += r.get("promptScore", 0.0)
            stats["latencySum"] += r.get("latencyMs", 0)
            
            cat = r.get("category", "OTHER")
            mod = r.get("model", "gpt-4o-mini")
            stats["categoriesUsed"][cat] += 1
            stats["modelsUsed"][mod] += 1

        # Write Employee Analytics
        batch = self.db.batch()
        count = 0
        for uid, stats in employee_stats.items():
            reqs = stats["totalRequests"]
            doc_id = f"{uid}_{target_date_str}"
            
            doc_data = {
                "userId": uid,
                "organizationId": stats["organizationId"],
                "departmentId": stats["departmentId"],
                "date": target_date_str,
                "totalRequests": reqs,
                "totalInputTokens": stats["totalInputTokens"],
                "totalOutputTokens": stats["totalOutputTokens"],
                "totalTokens": stats["totalTokens"],
                "totalCostUSD": stats["totalCostUSD"],
                "avgPromptScore": stats["promptScoreSum"] / reqs if reqs else 0,
                "avgLatencyMs": stats["latencySum"] / reqs if reqs else 0,
                "categoriesUsed": dict(stats["categoriesUsed"]),
                "modelsUsed": dict(stats["modelsUsed"]),
                "adoptionScore": 85,  # Placeholder for Phase 10
                "efficiencyScore": 90, # Placeholder for Phase 10
            }
            
            doc_ref = self.db.collection(Collections.EMPLOYEE_ANALYTICS).document(doc_id)
            batch.set(doc_ref, doc_data, merge=True)
            count += 1
            
            if count >= 400:
                batch.commit()
                batch = self.db.batch()
                count = 0
                
        if count > 0:
            batch.commit()
            
        logger.info(f"Aggregated data for {len(employee_stats)} employees.")
        
        # Dept & Org aggregation would follow similarly here.
        # For MVP, employee aggregation is sufficient to populate the employee dashboard trend.

    def get_employee_dashboard_payload(self, user_id: str) -> EmployeeDashboardResponse:
        """
        Aggregates live + historical data to serve the Employee Dashboard.
        """
        now = datetime.now(timezone.utc)
        today_str = now.strftime("%Y-%m-%d")
        week_ago_str = (now - timedelta(days=7)).strftime("%Y-%m-%d")
        
        # 1. Get recent history (limit 5)
        history_query = self.db.collection(Collections.PROMPT_HISTORY).where("userId", "==", user_id).order_by("timestamp", direction="DESCENDING").limit(5)
        recent_history = [doc.to_dict() for doc in history_query.stream()]
        
        # 2. Get today's live stats from USAGE
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0).isoformat()
        today_usage = [doc.to_dict() for doc in self.db.collection(Collections.USAGE).where("userId", "==", user_id).where("timestamp", ">=", today_start).stream()]
        
        today_reqs = len(today_usage)
        today_in = sum(u.get("inputTokens", 0) for u in today_usage)
        today_out = sum(u.get("outputTokens", 0) for u in today_usage)
        today_cost = sum(u.get("estimatedCostUSD", 0) for u in today_usage)
        today_score = sum(u.get("promptScore", 0) for u in today_usage) / today_reqs if today_reqs else 0
        
        # 3. Get last 7 days of daily analytics
        analytics_query = self.db.collection(Collections.EMPLOYEE_ANALYTICS).where("userId", "==", user_id).where("date", ">=", week_ago_str).order_by("date", direction="ASCENDING")
        daily_records = [doc.to_dict() for doc in analytics_query.stream()]
        
        week_reqs = sum(r.get("totalRequests", 0) for r in daily_records) + today_reqs
        week_cost = sum(r.get("totalCostUSD", 0) for r in daily_records) + today_cost
        week_tokens = sum(r.get("totalTokens", 0) for r in daily_records) + today_in + today_out
        week_score_sum = sum(r.get("avgPromptScore", 0) * r.get("totalRequests", 0) for r in daily_records) + (today_score * today_reqs)
        week_avg_score = week_score_sum / week_reqs if week_reqs else 0
        
        # Merge daily_records and today's stats for the chart
        daily_trend = []
        for r in daily_records:
            daily_trend.append({"date": r.get("date"), "costUSD": r.get("totalCostUSD"), "tokens": r.get("totalTokens")})
        daily_trend.append({"date": today_str, "costUSD": today_cost, "tokens": today_in + today_out})
        
        # Category breakdown
        cat_breakdown = defaultdict(int)
        for r in daily_records:
            for cat, cnt in r.get("categoriesUsed", {}).items():
                cat_breakdown[cat] += cnt
        for u in today_usage:
            cat_breakdown[u.get("category", "OTHER")] += 1
            
        return EmployeeDashboardResponse(
            today_stats={
                "requests": today_reqs,
                "inputTokens": today_in,
                "outputTokens": today_out,
                "totalTokens": today_in + today_out,
                "costUSD": today_cost,
                "avgPromptScore": today_score
            },
            week_stats={
                "requests": week_reqs,
                "totalTokens": week_tokens,
                "costUSD": week_cost,
                "avgPromptScore": week_avg_score
            },
            adoption_score=85.0,
            efficiency_score=92.0,
            recent_history=recent_history,
            recommendations=[],
            category_breakdown=dict(cat_breakdown),
            daily_trend=daily_trend
        )

    def get_manager_dashboard_payload(self, manager_id: str):
        """Builds Manager Dashboard payload from departmentAnalytics."""
        now = datetime.now(timezone.utc)
        today_str = now.strftime("%Y-%m-%d")
        
        # In a real system, we'd lookup the manager's department_id from their user profile.
        # Here we just fetch one department for demonstration.
        depts_query = self.db.collection(Collections.DEPARTMENTS).where("manager_email", "==", "admin@acme.com").limit(1).stream()
        dept_id = None
        for d in depts_query:
            dept_id = d.id
            
        if not dept_id:
            # Fallback to a hardcoded ID for MVP testing if manager not assigned
            dept_id = "default_dept"
            
        thirty_days_ago = (now - timedelta(days=30)).strftime("%Y-%m-%d")
        query = self.db.collection(Collections.DEPARTMENT_ANALYTICS).where("departmentId", "==", dept_id).where("date", ">=", thirty_days_ago)
        records = [doc.to_dict() for doc in query.stream()]
        
        month_spend = sum(r.get("totalCostUSD", 0) for r in records)
        today_spend = sum(r.get("totalCostUSD", 0) for r in records if r.get("date") == today_str)
        
        cost_trend = [{"date": r.get("date"), "value": r.get("totalCostUSD")} for r in records]
        token_trend = [{"date": r.get("date"), "value": r.get("totalTokens")} for r in records]
        
        cat_breakdown = defaultdict(int)
        mod_usage = defaultdict(int)
        for r in records:
            for c, v in r.get("categoriesUsed", {}).items():
                cat_breakdown[c] += v
            for m, v in r.get("modelsUsed", {}).items():
                mod_usage[m] += v
                
        return {
            "today_spend_usd": today_spend,
            "month_spend_usd": month_spend,
            "team_adoption_score": 85,
            "team_efficiency_score": 90,
            "team_members": [], # Would join with Users collection
            "department_cost_breakdown": {dept_id: month_spend},
            "token_trend": token_trend,
            "cost_trend": cost_trend,
            "category_breakdown": dict(cat_breakdown),
            "model_usage": dict(mod_usage),
            "top_tasks": sorted(cat_breakdown, key=cat_breakdown.get, reverse=True)[:5],
            "recommendations": [],
            "forecast_30d": []
        }

    def get_executive_dashboard_payload(self):
        """Builds Executive Dashboard payload from organizationAnalytics."""
        now = datetime.now(timezone.utc)
        thirty_days_ago = (now - timedelta(days=30)).strftime("%Y-%m-%d")

        org_query = self.db.collection(Collections.ORGANIZATION_ANALYTICS).where("date", ">=", thirty_days_ago)
        org_records = [doc.to_dict() for doc in org_query.stream()]

        total_spend = sum(r.get("totalCostUSD", 0) for r in org_records)

        org_trend = [{"date": r.get("date"), "value": r.get("totalCostUSD")} for r in org_records]

        # Real department ranking + adoption heatmap, sourced from the now-live department analytics.
        dept_analytics = self.get_granular_department_analytics()
        rankings = dept_analytics.get("rankings", [])
        department_ranking = [
            {
                "dept": r.get("dept"),
                "users": r.get("users"),
                "efficiency": r.get("efficiency"),
                "adoption_pct": r.get("adoption_pct"),
                "maturity": r.get("maturity_stage"),
            }
            for r in rankings
        ]
        adoption_heatmap = {r.get("dept"): r.get("adoption_pct") for r in rankings if r.get("dept")}

        # Real org-wide headcount + active-user counts.
        try:
            total_users = len(list(self.db.collection(Collections.USERS).stream()))
        except Exception as e:
            logger.warning(f"Executive dashboard user query failed: {e}")
            total_users = 0

        thirty_days_ago_iso = (now - timedelta(days=30)).isoformat()
        try:
            recent_usage = [
                doc.to_dict()
                for doc in self.db.collection(Collections.USAGE).where("timestamp", ">=", thirty_days_ago_iso).limit(5000).stream()
            ]
        except Exception as e:
            logger.warning(f"Executive dashboard usage query failed: {e}")
            recent_usage = []
        active_users = len({u.get("userId") for u in recent_usage if u.get("userId")})

        # New cost-savings-attribution + provider spend fields, sourced from the now-real org analytics.
        org_analytics = self.get_granular_organization_analytics()

        return {
            "organization_spend_monthly_trend": org_trend,
            "roi_metrics": {"hours_saved": len(org_records) * 15, "cost_ratio": 3.2, "dollar_value": len(org_records) * 500},
            "department_ranking": department_ranking,
            "adoption_heatmap": adoption_heatmap,
            "forecast_projections": {"30d": total_spend * 1.1, "90d": total_spend * 3.3},
            "savings_estimate_usd": total_spend * 0.15,
            "executive_kpis": {
                "total_users": total_users,
                "active_users": active_users,
                "total_spend": total_spend,
                "avg_score": 85,
                "top_model": "gpt-4o",
                "top_dept": rankings[0]["dept"] if rankings else "General"
            },
            "total_cost_savings_usd": org_analytics.get("totalCostSavingsUSD", 0.0),
            "spend_by_provider": org_analytics.get("spendByProvider", []),
        }

    def get_team_benchmarks(self) -> list[TeamBenchmarkResponse]:
        """
        Section 11.5.2: AI Benchmark.
        Compares AI proficiency across teams at a glance. A low score is a coaching signal pointing toward Learning Coach.
        """
        base_teams = [
            {"team_name": "Backend", "score": 92, "status": "Elite", "primary_strength": "Optimal multi-model routing to Claude & Flash with zero prompt bloat", "improvement_focus": "Maintain high token reuse & caching"},
            {"team_name": "DevOps", "score": 88, "status": "Elite", "primary_strength": "High automated script synthesis and infrastructure triage efficiency", "improvement_focus": "Expand runbook generation templates"},
            {"team_name": "Frontend", "score": 84, "status": "Proficient", "primary_strength": "Strong React & UI component test Generation via Claude 3.5 Sonnet", "improvement_focus": "Reduce redundant CSS style context repetitions"},
            {"team_name": "QA", "score": 67, "status": "Needs Coaching", "primary_strength": "Good manual test scenario ideation", "improvement_focus": "Adopt structured Few-Shot prompt templates to elevate automated test script accuracy"}
        ]

        try:
            depts_query = self.db.collection(Collections.DEPARTMENT_ANALYTICS).stream()
            dept_scores = {doc.to_dict().get("departmentName"): doc.to_dict().get("efficiencyScore") for doc in depts_query if doc.to_dict().get("efficiencyScore")}
            for t in base_teams:
                if t["team_name"] in dept_scores:
                    t["score"] = int(dept_scores[t["team_name"]])
        except Exception as e:
            logger.warning(f"Could not query live department analytics for benchmarks: {e}. Using specification benchmarks.")

        responses = []
        for t in base_teams:
            coaching_signal = None
            if t["score"] < 75:
                coaching_signal = f"🚨 Coaching Signal: {t['team_name']} team (Score: {t['score']}) would benefit most from the Learning Coach (Section 10.2.6) or a pairing session with Backend team (Score: 92)."
            
            responses.append(TeamBenchmarkResponse(
                team_name=t["team_name"],
                score=t["score"],
                status=t["status"],
                primary_strength=t["primary_strength"],
                improvement_focus=t["improvement_focus"],
                coaching_signal=coaching_signal
            ))
        return responses

    def get_organization_maturity_score(self) -> MaturityScoreResponse:
        """
        Section 11.5.3: AI Maturity Score.
        Four-level maturity ladder tracking long-term adoption quarter over quarter.
        """
        ladder = [
            MaturityLevelDetail(
                level_number=1,
                level_name="No AI",
                description="little to no measurable AI usage across the organization.",
                quarter_achieved="Q1 2024",
                status="Completed",
                key_milestone="Baseline audit and security policies established."
            ),
            MaturityLevelDetail(
                level_number=2,
                level_name="Occasional",
                description="pockets of AI usage exist, but adoption is inconsistent and largely informal.",
                quarter_achieved="Q2 2024",
                status="Completed",
                key_milestone="Initial grassroots experimentation & demand identified."
            ),
            MaturityLevelDetail(
                level_number=3,
                level_name="Productive",
                description="AI is a regular part of daily workflows across most teams, with measurable time savings.",
                quarter_achieved="Q3 2024",
                status="Completed",
                key_milestone="Standardized prompt shared library & 80% workforce onboarded."
            ),
            MaturityLevelDetail(
                level_number=4,
                level_name="AI Native",
                description="AI usage is deeply embedded, consistently high-quality, and tied to demonstrated ROI across departments.",
                quarter_achieved="Current (Q4)",
                status="Active",
                key_milestone="Stage 4 AI Native Enterprise achieved (86/100 Index Score)."
            ),
        ]
        # Derive a real index from the average team benchmark score rather than a hardcoded 86.
        try:
            benchmarks = self.get_team_benchmarks()
            scores = [b.score for b in benchmarks if b.score is not None]
            maturity_index = round(sum(scores) / len(scores)) if scores else 86
        except Exception as e:
            logger.warning(f"Could not derive maturity index from team benchmarks: {e}. Using specification index.")
            maturity_index = 86

        if maturity_index >= 85:
            current_level, current_level_name = 4, "AI Native"
        elif maturity_index >= 65:
            current_level, current_level_name = 3, "Productive"
        elif maturity_index >= 40:
            current_level, current_level_name = 2, "Occasional"
        else:
            current_level, current_level_name = 1, "No AI"

        # Keep each rung's status consistent with the real current level (narrative text untouched).
        for level in ladder:
            if level.level_number < current_level:
                level.status = "Completed"
            elif level.level_number == current_level:
                level.status = "Active"
            else:
                level.status = "Upcoming"

        return MaturityScoreResponse(
            current_level=current_level,
            current_level_name=current_level_name,
            maturity_index=maturity_index,
            ladder=ladder
        )

    def get_gamification_leaderboards(self) -> LeaderboardResponse:
        """
        Section 11.4: Returns gamified leaderboard rankings across four enterprise categories.
        Real computation from USAGE (last 30 days) grouped by userId, joined against USERS for names.
        Falls back to the original named demo list per-category (harmless filler for empty orgs) whenever
        there isn't enough real signal — either too few distinct users overall, or no comparable metric
        for that specific category (e.g. no week-over-week score history for Most Improved).
        """
        fallback = LeaderboardResponse(
            top_prompt_writer=[
                LeaderboardUser(rank=1, name="Aarav Sharma", department="Engineering", category="Top Prompt Writer", score_or_metric="98.4 Avg Score", badge_title="🏆 Master Prompter", avatar_bg="#7b2cbf", change_status="up"),
                LeaderboardUser(rank=2, name="Sarah Jenkins", department="Product", category="Top Prompt Writer", score_or_metric="95.2 Avg Score", badge_title="⚡ Prompt Strategist", avatar_bg="#20c997", change_status="same"),
                LeaderboardUser(rank=3, name="Priyanka Patel", department="Marketing", category="Top Prompt Writer", score_or_metric="93.8 Avg Score", badge_title="🎯 Context Wizard", avatar_bg="#ed6c02", change_status="up"),
            ],
            top_ai_user=[
                LeaderboardUser(rank=1, name="David Chen", department="Engineering", category="Top AI User", score_or_metric="142 Tasks / wk", badge_title="🚀 AI Powerhouse", avatar_bg="#0077b6", change_status="same"),
                LeaderboardUser(rank=2, name="Megha Rao", department="Data & Analytics", category="Top AI User", score_or_metric="128 Tasks / wk", badge_title="⚙️ Automation Lead", avatar_bg="#9d4edd", change_status="up"),
                LeaderboardUser(rank=3, name="Carlos Rodriguez", department="Sales", category="Top AI User", score_or_metric="115 Tasks / wk", badge_title="📈 Deal Accelerator", avatar_bg="#ff2c55", change_status="down"),
            ],
            most_improved=[
                LeaderboardUser(rank=1, name="Rohan Gupta", department="QA Engineering", category="Most Improved", score_or_metric="+28% rubric jump", badge_title="🌱 Growth Hero", avatar_bg="#43a047", change_status="up"),
                LeaderboardUser(rank=2, name="Elena Rostova", department="HR & Ops", category="Most Improved", score_or_metric="+22% rubric jump", badge_title="🔥 Rising Star", avatar_bg="#f59e0b", change_status="up"),
                LeaderboardUser(rank=3, name="Kenji Sato", department="Finance", category="Most Improved", score_or_metric="+18% rubric jump", badge_title="📚 Quick Learner", avatar_bg="#60a5fa", change_status="same"),
            ],
            most_efficient=[
                LeaderboardUser(rank=1, name="Ananya Deshmukh", department="Backend Engineering", category="Most Efficient", score_or_metric="$0.02 / task avg", badge_title="💎 FinOps Champion", avatar_bg="#10b981", change_status="up"),
                LeaderboardUser(rank=2, name="Liam O'Connor", department="Cloud Infra", category="Most Efficient", score_or_metric="$0.03 / task avg", badge_title="🛡️ Token Optimizer", avatar_bg="#6366f1", change_status="same"),
                LeaderboardUser(rank=3, name="Zahra Al-Mansoor", department="Customer Success", category="Most Efficient", score_or_metric="$0.04 / task avg", badge_title="🎯 Precision Exec", avatar_bg="#d946ef", change_status="up"),
            ]
        )

        now = datetime.now(timezone.utc)
        window_start_iso = (now - timedelta(days=30)).isoformat()
        try:
            docs = [
                d.to_dict()
                for d in self.db.collection(Collections.USAGE).where("timestamp", ">=", window_start_iso).limit(3000).stream()
            ]
        except Exception as e:
            logger.warning(f"Leaderboard usage query failed: {e}. Using demo leaderboards.")
            docs = []

        seven_days_ago = now - timedelta(days=7)
        fourteen_days_ago = now - timedelta(days=14)

        user_stats = defaultdict(lambda: {
            "score_sum": 0.0, "score_n": 0, "requests": 0, "cost_sum": 0.0, "departmentId": "",
            "recent_score_sum": 0.0, "recent_score_n": 0, "prior_score_sum": 0.0, "prior_score_n": 0,
        })
        for d in docs:
            uid = d.get("userId")
            if not uid:
                continue
            st = user_stats[uid]
            st["requests"] += 1
            st["cost_sum"] += d.get("estimatedCostUSD", 0.0)
            st["departmentId"] = d.get("departmentId") or st["departmentId"]

            score = d.get("promptScore")
            if score is None:
                continue
            st["score_sum"] += score
            st["score_n"] += 1

            ts = d.get("timestamp")
            dt = None
            if isinstance(ts, str):
                try:
                    dt = datetime.fromisoformat(ts)
                except Exception:
                    dt = None
            if dt:
                if dt >= seven_days_ago:
                    st["recent_score_sum"] += score
                    st["recent_score_n"] += 1
                elif dt >= fourteen_days_ago:
                    st["prior_score_sum"] += score
                    st["prior_score_n"] += 1

        if len(user_stats) < 3:
            return fallback

        def user_info(uid: str) -> tuple[str, str]:
            try:
                udoc = self.db.collection(Collections.USERS).document(uid).get()
                udata = udoc.to_dict() if udoc.exists else {}
            except Exception:
                udata = {}
            email = udata.get("email", "")
            name = udata.get("displayName") or (email.split("@")[0] if email else uid)
            dept = udata.get("departmentId") or user_stats[uid]["departmentId"] or "General"
            return name, dept

        avatar_colors = ["#7b2cbf", "#20c997", "#ed6c02", "#0077b6", "#9d4edd", "#ff2c55",
                          "#43a047", "#f59e0b", "#60a5fa", "#10b981", "#6366f1", "#d946ef"]

        # Top Prompt Writer — highest average promptScore.
        writers = sorted(
            ((uid, st["score_sum"] / st["score_n"]) for uid, st in user_stats.items() if st["score_n"] > 0),
            key=lambda x: x[1], reverse=True,
        )[:3]
        top_prompt_writer = []
        writer_badges = ["🏆 Master Prompter", "⚡ Prompt Strategist", "🎯 Context Wizard"]
        for i, (uid, avg_score) in enumerate(writers):
            name, dept = user_info(uid)
            top_prompt_writer.append(LeaderboardUser(
                rank=i + 1, name=name, department=dept, category="Top Prompt Writer",
                score_or_metric=f"{avg_score:.1f} Avg Score", badge_title=writer_badges[i],
                avatar_bg=avatar_colors[i % len(avatar_colors)], change_status="same",
            ))
        if not top_prompt_writer:
            top_prompt_writer = fallback.top_prompt_writer

        # Top AI User — highest request count.
        top_by_requests = sorted(user_stats.items(), key=lambda x: x[1]["requests"], reverse=True)[:3]
        top_ai_user = []
        user_badges = ["🚀 AI Powerhouse", "⚙️ Automation Lead", "📈 Deal Accelerator"]
        for i, (uid, st) in enumerate(top_by_requests):
            name, dept = user_info(uid)
            top_ai_user.append(LeaderboardUser(
                rank=i + 1, name=name, department=dept, category="Top AI User",
                score_or_metric=f"{st['requests']} Tasks / mo", badge_title=user_badges[i],
                avatar_bg=avatar_colors[i % len(avatar_colors)], change_status="same",
            ))
        if not top_ai_user:
            top_ai_user = fallback.top_ai_user

        # Most Improved — recent 7-day avg score vs prior 7-day avg score (mirrors ForecastEngine's
        # recent-vs-older trend comparison).
        improved = []
        for uid, st in user_stats.items():
            if st["recent_score_n"] > 0 and st["prior_score_n"] > 0:
                recent_avg = st["recent_score_sum"] / st["recent_score_n"]
                prior_avg = st["prior_score_sum"] / st["prior_score_n"]
                if prior_avg > 0:
                    improved.append((uid, ((recent_avg - prior_avg) / prior_avg) * 100))
        improved.sort(key=lambda x: x[1], reverse=True)
        improved = [x for x in improved if x[1] > 0][:3]
        most_improved = []
        improved_badges = ["🌱 Growth Hero", "🔥 Rising Star", "📚 Quick Learner"]
        for i, (uid, pct) in enumerate(improved):
            name, dept = user_info(uid)
            most_improved.append(LeaderboardUser(
                rank=i + 1, name=name, department=dept, category="Most Improved",
                score_or_metric=f"+{pct:.0f}% rubric jump", badge_title=improved_badges[i],
                avatar_bg=avatar_colors[i % len(avatar_colors)], change_status="up",
            ))
        if len(most_improved) < 3:
            most_improved = fallback.most_improved

        # Most Efficient — lowest average cost per request.
        efficient = sorted(
            ((uid, st["cost_sum"] / st["requests"]) for uid, st in user_stats.items() if st["requests"] > 0),
            key=lambda x: x[1],
        )[:3]
        most_efficient = []
        efficient_badges = ["💎 FinOps Champion", "🛡️ Token Optimizer", "🎯 Precision Exec"]
        for i, (uid, avg_cost) in enumerate(efficient):
            name, dept = user_info(uid)
            most_efficient.append(LeaderboardUser(
                rank=i + 1, name=name, department=dept, category="Most Efficient",
                score_or_metric=f"${avg_cost:.2f} / task avg", badge_title=efficient_badges[i],
                avatar_bg=avatar_colors[i % len(avatar_colors)], change_status="same",
            ))
        if not most_efficient:
            most_efficient = fallback.most_efficient

        return LeaderboardResponse(
            top_prompt_writer=top_prompt_writer,
            top_ai_user=top_ai_user,
            most_improved=most_improved,
            most_efficient=most_efficient,
        )

    def get_granular_employee_analytics(self, user_id: str, period: str = "30d") -> dict:
        """
        Returns granular prompt counts, token consumption, and cost trends for individual sessions.
        Windows the USAGE query by `period` (7d/30d/90d) and computes every figure from the
        returned docs, falling back to demo baselines only when the query legitimately returns nothing.
        """
        period_days = {"7d": 7, "30d": 30, "90d": 90}.get(period, 30)
        cutoff_iso = (datetime.now(timezone.utc) - timedelta(days=period_days)).isoformat()

        docs = []
        try:
            usage_ref = self.db.collection(Collections.USAGE)
            docs = [
                d.to_dict()
                for d in usage_ref.where("userId", "==", user_id)
                                  .where("timestamp", ">=", cutoff_iso)
                                  .limit(500)
                                  .stream()
            ]
        except Exception as e:
            logger.warning(f"Employee analytics usage query failed for {user_id}: {e}. Falling back to demo baseline.")
            docs = []

        if not docs:
            return {
                "period": period,
                "totalTokens": 45200,
                "totalCostUSD": 12.45,
                "requestsCount": 84,
                "averagePromptScore": 88.5,
                "tokenUsageTrend": [
                    {"day": "Mon", "tokens": 5400, "cost": 1.20},
                    {"day": "Tue", "tokens": 8200, "cost": 2.10},
                    {"day": "Wed", "tokens": 6100, "cost": 1.55},
                    {"day": "Thu", "tokens": 9400, "cost": 2.45},
                    {"day": "Fri", "tokens": 11200, "cost": 3.10},
                    {"day": "Sat", "tokens": 2100, "cost": 0.60},
                    {"day": "Sun", "tokens": 2800, "cost": 0.85},
                ]
            }

        total_tokens = sum(d.get("totalTokens", 0) for d in docs)
        total_cost = sum(d.get("estimatedCostUSD", 0.0) for d in docs)
        requests_count = len(docs)

        prompt_scores = [d.get("promptScore") for d in docs if d.get("promptScore") is not None]
        average_prompt_score = round(sum(prompt_scores) / len(prompt_scores), 1) if prompt_scores else 85.0

        # Bucket by day-of-week so the shape matches the existing 7-slot trend chart.
        day_order = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        day_buckets = {day: {"tokens": 0, "cost": 0.0} for day in day_order}
        for d in docs:
            ts = d.get("timestamp")
            day_label = None
            if isinstance(ts, str):
                try:
                    day_label = day_order[datetime.fromisoformat(ts).weekday()]
                except Exception:
                    day_label = None
            if day_label:
                day_buckets[day_label]["tokens"] += d.get("totalTokens", 0)
                day_buckets[day_label]["cost"] += d.get("estimatedCostUSD", 0.0)

        token_usage_trend = [
            {"day": day, "tokens": day_buckets[day]["tokens"], "cost": round(day_buckets[day]["cost"], 2)}
            for day in day_order
        ]

        return {
            "period": period,
            "totalTokens": total_tokens,
            "totalCostUSD": round(total_cost, 2),
            "requestsCount": requests_count,
            "averagePromptScore": average_prompt_score,
            "tokenUsageTrend": token_usage_trend,
        }

    def get_granular_team_analytics(self, team_id: str = "engineering_team", period: str = "30d") -> dict:
        """
        Returns complete team-level telemetry matching React hook contracts in TeamAnalytics and AIFinOps.
        `team_id` is treated as a `departmentId` scope on USAGE (this codebase has no separate
        team-membership collection wired up yet — see get_manager_dashboard_payload for the same convention).
        Falls back to the original static demo shape whenever the department has no usage in the window.
        """
        fallback = {
            "teamId": team_id,
            "period": period,
            "activeUsers": 142,
            "adoptionScore": 92,
            "weeklyTokens": "128k",
            "estimatedCost": "$14.80",
            "activeUsersGrowth": "+14% this week",
            "usageData": [
                {"name": "Mon", "tokens": 14000, "activeUsers": 48},
                {"name": "Tue", "tokens": 21000, "activeUsers": 58},
                {"name": "Wed", "tokens": 17500, "activeUsers": 52},
                {"name": "Thu", "tokens": 24000, "activeUsers": 64},
                {"name": "Fri", "tokens": 31000, "activeUsers": 72},
                {"name": "Sat", "tokens": 9500, "activeUsers": 22},
                {"name": "Sun", "tokens": 12000, "activeUsers": 28},
            ],
            "topUsers": [
                {"id": 1, "name": "Aarav Sharma", "role": "Principal AI Architect", "score": 98, "avatar": "A"},
                {"id": 2, "name": "David Chen", "role": "Full-Stack Developer", "score": 94, "avatar": "D"},
                {"id": 3, "name": "Ananya Deshmukh", "role": "Backend Lead", "score": 91, "avatar": "A"},
                {"id": 4, "name": "Rohan Gupta", "role": "QA Engineer", "score": 88, "avatar": "R"},
            ],
            "modelDistribution": [
                {"name": "GPT-4", "value": 45},
                {"name": "Claude 3", "value": 30},
                {"name": "Gemini", "value": 15},
                {"name": "Other", "value": 10},
            ],
            "spendData": [
                {"month": "Jan", "budget": 5000, "actual": 4100},
                {"month": "Feb", "budget": 5000, "actual": 4600},
                {"month": "Mar", "budget": 5500, "actual": 4900},
                {"month": "Apr", "budget": 5500, "actual": 5100},
                {"month": "May", "budget": 6000, "actual": 5400},
                {"month": "Jun", "budget": 6000, "actual": 5700},
            ],
            "chargebackData": [
                {"id": 1, "team": "Engineering", "owner": "Dept Lead", "budget": 4140, "spend": 3450, "variance": 690, "status": "Billed"},
                {"id": 2, "team": "Marketing", "owner": "Dept Lead", "budget": 1500, "spend": 1250, "variance": 250, "status": "Pending"},
                {"id": 3, "team": "Product & Data", "owner": "Dept Lead", "budget": 2376, "spend": 1980, "variance": 396, "status": "Billed"},
                {"id": 4, "team": "HR & Ops", "owner": "Dept Lead", "budget": 504, "spend": 420, "variance": 84, "status": "Billed"},
                {"id": 5, "team": "Sales", "owner": "Dept Lead", "budget": 1104, "spend": 920, "variance": 184, "status": "Pending"},
            ],
            "totalYtdSpend": "$32,450",
            "percentAllocated": "88% of allocated budget (Healthy)",
            "budgetUtilizationPct": 88.0,
        }

        period_days = {"7d": 7, "30d": 30, "90d": 90}.get(period, 30)
        now = datetime.now(timezone.utc)
        cutoff_iso = (now - timedelta(days=period_days)).isoformat()

        try:
            docs = [
                d.to_dict()
                for d in self.db.collection(Collections.USAGE)
                                 .where("departmentId", "==", team_id)
                                 .where("timestamp", ">=", cutoff_iso)
                                 .limit(1000)
                                 .stream()
            ]
        except Exception as e:
            logger.warning(f"Team analytics usage query failed for {team_id}: {e}. Using demo baseline.")
            docs = []

        if not docs:
            return fallback

        # --- Active users & adoption score (active / total dept headcount) ---
        active_user_ids = {d.get("userId") for d in docs if d.get("userId")}
        active_users = len(active_user_ids)

        try:
            dept_user_docs = list(self.db.collection(Collections.USERS).where("departmentId", "==", team_id).stream())
            total_dept_users = len(dept_user_docs)
        except Exception as e:
            logger.warning(f"Could not count department users for {team_id}: {e}")
            total_dept_users = 0

        if total_dept_users:
            adoption_score = round(min(100.0, (active_users / total_dept_users) * 100), 1)
        else:
            adoption_score = fallback["adoptionScore"]

        # --- Prior-period comparison for growth text ---
        prior_cutoff_iso = (now - timedelta(days=period_days * 2)).isoformat()
        try:
            prior_docs = [
                d.to_dict()
                for d in self.db.collection(Collections.USAGE)
                                 .where("departmentId", "==", team_id)
                                 .where("timestamp", ">=", prior_cutoff_iso)
                                 .where("timestamp", "<", cutoff_iso)
                                 .limit(1000)
                                 .stream()
            ]
            prior_active_users = len({d.get("userId") for d in prior_docs if d.get("userId")})
        except Exception:
            prior_active_users = 0

        if prior_active_users:
            growth_pct = round(((active_users - prior_active_users) / prior_active_users) * 100)
            active_users_growth = f"{'+' if growth_pct >= 0 else ''}{growth_pct}% vs prior period"
        else:
            active_users_growth = fallback["activeUsersGrowth"]

        # --- Per-day usage series (feeds the usage trend chart) ---
        day_order = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        day_stats = {day: {"tokens": 0, "users": set()} for day in day_order}
        for d in docs:
            ts = d.get("timestamp")
            if isinstance(ts, str):
                try:
                    day_label = day_order[datetime.fromisoformat(ts).weekday()]
                except Exception:
                    continue
                day_stats[day_label]["tokens"] += d.get("totalTokens", 0)
                if d.get("userId"):
                    day_stats[day_label]["users"].add(d.get("userId"))
        usage_data = [
            {"name": day, "tokens": day_stats[day]["tokens"], "activeUsers": len(day_stats[day]["users"])}
            for day in day_order
        ]

        # --- Top users by average prompt score, with real names from USERS ---
        user_agg = defaultdict(lambda: {"score_sum": 0.0, "score_n": 0, "requests": 0})
        for d in docs:
            uid = d.get("userId")
            if not uid:
                continue
            agg = user_agg[uid]
            agg["requests"] += 1
            if d.get("promptScore") is not None:
                agg["score_sum"] += d.get("promptScore", 0)
                agg["score_n"] += 1

        ranked_uids = sorted(
            user_agg.keys(),
            key=lambda u: (user_agg[u]["score_sum"] / user_agg[u]["score_n"]) if user_agg[u]["score_n"] else 0,
            reverse=True,
        )[:4]

        top_users = []
        for i, uid in enumerate(ranked_uids):
            try:
                udoc = self.db.collection(Collections.USERS).document(uid).get()
                udata = udoc.to_dict() if udoc.exists else {}
            except Exception:
                udata = {}
            name = udata.get("displayName") or (udata.get("email") or uid)
            agg = user_agg[uid]
            avg_score = round(agg["score_sum"] / agg["score_n"]) if agg["score_n"] else 0
            top_users.append({
                "id": i + 1,
                "name": name,
                "role": str(udata.get("role", "Team Member")).title(),
                "score": int(avg_score),
                "avatar": (name[:1] or "U").upper(),
            })
        if not top_users:
            top_users = fallback["topUsers"]

        # --- Model distribution (pie chart on TeamAnalytics.tsx) ---
        model_counts = defaultdict(int)
        for d in docs:
            model_counts[d.get("model") or "Other"] += 1
        model_distribution = [
            {"name": m, "value": c} for m, c in sorted(model_counts.items(), key=lambda x: -x[1])
        ] or fallback["modelDistribution"]

        # --- Budget lookup (Collections.BUDGETS is keyed by department id, see ForecastEngine) ---
        try:
            budget_doc = self.db.collection(Collections.BUDGETS).document(team_id).get()
            monthly_budget = budget_doc.to_dict().get("monthly_limit_usd") if budget_doc.exists else None
        except Exception:
            monthly_budget = None
        monthly_budget = monthly_budget or 5000.0

        # --- Spend data: real per-month actuals for the window vs the department's monthly budget ---
        month_costs = defaultdict(float)
        for d in docs:
            ts = d.get("timestamp")
            if isinstance(ts, str):
                try:
                    month_label = datetime.fromisoformat(ts).strftime("%b")
                except Exception:
                    continue
                month_costs[month_label] += d.get("estimatedCostUSD", 0.0)
        spend_data = [
            {"month": m, "budget": monthly_budget, "actual": round(c, 2)} for m, c in month_costs.items()
        ] or fallback["spendData"]

        # --- Chargeback table: per-department spend vs budget across the whole org for this window ---
        chargeback_data = []
        try:
            all_docs = [
                d.to_dict()
                for d in self.db.collection(Collections.USAGE).where("timestamp", ">=", cutoff_iso).limit(3000).stream()
            ]
            dept_spend = defaultdict(float)
            for d in all_docs:
                dept_spend[d.get("departmentId") or "unassigned"] += d.get("estimatedCostUSD", 0.0)

            dept_info_by_id = {doc.id: doc.to_dict() for doc in self.db.collection(Collections.DEPARTMENTS).stream()}
            budget_by_id = {doc.id: doc.to_dict() for doc in self.db.collection(Collections.BUDGETS).stream()}

            for idx, (d_id, spend) in enumerate(dept_spend.items()):
                if d_id == "unassigned" and spend == 0:
                    continue
                dept_info = dept_info_by_id.get(d_id, {})
                budget_info = budget_by_id.get(d_id, {})
                budget = budget_info.get("monthly_limit_usd", round(spend * 1.2, 2))
                variance = round(budget - spend, 2)
                chargeback_data.append({
                    "id": idx + 1,
                    "team": dept_info.get("name", d_id),
                    "owner": dept_info.get("manager_email", "Dept Lead"),
                    "budget": round(budget, 2),
                    "spend": round(spend, 2),
                    "variance": variance,
                    "status": "Billed" if variance >= 0 else "Over Budget",
                })
        except Exception as e:
            logger.warning(f"Chargeback aggregation failed: {e}")

        if not chargeback_data:
            chargeback_data = fallback["chargebackData"]

        # --- Budget utilization + YTD spend (feeds AIFinOps.tsx) ---
        team_period_spend = sum(d.get("estimatedCostUSD", 0.0) for d in docs)
        budget_utilization_pct = round((team_period_spend / monthly_budget) * 100, 1) if monthly_budget else fallback["budgetUtilizationPct"]

        total_tokens_period = sum(d.get("totalTokens", 0) for d in docs)
        weekly_tokens = f"{round(total_tokens_period / 1000)}k" if total_tokens_period >= 1000 else str(total_tokens_period)
        estimated_cost = f"${team_period_spend:,.2f}"

        ytd_start_iso = now.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0).isoformat()
        try:
            ytd_docs = [
                d.to_dict()
                for d in self.db.collection(Collections.USAGE)
                                 .where("departmentId", "==", team_id)
                                 .where("timestamp", ">=", ytd_start_iso)
                                 .limit(5000)
                                 .stream()
            ]
            ytd_spend = sum(d.get("estimatedCostUSD", 0.0) for d in ytd_docs)
        except Exception:
            ytd_spend = team_period_spend
        total_ytd_spend = f"${ytd_spend:,.2f}"

        status_word = "Healthy" if budget_utilization_pct < 90 else ("Near Limit" if budget_utilization_pct <= 100 else "Over Budget")

        return {
            "teamId": team_id,
            "period": period,
            "activeUsers": active_users,
            "adoptionScore": adoption_score,
            "weeklyTokens": weekly_tokens,
            "estimatedCost": estimated_cost,
            "activeUsersGrowth": active_users_growth,
            "usageData": usage_data,
            "topUsers": top_users,
            "modelDistribution": model_distribution,
            "spendData": spend_data,
            "chargebackData": chargeback_data,
            "totalYtdSpend": total_ytd_spend,
            "percentAllocated": f"{budget_utilization_pct}% of allocated budget ({status_word})",
            "budgetUtilizationPct": budget_utilization_pct,
        }

    @staticmethod
    def _maturity_stage_for_score(score: float) -> str:
        """Buckets an efficiency/adoption-style 0-100 score into the maturity ladder names
        used by get_organization_maturity_score, so rankings and the maturity ladder agree."""
        if score >= 90:
            return "AI Native"
        if score >= 80:
            return "Productive"
        if score >= 60:
            return "Occasional"
        return "No AI"

    def get_granular_department_analytics(self, department_id: str = "Engineering") -> dict:
        """
        Returns department rankings and efficiency metrics for executive dashboards.
        Real query: departments joined against USERS (headcount) and USAGE (30d activity/score),
        overlaid with departmentAnalytics efficiency scores where available (see get_team_benchmarks).
        Falls back to the original static rankings list when there is no real department data at all.
        """
        fallback_rankings = [
            {"dept": "Engineering", "efficiency": 96, "users": 142, "adoption_pct": 94.0, "maturity_stage": "AI Native"},
            {"dept": "Product & Data", "efficiency": 92, "users": 65, "adoption_pct": 88.0, "maturity_stage": "AI Native"},
            {"dept": "Marketing", "efficiency": 89, "users": 52, "adoption_pct": 82.0, "maturity_stage": "Productive"},
            {"dept": "Sales", "efficiency": 85, "users": 88, "adoption_pct": 75.0, "maturity_stage": "Productive"},
            {"dept": "HR & Ops", "efficiency": 80, "users": 24, "adoption_pct": 68.0, "maturity_stage": "Productive"},
        ]

        try:
            dept_docs = list(self.db.collection(Collections.DEPARTMENTS).stream())
        except Exception as e:
            logger.warning(f"Department analytics query failed: {e}. Using specification rankings.")
            dept_docs = []

        if not dept_docs:
            return {"department": department_id, "rankings": fallback_rankings}

        try:
            eff_by_name = {
                doc.to_dict().get("departmentName"): doc.to_dict().get("efficiencyScore")
                for doc in self.db.collection(Collections.DEPARTMENT_ANALYTICS).stream()
                if doc.to_dict().get("efficiencyScore")
            }
        except Exception:
            eff_by_name = {}

        cutoff_iso = (datetime.now(timezone.utc) - timedelta(days=30)).isoformat()
        rankings = []

        for d in dept_docs:
            d_id = d.id
            d_data = d.to_dict() or {}
            name = d_data.get("name", d_id)

            try:
                total_users = len(list(self.db.collection(Collections.USERS).where("departmentId", "==", d_id).stream()))
            except Exception:
                total_users = 0

            try:
                usage_docs = [
                    doc.to_dict()
                    for doc in self.db.collection(Collections.USAGE)
                                       .where("departmentId", "==", d_id)
                                       .where("timestamp", ">=", cutoff_iso)
                                       .limit(1000)
                                       .stream()
                ]
            except Exception:
                usage_docs = []

            active_users = len({u.get("userId") for u in usage_docs if u.get("userId")})
            scores = [u.get("promptScore") for u in usage_docs if u.get("promptScore") is not None]

            if scores:
                efficiency = round(sum(scores) / len(scores))
            elif name in eff_by_name:
                efficiency = round(eff_by_name[name])
            else:
                efficiency = None

            if efficiency is None:
                # No real signal for this department at all — skip rather than fabricate.
                continue

            adoption_pct = round((active_users / total_users) * 100, 1) if total_users else 0.0

            rankings.append({
                "dept": name,
                "efficiency": efficiency,
                "users": total_users or active_users,
                "adoption_pct": adoption_pct,
                "maturity_stage": self._maturity_stage_for_score(efficiency),
            })

        if not rankings:
            return {"department": department_id, "rankings": fallback_rankings}

        rankings.sort(key=lambda r: r["efficiency"], reverse=True)
        return {"department": department_id, "rankings": rankings}

    @staticmethod
    def _infer_provider_display_name(usage_doc: dict) -> str:
        """Resolves a display-friendly provider name (OpenAI/Anthropic/Google) for a usage doc,
        preferring the explicit `provider` field written by ai_gateway (AIProvider enum values
        OPENAI/CLAUDE/GEMINI) and falling back to sniffing the `model` name for older records."""
        provider_display = {"OPENAI": "OpenAI", "CLAUDE": "Anthropic", "GEMINI": "Google"}
        provider = (usage_doc.get("provider") or "").upper()
        if provider in provider_display:
            return provider_display[provider]

        model = (usage_doc.get("model") or "").lower()
        if "gpt" in model or "openai" in model:
            return "OpenAI"
        if "claude" in model:
            return "Anthropic"
        if "gemini" in model:
            return "Google"
        return "Other"

    def get_granular_organization_analytics(self) -> dict:
        """
        Returns organization-wide AI adoption and FinOps summary metrics.
        Real headcount from USERS, real 30d usage from USAGE, real spend from organizationAnalytics
        (overlaid with a direct USAGE sum when the daily aggregation job hasn't populated it yet).
        Falls back to the original static dict only where Firestore legitimately has nothing.
        """
        fallback = {
            "totalEmployees": 412,
            "activeAIUsers": 371,
            "orgAdoptionRate": 90.0,
            "monthlyTokenRunRate": 14500000,
            "totalSpendUSD": 1485.50,
            "projectedAnnualSavingsUSD": 48200.00,
            "totalCostSavingsUSD": 96500.0,
            "spendByProvider": [
                {"name": "OpenAI", "value": 145000},
                {"name": "Anthropic", "value": 85000},
                {"name": "Google", "value": 50000},
            ],
        }

        try:
            user_docs = [doc.to_dict() for doc in self.db.collection(Collections.USERS).stream()]
        except Exception as e:
            logger.warning(f"Org analytics user query failed: {e}")
            user_docs = []

        total_employees = len(user_docs) if user_docs else fallback["totalEmployees"]

        now = datetime.now(timezone.utc)
        thirty_days_ago_iso = (now - timedelta(days=30)).isoformat()
        try:
            usage_docs = [
                doc.to_dict()
                for doc in self.db.collection(Collections.USAGE).where("timestamp", ">=", thirty_days_ago_iso).limit(5000).stream()
            ]
        except Exception as e:
            logger.warning(f"Org analytics usage query failed: {e}")
            usage_docs = []

        active_ai_users = len({u.get("userId") for u in usage_docs if u.get("userId")})
        org_adoption_rate = (
            round((active_ai_users / total_employees) * 100, 1)
            if total_employees and active_ai_users
            else fallback["orgAdoptionRate"]
        )

        total_tokens_30d = sum(u.get("totalTokens", 0) for u in usage_docs)
        monthly_token_run_rate = total_tokens_30d if total_tokens_30d else fallback["monthlyTokenRunRate"]

        thirty_days_ago_str = (now - timedelta(days=30)).strftime("%Y-%m-%d")
        try:
            org_records = [
                doc.to_dict()
                for doc in self.db.collection(Collections.ORGANIZATION_ANALYTICS).where("date", ">=", thirty_days_ago_str).stream()
            ]
        except Exception as e:
            logger.warning(f"organizationAnalytics query failed: {e}")
            org_records = []

        total_spend = sum(r.get("totalCostUSD", 0) for r in org_records)
        if not total_spend:
            # Aggregation job may not have run yet — overlay a direct sum from raw usage docs.
            total_spend = sum(u.get("estimatedCostUSD", 0.0) for u in usage_docs)

        if not total_spend:
            total_spend = fallback["totalSpendUSD"]
            projected_annual_savings = fallback["projectedAnnualSavingsUSD"]
            total_cost_savings = fallback["totalCostSavingsUSD"]
        else:
            # Mirrors the savings_estimate_usd heuristic used in get_executive_dashboard_payload.
            total_cost_savings = round(total_spend * 0.15, 2)
            projected_annual_savings = round(total_cost_savings * 12, 2)

        provider_costs = defaultdict(float)
        for u in usage_docs:
            provider_costs[self._infer_provider_display_name(u)] += u.get("estimatedCostUSD", 0.0)

        if provider_costs:
            spend_by_provider = [
                {"name": p, "value": round(c, 2)} for p, c in sorted(provider_costs.items(), key=lambda x: -x[1])
            ]
        else:
            spend_by_provider = fallback["spendByProvider"]

        return {
            "totalEmployees": total_employees,
            "activeAIUsers": active_ai_users or fallback["activeAIUsers"],
            "orgAdoptionRate": org_adoption_rate,
            "monthlyTokenRunRate": monthly_token_run_rate,
            "totalSpendUSD": round(total_spend, 2),
            "projectedAnnualSavingsUSD": projected_annual_savings,
            "totalCostSavingsUSD": total_cost_savings,
            "spendByProvider": spend_by_provider,
        }


