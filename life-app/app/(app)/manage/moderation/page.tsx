import { requireAdminOrTeacher } from "@/lib/auth/middleware";
import { redirect } from "next/navigation";
import ModerationManagement from "@/components/manage/moderation-management";

// Force dynamic rendering to avoid static generation issues
export const dynamic = 'force-dynamic';

export default async function ModerationDashboard() {
  const user = await requireAdminOrTeacher();

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Content Moderation</h1>
              <p className="text-gray-600 mt-2">
                Review and manage reported content and community guidelines
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                {user.role === 'admin' ? 'Administrator' : 
                 user.role === 'lead_teacher' ? 'Lead Teacher' : 
                 user.role === 'senior_teacher' ? 'Senior Teacher' : 
                 user.role === 'junior_teacher' ? 'Junior Teacher' : 
                 user.role === 'moderator' ? 'Moderator' : 'Teacher'} Access
              </span>
            </div>
          </div>
        </div>

        {/* Moderation Management Component */}
        <ModerationManagement />
      </div>
    </div>
  );
} 