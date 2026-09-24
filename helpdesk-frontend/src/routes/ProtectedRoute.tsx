import {
  Navigate,
  Outlet,
  useLocation,
} from 'react-router-dom';

import {
  getCurrentUser,
  type UserRole,
} from '../utils/auth';

interface ProtectedRouteProps {
  roles?: UserRole[];
}

export default function ProtectedRoute({
  roles,
}: ProtectedRouteProps) {
  const location =
    useLocation();

  const user =
    getCurrentUser();

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location.pathname,
        }}
      />
    );
  }

  if (
    roles &&
    !roles.includes(user.role)
  ) {
    return (
      <Navigate
        to="/unauthorized"
        replace
      />
    );
  }

  return <Outlet />;
}
