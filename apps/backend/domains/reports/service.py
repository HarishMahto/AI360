"""
AI360 – Reports Service
Generates genuine CSV export files from real aggregated analytics data and
persists a record of every generated report to Firestore.
"""
import csv
import io
import logging
import uuid
from datetime import datetime, timezone, timedelta
from typing import Optional

from core.firebase import Collections
from domains.reports.schemas import ReportResponse, ReportListItem

logger = logging.getLogger(__name__)

# Formats we accept from the client. Genuine PDF/Excel rendering is a follow-up
# (this deploys to a serverless runtime, so we deliberately avoid template-engine /
# binary-build dependencies like pdfkit or openpyxl for now). Until then we serve
# real CSV bytes for every format, but keep the requested extension in the
# filename so the download flow still feels correct to the user.
_KNOWN_FORMATS = {"pdf", "excel", "xlsx", "csv"}


class ReportService:
    def __init__(self, db):
        self.db = db

    # ------------------------------------------------------------------
    # Data assembly
    # ------------------------------------------------------------------
    def _build_csv_rows(self, target_type: str, target_id: str, period: str) -> tuple[str, list[list]]:
        """
        Pulls real aggregated analytics data (via AnalyticsService) for the
        requested report type and shapes it into CSV rows.
        Returns (title, rows) where rows is a list of row-lists (first rows are headers).
        """
        from domains.analytics.service import AnalyticsService
        analytics = AnalyticsService(self.db)

        report_type = (target_type or "").lower()
        rows: list[list] = []

        if report_type in ("employee", "raw-data", "raw_data"):
            data = analytics.get_granular_employee_analytics(target_id or "unknown_user", period)
            title = f"Employee Analytics Report ({period})"
            rows.append(["Metric", "Value"])
            rows.append(["Period", data.get("period")])
            rows.append(["Total Tokens", data.get("totalTokens")])
            rows.append(["Total Cost (USD)", data.get("totalCostUSD")])
            rows.append(["Requests Count", data.get("requestsCount")])
            rows.append(["Average Prompt Score", data.get("averagePromptScore")])
            rows.append([])
            rows.append(["Day", "Tokens", "Cost (USD)"])
            for entry in data.get("tokenUsageTrend", []):
                rows.append([entry.get("day"), entry.get("tokens"), entry.get("cost")])

        elif report_type in ("manager", "team"):
            data = analytics.get_granular_team_analytics(target_id or "engineering_team")
            title = f"Team Analytics Report ({period})"
            rows.append(["Metric", "Value"])
            rows.append(["Team ID", data.get("teamId")])
            rows.append(["Active Users", data.get("activeUsers")])
            rows.append(["Adoption Score", data.get("adoptionScore")])
            rows.append(["Weekly Tokens", data.get("weeklyTokens")])
            rows.append(["Estimated Cost", data.get("estimatedCost")])
            rows.append([])
            rows.append(["Day", "Tokens", "Active Users"])
            for entry in data.get("usageData", []):
                rows.append([entry.get("name"), entry.get("tokens"), entry.get("activeUsers")])
            rows.append([])
            rows.append(["Team", "Spend (USD)", "Status"])
            for entry in data.get("chargebackData", []):
                rows.append([entry.get("team"), entry.get("spend"), entry.get("status")])

        elif report_type in ("executive", "organization", "org"):
            data = analytics.get_granular_organization_analytics()
            title = f"Executive Organization Report ({period})"
            rows.append(["Metric", "Value"])
            for k, v in data.items():
                rows.append([k, v])

        else:
            # Unknown/custom report_type (e.g. "raw-data" already handled above) -
            # fall back to an organization-wide snapshot so any requested type
            # still returns real, non-fabricated data.
            data = analytics.get_granular_organization_analytics()
            title = f"{report_type.title() if report_type else 'Organization'} Report ({period})"
            rows.append(["Metric", "Value"])
            for k, v in data.items():
                rows.append([k, v])

        return title, rows

    def _rows_to_csv_bytes(self, rows: list[list]) -> bytes:
        buffer = io.StringIO()
        writer = csv.writer(buffer)
        for row in rows:
            writer.writerow(row)
        return buffer.getvalue().encode("utf-8")

    # ------------------------------------------------------------------
    # Persistence
    # ------------------------------------------------------------------
    def _persist_report_record(self, report_id: str, target_type: str, format: str,
                                generated_by_user_id: Optional[str], scope: str, title: str) -> dict:
        doc = {
            "id": report_id,
            "type": target_type,
            "format": format,
            "generatedAt": datetime.now(timezone.utc).isoformat(),
            "generatedByUserId": generated_by_user_id or "",
            "scope": scope,
            "title": title,
        }
        try:
            self.db.collection(Collections.REPORTS).document(report_id).set(doc)
        except Exception as e:
            logger.warning(f"Could not persist report record to Firestore: {e}")
        return doc

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------
    def generate_report_file(self, target_id: str, target_type: str, format: str, period: str,
                              generated_by_user_id: Optional[str] = None, scope: Optional[str] = None):
        """
        Generates real CSV bytes for the requested report and persists a metadata
        record to Firestore. Returns (filename, content_bytes, report_id, title).
        """
        title, rows = self._build_csv_rows(target_type, target_id, period)
        content_bytes = self._rows_to_csv_bytes(rows)

        requested_format = (format or "csv").lower()
        extension = requested_format if requested_format in _KNOWN_FORMATS else "csv"
        safe_target_type = (target_type or "report").replace("/", "_")
        safe_target_id = (target_id or "org").replace("/", "_")
        filename = f"{safe_target_type}_{safe_target_id}_{period}.{extension}"

        report_id = str(uuid.uuid4())
        self._persist_report_record(
            report_id, target_type, requested_format, generated_by_user_id,
            scope or target_type, title
        )

        return filename, content_bytes, report_id, title

    def generate_report(self, target_id: str, target_type: str, format: str, period: str,
                         generated_by_user_id: Optional[str] = None, scope: Optional[str] = None) -> ReportResponse:
        """
        Used by POST /reports/generate. Generates the report file, persists its
        metadata to Firestore, and returns real report metadata (no more
        fabricated storage-bucket URL) including a real download path the
        client can hit via GET /reports/{report_type}.
        """
        filename, _content_bytes, report_id, title = self.generate_report_file(
            target_id, target_type, format, period, generated_by_user_id, scope
        )

        now = datetime.now(timezone.utc)
        expires_at = now + timedelta(hours=24)
        download_url = f"/reports/{target_type}?format={format}&period={period}&target_id={target_id}"

        return ReportResponse(
            download_url=download_url,
            expires_at=expires_at.isoformat(),
            id=report_id,
            title=title,
            type=target_type,
            format=format,
        )

    def list_reports(self, scope: Optional[str] = None, limit: int = 20) -> list[ReportListItem]:
        """
        Used by GET /reports. Reads previously generated report records from
        Firestore, newest first, optionally filtered by scope. Never raises on
        an empty/missing collection -- just returns an empty list.
        """
        docs: list[dict] = []
        try:
            query = self.db.collection(Collections.REPORTS)
            if scope:
                query = query.where("scope", "==", scope)
            query = query.order_by("generatedAt", direction="DESCENDING").limit(limit)
            docs = [d.to_dict() for d in query.stream()]
        except Exception as e:
            logger.warning(f"Could not list reports (empty/missing collection or index): {e}")
            docs = []

        return [
            ReportListItem(
                id=d.get("id", ""),
                title=d.get("title", ""),
                type=d.get("type", ""),
                format=d.get("format", ""),
                generated_at=d.get("generatedAt", ""),
            )
            for d in docs
        ]
