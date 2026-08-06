// AI360 – Firebase Firestore Automated Seeding Script
// Populates all 11 core collections and document relationships for Firebase Firestore.

import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

export async function seedFirestoreDatabase() {
  console.log('🌱 Seeding AI360 Firestore Collections & Document Relationships...');

  // 1. ORGANIZATIONS COLLECTION
  const orgRef = doc(db, 'organizations', 'org_acme_corp');
  await setDoc(orgRef, {
    id: 'org_acme_corp',
    name: 'Acme Enterprise Solutions',
    slug: 'acme-corp',
    logoUrl: 'https://ai360.io/assets/acme-logo.png',
    adminEmail: 'admin@ai360.io',
    totalBudgetUSD: 280000,
    aiProviders: ['OPENAI', 'GEMINI', 'CLAUDE'],
    defaultModel: 'gemini-1.5-flash',
    policies: {
      piiDetectionEnabled: true,
      promptOptimizationEnabled: true,
      maxDailyTokensPerUser: 100000,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  // 2. DEPARTMENTS COLLECTION
  const depts = [
    { id: 'dept_eng', name: 'Engineering', managerId: 'user_manager_1', monthlyBudgetUSD: 124000 },
    { id: 'dept_fin', name: 'Finance & Ops', managerId: 'user_manager_2', monthlyBudgetUSD: 52000 },
    { id: 'dept_mkt', name: 'Marketing', managerId: 'user_manager_3', monthlyBudgetUSD: 48000 },
    { id: 'dept_sales', name: 'Sales', managerId: 'user_manager_4', monthlyBudgetUSD: 36000 },
  ];
  for (const dept of depts) {
    await setDoc(doc(db, 'departments', dept.id), {
      ...dept,
      organizationId: 'org_acme_corp',
      createdAt: new Date().toISOString(),
    });
  }

  // 3. TEAMS COLLECTION
  const teams = [
    { id: 'team_backend', departmentId: 'dept_eng', name: 'Backend Engineering' },
    { id: 'team_devops', departmentId: 'dept_eng', name: 'Cloud & DevOps' },
    { id: 'team_frontend', departmentId: 'dept_eng', name: 'Frontend Guild' },
    { id: 'team_qa', departmentId: 'dept_eng', name: 'QA Automation' },
  ];
  for (const team of teams) {
    await setDoc(doc(db, 'teams', team.id), {
      ...team,
      organizationId: 'org_acme_corp',
      createdAt: new Date().toISOString(),
    });
  }

  // 4. USERS COLLECTION (4 Demo Accounts & Roles)
  const users = [
    { id: 'user_employee_1', email: 'employee@ai360.io', displayName: 'Sarah Jenkins', role: 'EMPLOYEE', departmentId: 'dept_eng', teamId: 'team_backend' },
    { id: 'user_manager_1', email: 'manager@ai360.io', displayName: 'Marcus Chen', role: 'MANAGER', departmentId: 'dept_eng', teamId: 'team_backend' },
    { id: 'user_executive_1', email: 'executive@ai360.io', displayName: 'David Miller', role: 'EXECUTIVE', departmentId: 'dept_fin', teamId: 'team_backend' },
    { id: 'user_admin_1', email: 'admin@ai360.io', displayName: 'System Administrator', role: 'ADMIN', departmentId: 'dept_eng', teamId: 'team_devops' },
  ];
  for (const user of users) {
    await setDoc(doc(db, 'users', user.id), {
      ...user,
      organizationId: 'org_acme_corp',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  // 5. PROMPT HISTORY & MARKETPLACE COLLECTION
  await setDoc(doc(db, 'promptHistory', 'prompt_sap_spec'), {
    id: 'prompt_sap_spec',
    userId: 'user_employee_1',
    title: 'SAP Prompt Spec',
    promptText: 'Analyze SAP RFC logs and extract key error codes in JSON format.',
    category: 'CODING',
    promptScore: 98,
    isFavorite: true,
    isMarketplaceTemplate: true,
    usesCount: 520,
    hoursSaved: 1100,
    createdAt: new Date().toISOString(),
  });

  // 6. USAGE & TELEMETRY COLLECTION
  await setDoc(doc(db, 'usage', 'usage_sample_1'), {
    id: 'usage_sample_1',
    userId: 'user_employee_1',
    organizationId: 'org_acme_corp',
    departmentId: 'dept_eng',
    teamId: 'team_backend',
    prompt: 'Generate a Spring Boot 3 REST API using Java 21.',
    response: 'Spring Boot 3 REST API generated with clean architecture.',
    category: 'CODING',
    promptScore: 82,
    model: 'claude-3-5-sonnet',
    provider: 'CLAUDE',
    inputTokens: 180,
    outputTokens: 450,
    totalTokens: 630,
    estimatedCostUSD: 0.0024,
    latencyMs: 850,
    timestamp: new Date().toISOString(),
  });

  // 7. EMPLOYEE ANALYTICS COLLECTION
  await setDoc(doc(db, 'employeeAnalytics', 'analytics_sarah'), {
    id: 'analytics_sarah',
    userId: 'user_employee_1',
    date: new Date().toISOString().split('T')[0],
    totalRequests: 43,
    totalTokens: 8300,
    totalCostUSD: 1.32,
    avgPromptScore: 88,
    adoptionScore: 92,
    efficiencyScore: 87,
  });

  // 8. DEPARTMENT ANALYTICS COLLECTION
  await setDoc(doc(db, 'departmentAnalytics', 'dept_analytics_eng'), {
    id: 'dept_analytics_eng',
    departmentId: 'dept_eng',
    organizationId: 'org_acme_corp',
    date: new Date().toISOString().split('T')[0],
    totalRequests: 1420,
    totalTokens: 450000,
    totalCostUSD: 1245.50,
    avgPromptScore: 92,
    activeUsers: 45,
    adoptionScore: 94,
    efficiencyScore: 92,
    unusedLicensesCount: 14,
  });

  // 9. FORECASTS COLLECTION
  await setDoc(doc(db, 'forecasts', 'forecast_acme_q3'), {
    id: 'forecast_acme_q3',
    targetId: 'org_acme_corp',
    targetType: 'organization',
    generatedAt: new Date().toISOString(),
    modelUsed: 'OLS Linear Regression',
    forecast30d: [
      { date: 'Month 1', predictedCostUSD: 155000, lowerBound: 145000, upperBound: 165000 },
      { date: 'Month 2', predictedCostUSD: 180000, lowerBound: 168000, upperBound: 192000 },
    ],
  });

  // 10. RECOMMENDATIONS COLLECTION
  await setDoc(doc(db, 'recommendations', 'rec_cost_nudge_1'), {
    id: 'rec_cost_nudge_1',
    type: 'BETTER_MODEL',
    priority: 'HIGH',
    targetId: 'dept_eng',
    targetType: 'department',
    title: 'Daily Proactive AI Cost Advisor Nudge',
    description: 'Move summarization tasks to Gemini Flash to save ₹210 (~25% waste cut).',
    estimatedSavingsUSD: 210,
    actionLabel: 'Apply Routing Suggestion',
    isRead: false,
    createdAt: new Date().toISOString(),
  });

  // 11. NOTIFICATIONS COLLECTION
  await setDoc(doc(db, 'notifications', 'notif_welcome'), {
    id: 'notif_welcome',
    type: 'SYSTEM',
    priority: 'MEDIUM',
    userId: 'user_employee_1',
    title: 'Welcome to AI360',
    message: 'Your role-based authentication and AI Prompt Privacy Layer are active.',
    isRead: false,
    createdAt: new Date().toISOString(),
  });

  console.log('✅ Successfully seeded all 11 Firestore collections and document relationships!');
}
