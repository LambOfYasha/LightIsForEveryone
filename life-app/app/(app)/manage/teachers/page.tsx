import { requireAdminOrSeniorTeacher } from "@/lib/auth/middleware";
import { GraduationCap } from "lucide-react";
import { getAllTeachers } from "@/action/teacherActions";
import TeacherManagement from "@/components/manage/teacher-management";
import TeacherStatsCards from "@/components/manage/teacher-stats-cards";

// Force dynamic rendering to avoid static generation issues
export const dynamic = 'force-dynamic';

export default async function TeachersPage() {
  const user = await requireAdminOrSeniorTeacher();

  // Fetch initial data
  const teachersResult = await getAllTeachers({ limit: 20 });
  const initialTeachers = teachersResult.success ? teachersResult.teachers : [];

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Teacher Management</h1>
          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-green-600" />
            <span className="text-sm text-gray-600">
              {user.role === 'admin' ? 'Administrator' : 
               user.role === 'lead_teacher' ? 'Lead Teacher' : 
               user.role === 'dev' ? 'Developer' : 'Senior Teacher'} Access
            </span>
          </div>
        </div>

        {/* Dynamic Stats Cards */}
        <TeacherStatsCards />

        {/* Teacher Management Component */}
        <TeacherManagement initialTeachers={initialTeachers} />
      </div>
    </div>
  );
}