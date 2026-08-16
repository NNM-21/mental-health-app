import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Same shape as ProtectedRoute, plus a role check. Roles come straight off
// the JWT-derived user object: 'patient' | 'responder' | 'moderator' | 'doctor' | 'admin'
// (see backend/src/controllers/authController.js VALID_ROLES).
export default function RoleProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (!allowedRoles.includes(user?.role)) {
    // Logged in, just the wrong role — send them to their home dashboard
    // instead of a dead end.
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
