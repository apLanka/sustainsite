import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import type { UserRole } from '@/types/auth';
import { isSupplier, loginHomePath } from '@/lib/rbac';
interface ProtectedRouteProps {
    children: ReactNode;
    allowedRoles?: readonly UserRole[];
}
export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
    const { isAuthenticated, isLoading, user } = useAuth();
    const location = useLocation();
    if (isLoading) {
        return (<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-green-600 mx-auto mb-4"/>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>);
    }
    if (!isAuthenticated) {
        return <Navigate to="/login" replace state={{ from: location.pathname }}/>;
    }
    const role = user?.role;
    if (allowedRoles?.length) {
        if (!role || !allowedRoles.includes(role as UserRole)) {
            return <Navigate to={loginHomePath(role)} replace/>;
        }
        return <>{children}</>;
    }
    if (isSupplier(role)) {
        const allowed = location.pathname.startsWith('/supplier') || location.pathname.startsWith('/settings');
        if (!allowed) {
            return <Navigate to="/supplier/materials" replace/>;
        }
    }
    else if (location.pathname.startsWith('/supplier')) {
        return <Navigate to="/dashboard" replace/>;
    }
    return <>{children}</>;
}
