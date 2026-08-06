// AI360 Dashboard – App Root
// Sets up providers: Theme, QueryClient, Router, Auth
import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { darkTheme, lightTheme } from './theme';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

// Pages
import LoginPage from './pages/LoginPage';
import EmployeeDashboard from './pages/employee/EmployeeDashboard';
import ManagerDashboard from './pages/manager/ManagerDashboard';
import ExecutiveDashboard from './pages/executive/ExecutiveDashboard';
import AdminPanel from './pages/admin/AdminPanel';

// Sub-pages (Employee)
import AIChat from './pages/employee/AIChat';
import PromptStudio from './pages/employee/PromptStudio';
import EmployeeAnalytics from './pages/employee/Analytics';
import EmployeeRecommendations from './pages/employee/Recommendations';

// Sub-pages (Manager)
import TeamAnalytics from './pages/manager/TeamAnalytics';
import ManagerFinOps from './pages/manager/AIFinOps';
import ManagerForecast from './pages/manager/Forecast';
import ManagerReports from './pages/manager/Reports';
import ManagerRecommendations from './pages/manager/Recommendations';

// Sub-pages (Admin)
import Organizations from './pages/admin/Organizations';
import Users from './pages/admin/Users';
import Providers from './pages/admin/Providers';
import Budgets from './pages/admin/Budgets';
import Settings from './pages/admin/Settings';

// Sub-pages (Executive)
import AIRoi from './pages/executive/AIRoi';
import DeptRankings from './pages/executive/DeptRankings';
import ExecForecast from './pages/executive/Forecast';
import ExecReports from './pages/executive/Reports';

// Layouts
import EmployeeLayout from './layouts/EmployeeLayout';
import ManagerLayout from './layouts/ManagerLayout';
import AdminLayout from './layouts/AdminLayout';
import ExecutiveLayout from './layouts/ExecutiveLayout';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 2, staleTime: 60_000, refetchOnWindowFocus: false },
    mutations: { retry: 1 },
  },
});

export default function App() {
  const [isDark] = useState(false); // Light mode default

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={isDark ? darkTheme : lightTheme}>
        <CssBaseline />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              {/* Public */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/" element={<Navigate to="/login" replace />} />

              {/* Employee */}
              <Route element={<ProtectedRoute allowedRoles={['EMPLOYEE', 'MANAGER', 'ADMIN', 'EXECUTIVE']} />}>
                <Route element={<EmployeeLayout />}>
                  <Route path="/dashboard/employee" element={<EmployeeDashboard />} />
                  <Route path="/dashboard/employee/chat" element={<AIChat />} />
                  <Route path="/dashboard/employee/prompt" element={<PromptStudio />} />
                  <Route path="/dashboard/employee/analytics" element={<EmployeeAnalytics />} />
                  <Route path="/dashboard/employee/recommendations" element={<EmployeeRecommendations />} />
                </Route>
              </Route>

              {/* Manager */}
              <Route element={<ProtectedRoute allowedRoles={['MANAGER', 'ADMIN', 'EXECUTIVE']} />}>
                <Route element={<ManagerLayout />}>
                  <Route path="/dashboard/manager" element={<ManagerDashboard />} />
                  <Route path="/dashboard/manager/analytics" element={<TeamAnalytics />} />
                  <Route path="/dashboard/manager/finops" element={<ManagerFinOps />} />
                  <Route path="/dashboard/manager/forecast" element={<ManagerForecast />} />
                  <Route path="/dashboard/manager/reports" element={<ManagerReports />} />
                  <Route path="/dashboard/manager/recommendations" element={<ManagerRecommendations />} />
                </Route>
              </Route>

              {/* Executive */}
              <Route element={<ProtectedRoute allowedRoles={['EXECUTIVE', 'ADMIN']} />}>
                <Route element={<ExecutiveLayout />}>
                  <Route path="/dashboard/executive" element={<ExecutiveDashboard />} />
                  <Route path="/dashboard/executive/roi" element={<AIRoi />} />
                  <Route path="/dashboard/executive/departments" element={<DeptRankings />} />
                  <Route path="/dashboard/executive/forecast" element={<ExecForecast />} />
                  <Route path="/dashboard/executive/reports" element={<ExecReports />} />
                </Route>
              </Route>

              {/* Admin */}
              <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
                <Route element={<AdminLayout />}>
                  <Route path="/dashboard/admin" element={<AdminPanel />} />
                  <Route path="/dashboard/admin/organizations" element={<Organizations />} />
                  <Route path="/dashboard/admin/users" element={<Users />} />
                  <Route path="/dashboard/admin/providers" element={<Providers />} />
                  <Route path="/dashboard/admin/budgets" element={<Budgets />} />
                  <Route path="/dashboard/admin/settings" element={<Settings />} />
                </Route>
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
