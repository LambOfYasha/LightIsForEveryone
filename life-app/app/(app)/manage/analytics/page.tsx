import { requireAdminOrTeacher } from "@/lib/auth/middleware";
import { redirect } from "next/navigation";
import AnalyticsManagement from "@/components/manage/analytics-management";

// Force dynamic rendering to avoid static generation issues
export const dynamic = 'force-dynamic';

export default async function AnalyticsDashboard() {
  const user = await requireAdminOrTeacher();

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Comprehensive insights into platform performance, user engagement, and system health
          </p>
        </div>

        {/* Analytics Management Component */}
        <AnalyticsManagement />
      </div>
    </div>
  );
} 