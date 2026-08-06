# AI360 – Enterprise AI Productivity, Governance & FinOps Platform

<div align="center">
  <h3>🚀 AI360 — Your Organization's AI Command Center</h3>
  <p>Centralize, govern, optimize, and measure AI usage across your entire organization.</p>
</div>

---

## Overview

AI360 is an enterprise-grade SaaS platform that acts as an AI gateway between your employees and LLM providers (OpenAI, Google Gemini, Anthropic Claude). Instead of accessing AI tools directly, employees interact through the **AI360 VS Code Extension**, giving administrators full visibility into AI adoption, costs, governance, and ROI.

## Monorepo Structure

```
ai360/
├── apps/
│   ├── dashboard/          # React 19 + TypeScript + MUI dashboard
│   ├── backend/            # FastAPI Python backend
│   └── vscode-extension/   # VS Code Extension (TypeScript)
├── packages/
│   └── shared-types/       # Shared TypeScript types & Zod schemas
├── .env.example            # Environment variable template
├── package.json            # npm workspaces root
└── README.md
```

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend Dashboard | React 19, TypeScript, MUI, React Router, TanStack Query, Recharts, Framer Motion |
| Backend API | Python 3.12, FastAPI, Pydantic v2, Firebase Admin SDK, APScheduler |
| Database (MVP) | Firebase Firestore |
| AI Providers | OpenAI GPT, Google Gemini, Anthropic Claude (Adapter Pattern) |
| Authentication | Firebase Auth + JWT |
| VS Code Extension | TypeScript, VS Code Extension API, Axios |
| ML / Forecasting | scikit-learn (Linear Regression) |

## Prerequisites

- **Node.js** 20+
- **npm** 10+
- **Python** 3.12+
- **VS Code** 1.85+ (for extension development)
- A **Firebase project** with Firestore and Authentication enabled
- API keys for at least one LLM provider (OpenAI / Gemini / Claude)

## Quick Start

### 1. Clone & Install

```bash
git clone <repo-url>
cd AI360
cp .env.example .env
# Fill in your values in .env
npm install
```

### 2. Start the Backend

```bash
cd apps/backend
python -m venv .venv
.venv\Scripts\activate          # Windows
# source .venv/bin/activate     # macOS/Linux
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 3. Start the Dashboard

```bash
npm run dev:dashboard
# Opens at http://localhost:5173
```

### 4. Run the VS Code Extension

```bash
npm run dev:extension
# Then press F5 in VS Code to launch Extension Development Host
```

## Features

### 👩‍💼 Employee
- AI Chat (ChatGPT-style) via VS Code Extension
- Prompt Quality Scoring & Optimization
- PII / Sensitive Data Detection
- Prompt History & Analytics
- Personal AI Score & Recommendations

### 👔 Manager
- Team Usage & Cost Dashboard
- AI Adoption & Efficiency Scores
- Department Analytics & Forecasting
- Team Recommendations

### 🏢 Admin
- Organization & Department Management
- AI Provider Configuration
- Budget Allocation & Alerts
- Audit Logs & Governance

### 📊 Executive
- Organization-wide AI ROI Dashboard
- Department Rankings
- Cost Forecasting (30/60/90 day)
- Savings Estimation

## Project Modules

| Module | Description |
|---|---|
| Authentication | Firebase Auth + JWT + RBAC |
| Organization Management | Org / Dept / Team / Employee hierarchy |
| VS Code Extension | AI chat, prompt tools, sidebar panels |
| AI Gateway | Adapter pattern for OpenAI / Gemini / Claude |
| Prompt Intelligence | Validator, Classifier, Scorer, Optimizer, PII Scanner |
| Usage Telemetry | Firestore-based usage capture pipeline |
| Analytics Engine | Daily aggregation, KPI computation |
| Adoption & Efficiency Scores | 0–100 composite scores |
| Recommendation Engine | AI-powered suggestions for users, depts, org |
| Forecast Engine | Linear regression cost forecasting |
| Reports | PDF / Excel / CSV export |
| AI FinOps | Cost attribution, budgets, chargeback / showback |
| Notifications | In-app + email alerts |

## Environment Setup

Copy `.env.example` to `.env` and populate:

```bash
cp .env.example .env
```

See `.env.example` for a full list of required variables including Firebase config, AI provider API keys, JWT secrets, and backend settings.

## License

Proprietary – All rights reserved.
