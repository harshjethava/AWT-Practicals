import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export function ProtectedRoute({ children }) {
  const { isAuthed } = useAuth()

  if (!isAuthed) {
    return <Navigate to="/login" replace />
  }

  return children
}
