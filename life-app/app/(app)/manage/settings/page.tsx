import { requireAdminOrTeacher } from "@/lib/auth/middleware";
import { redirect } from "next/navigation";
import AdminSettings from "@/components/manage/manage-settings";

// Force dynamic rendering to avoid static generation issues
export const dynamic = 'force-dynamic';

export default async function AdminSettingsPage() {
  const user = await requireAdminOrTeacher();

  // Check if user has required role (lead_teacher, dev, or admin)
  const allowedRoles = ['lead_teacher', 'dev', 'admin'];
  if (!allowedRoles.includes(user.role)) {
    redirect('/unauthorized');
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Settings</h1>
              <p className="text-gray-600 mt-2">
                Manage system configuration, security settings, and platform administration
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                {user.role === 'admin' ? 'Administrator' : 
                 user.role === 'dev' ? 'Developer' : 'Lead Teacher'} Access
              </span>
            </div>
          </div>
        </div>

        {/* Admin Settings Component */}
        <AdminSettings userRole={user.role} />
      </div>
    </div>
  );
}