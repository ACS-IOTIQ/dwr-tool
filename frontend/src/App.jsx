
// ── frontend/src/App.jsx ─────────────────────────────────────────
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ConfigProvider, theme } from 'antd'
import ProtectedRoute from './components/layout/ProtectedRoute'
import AppShell from './components/layout/AppShell'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import SubmitReportPage from './pages/SubmitReportPage'
import MyReportsPage from './pages/MyReportsPage'
import TeamStatusPage from './pages/TeamStatusPage'
import ReportExplorerPage from './pages/ReportExplorerPage'
import AnalyzePage from './pages/AnalyzePage'
import ReportDetailPage from './pages/ReportDetailPage'
import UsersPage from './pages/UsersPage'
import WorkTypesPage from './pages/WorkTypesPage'
import LeavePage from './pages/LeavePage'
import NotFoundPage from './pages/NotFoundPage'
import './styles/layout.css'

export default function App() {
  return (
    <ConfigProvider theme={{ algorithm: theme.defaultAlgorithm }}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<AppShell />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/submit-report" element={<SubmitReportPage />} />
              <Route path="/my-reports" element={<MyReportsPage />} />
              {/* Admin + RM only */}
              <Route element={<ProtectedRoute roles={['ADMIN','RM']} />}>
                <Route path="/team-status" element={<TeamStatusPage />} />
                <Route path="/report-explorer" element={<ReportExplorerPage />} />
                <Route path="/analyze" element={<AnalyzePage />} />
              </Route>
              <Route path="/reports/:id" element={<ReportDetailPage />} />
              {/* Admin only */}
              <Route element={<ProtectedRoute roles={['ADMIN']} />}>
                <Route path="/users" element={<UsersPage />} />
                <Route path="/work-types" element={<WorkTypesPage />} />
                <Route path="/leave" element={<LeavePage />} />
              </Route>
            </Route>
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  )
}
