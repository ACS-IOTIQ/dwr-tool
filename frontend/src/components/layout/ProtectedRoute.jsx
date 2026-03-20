// ── frontend/src/components/layout/ProtectedRoute.jsx ───────────
import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { isAdmin, isRM } from '../../utils/roleUtils'
import { useUsers } from '../../hooks/useUsers'

export default function ProtectedRoute({ roles }) {
  const { token, user } = useAuthStore()
  const { data: allUsers } = useUsers()

  if (!token || !user) return <Navigate to="/login" replace />

  if (roles) {
    const hasRole =
      (roles.includes('ADMIN') && isAdmin(user)) ||
      (roles.includes('RM') && isRM(user, allUsers))
    if (!hasRole) return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}

