import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  TrendingUp, 
  MessageSquare, 
  Plus,
  Activity,
  Shield
} from "lucide-react";
import Link from "next/link";
import CreateCommunityButton from "@/components/header/CreateCommunityButton";
import CommunityManagement from "@/components/manage/community-management";

export default async function AdminCommunitiesPage() {
  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Community Management</h1>
            <p className="text-gray-600">Manage communities, moderators, and community settings</p>
          </div>
          <div className="flex gap-2">
            <CreateCommunityButton />
            <Link href="/manage/communities/analytics">
              <Button variant="outline">
                <Activity className="w-4 h-4 mr-2" />
                Analytics
              </Button>
            </Link>
          </div>
        </div>

        {/* Community Management Component */}
        <CommunityManagement />
      </div>
    </div>
  );
} 