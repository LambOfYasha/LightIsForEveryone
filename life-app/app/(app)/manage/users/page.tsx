import { requireAdminOrLeadTeacher } from "@/lib/auth/middleware";
import { Shield } from "lucide-react";
import { getAllUsers } from "@/action/userActions";
import UserManagement from "@/components/manage/user-management";
import UserStatsCards from "@/components/manage/user-stats-cards";

// Force dynamic rendering to avoid static generation issues
export const dynamic = 'force-dynamic';

export default async function UsersPage() {
  const user = await requireAdminOrLeadTeacher();

  // Fetch initial data
  const usersResult = await getAllUsers({ limit: 20 });
  const initialUsers = usersResult.success ? usersResult.users : [];

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">User Management</h1>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            <span className="text-sm text-gray-600">
              {user.role === 'admin' ? 'Administrator' : 'Lead Teacher'} Access
            </span>
          </div>
        </div>

        {/* Dynamic Stats Cards */}
        <UserStatsCards />

        {/* User Management Component */}
        <UserManagement initialUsers={initialUsers} />
      </div>
    </div>
  );
}