import { requireAdminOrTeacher } from "@/lib/auth/middleware";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Brain,
  Shield,
  Settings,
  FileText,
  Bell,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  Activity,
  BarChart3,
  Download,
  Plus,
  Trash2,
  Edit,
  Eye,
  RefreshCw
} from "lucide-react";
import { CustomGuidelinesService } from "@/lib/ai/customGuidelines";
import { NotificationsService } from "@/lib/ai/notificationsService";
import { ReportingService } from "@/lib/ai/reportingService";
import { AnalyticsService } from "@/lib/ai/analyticsService";
import GuidelineManager from "@/components/manage/guideline-manager";
import NotificationManager from "@/components/manage/notification-manager";
import ReportManager from "@/components/manage/report-manager";
import TestNotificationButton from "@/components/ui/test-notification-button";

// Force dynamic rendering to avoid static generation issues
export const dynamic = 'force-dynamic';

export default async function AdvancedModerationDashboard() {
  const user = await requireAdminOrTeacher();

  // Initialize services
  CustomGuidelinesService.initializeDefaultGuidelines();
  NotificationsService.initializeTemplates();

  // Fetch live data
  const [customGuidelines, notifications, analytics, guidelineStats] = await Promise.all([
    CustomGuidelinesService.getActiveGuidelines(),
    NotificationsService.getUserNotifications(user._id, 50, false),
    AnalyticsService.getModerationAnalytics('week'),
    CustomGuidelinesService.getGuidelineStats()
  ]);

  // Get notification stats
  const notificationStats = await NotificationsService.getUserNotificationStats(user._id);

  // Get report templates
  const reportTemplates = ReportingService.getReportTemplates();

  // Calculate system health based on analytics
  const systemHealth = analytics.averageConfidence > 0.8 ? 'Healthy' : 
                      analytics.averageConfidence > 0.6 ? 'Warning' : 'Critical';

  const healthColor = systemHealth === 'Healthy' ? 'text-green-600' : 
                     systemHealth === 'Warning' ? 'text-yellow-600' : 'text-red-600';

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Advanced Moderation Dashboard</h1>
              <p className="text-gray-600 mt-2">
                Advanced AI-powered content moderation with custom guidelines, real-time notifications, and comprehensive reporting
              </p>
            </div>
            <div className="flex gap-2">
              <TestNotificationButton />
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Guidelines</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{guidelineStats.active}</div>
              <p className="text-xs text-muted-foreground">
                {guidelineStats.total} total guidelines
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unread Notifications</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{notificationStats.unread}</div>
              <p className="text-xs text-muted-foreground">
                {notificationStats.total} total notifications
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">AI Confidence</CardTitle>
              <Brain className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(analytics.averageConfidence * 100).toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                Average decision confidence
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Health</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${healthColor}`}>{systemHealth}</div>
              <p className="text-xs text-muted-foreground">
                Based on AI performance
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard */}
        <Tabs defaultValue="guidelines" className="space-y-6">
          <TabsList>
            <TabsTrigger value="guidelines">Custom Guidelines</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="guidelines" className="space-y-6">
            <GuidelineManager initialGuidelines={customGuidelines} />
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <NotificationManager initialNotifications={notifications} />
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <ReportManager 
              initialTemplates={reportTemplates}
              initialAnalytics={analytics}
            />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    AI Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="confidence-threshold">Confidence Threshold</Label>
                    <Input
                      id="confidence-threshold"
                      type="number"
                      min="0"
                      max="1"
                      step="0.1"
                      defaultValue="0.8"
                    />
                  </div>
                  <div>
                    <Label htmlFor="response-time">Max Response Time (seconds)</Label>
                    <Input
                      id="response-time"
                      type="number"
                      min="1"
                      max="10"
                      defaultValue="3"
                    />
                  </div>
                  <div>
                    <Label htmlFor="batch-size">Bulk Operation Batch Size</Label>
                    <Select defaultValue="10">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 items</SelectItem>
                        <SelectItem value="10">10 items</SelectItem>
                        <SelectItem value="20">20 items</SelectItem>
                        <SelectItem value="50">50 items</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button className="w-full">Save Configuration</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Notification Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Notification Types</Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="moderation-notifications" defaultChecked />
                        <Label htmlFor="moderation-notifications">Moderation Events</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="appeal-notifications" defaultChecked />
                        <Label htmlFor="appeal-notifications">Appeal Updates</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="system-notifications" defaultChecked />
                        <Label htmlFor="system-notifications">System Alerts</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="report-notifications" />
                        <Label htmlFor="report-notifications">Report Generation</Label>
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="notification-frequency">Notification Frequency</Label>
                    <Select defaultValue="realtime">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="realtime">Real-time</SelectItem>
                        <SelectItem value="hourly">Hourly digest</SelectItem>
                        <SelectItem value="daily">Daily digest</SelectItem>
                        <SelectItem value="weekly">Weekly digest</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button className="w-full">Save Settings</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 