import PageManagement from '@/components/manage/page-management';
import { requireRole } from '@/lib/auth/middleware';

export const dynamic = 'force-dynamic';

export default async function AdminPagesPage() {
  await requireRole('dev');

  return (
    <div className="p-6">
      <div className="mx-auto max-w-7xl">
        <PageManagement />
      </div>
    </div>
  );
}
