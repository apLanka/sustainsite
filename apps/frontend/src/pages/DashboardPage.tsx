
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, User, Mail, Briefcase, Phone, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function DashboardPage() {
  const { user, logout } = useAuth();

  if (!user) {
    return null;
  }

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      ADMIN: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      PROJECT_MANAGER: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      INSPECTOR: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      SUPPLIER: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      VIEWER: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
    };
    return colors[role] || colors.VIEWER;
  };

  const formatRole = (role: string) => {
    return role.split('_').map(word => 
      word.charAt(0) + word.slice(1).toLowerCase()
    ).join(' ');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              SustainSite
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Sustainable Construction Management
            </p>
          </div>
          <Button
            variant="outline"
            onClick={logout}
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back, {user.fullName}!
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Here's your account overview
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Card className="backdrop-blur-sm bg-white/90 dark:bg-gray-800/90 shadow-lg col-span-full lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-green-600" />
                Profile Information
              </CardTitle>
              <CardDescription>Your account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                  <User className="h-5 w-5 text-gray-600 dark:text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Full Name
                    </p>
                    <p className="text-base font-semibold text-gray-900 dark:text-white">
                      {user.fullName}
                    </p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                  <Mail className="h-5 w-5 text-gray-600 dark:text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Email
                    </p>
                    <p className="text-base font-semibold text-gray-900 dark:text-white break-all">
                      {user.email}
                    </p>
                  </div>
                </div>

                {/* Role */}
                <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                  <Briefcase className="h-5 w-5 text-gray-600 dark:text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Role
                    </p>
                    <span
                      className={`inline-block mt-1 px-3 py-1 rounded-full text-sm font-semibold ${getRoleBadgeColor(
                        user.role
                      )}`}
                    >
                      {formatRole(user.role)}
                    </span>
                  </div>
                </div>

                {/* Phone Number */}
                {user.phoneNumber && (
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                    <Phone className="h-5 w-5 text-gray-600 dark:text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Phone Number
                      </p>
                      <p className="text-base font-semibold text-gray-900 dark:text-white">
                        {user.phoneNumber}
                      </p>
                    </div>
                  </div>
                )}

                {/* Account Created */}
                <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                  <Calendar className="h-5 w-5 text-gray-600 dark:text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Member Since
                    </p>
                    <p className="text-base font-semibold text-gray-900 dark:text-white">
                      {new Date(user.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats Card */}
          <Card className="backdrop-blur-sm bg-white/90 dark:bg-gray-800/90 shadow-lg">
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
              <CardDescription>Your activity overview</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                <p className="text-sm font-medium text-green-600 dark:text-green-400">
                  Account Status
                </p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                  {user.isActive ? 'Active' : 'Inactive'}
                </p>
              </div>

              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  Assigned Projects
                </p>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                  {user.assignedProjects?.length || 0}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Role-based Message */}
        <Card className="mt-6 backdrop-blur-sm bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
          <CardContent className="pt-6">
            <p className="text-gray-700 dark:text-gray-300">
              {user.role === 'ADMIN' && '🔐 You have full administrative access to the system.'}
              {user.role === 'PROJECT_MANAGER' && '📋 You can manage projects and team members.'}
              {user.role === 'INSPECTOR' && '🔍 You can inspect and verify project compliance.'}
              {user.role === 'SUPPLIER' && '📦 You can manage supplies and inventory.'}
              {user.role === 'VIEWER' && '👀 You have read-only access to view project information.'}
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
