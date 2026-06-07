import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import DashboardLayout from './components/layout/DashboardLayout'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import AddRidePage from './pages/AddRidePage'
import PlaceholderPage from './pages/PlaceholderPage'

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
              <Route path="/rides" element={<PlaceholderPage title="Rides" description="View and manage all your rides in one place." />} />
              <Route path="/rides/add" element={<AddRidePage />} />
              <Route path="/analytics" element={<PlaceholderPage title="Analytics" description="Deep dive into your earnings trends and performance metrics." />} />
              <Route path="/reports" element={<PlaceholderPage title="Reports" description="Generate and download detailed PDF earnings reports." />} />
              <Route path="/settings" element={<PlaceholderPage title="Settings" description="Manage your account preferences and notification settings." />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
