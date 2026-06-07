import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import DashboardLayout from './components/layout/DashboardLayout'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import AddRidePage from './pages/AddRidePage'
import RideHistoryPage from './pages/RideHistoryPage'
import SettingsPage from './pages/SettingsPage'
import PlaceholderPage from './pages/PlaceholderPage'
import FuelPage from './pages/FuelPage'
import ReportsPage from './pages/ReportsPage'

function ProtectedRoute() {
  const { token } = useAuth()
  return token ? <Outlet /> : <Navigate to="/login" replace />
}

function GuestRoute({ children }) {
  const { token } = useAuth()
  return token ? <Navigate to="/dashboard" replace /> : children
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
          <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />

          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/rides" element={<RideHistoryPage />} />
              <Route path="/rides/add" element={<AddRidePage />} />
              <Route path="/analytics" element={<PlaceholderPage title="Analytics" description="Deep dive into your earnings trends and performance metrics." />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/fuel" element={<FuelPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
