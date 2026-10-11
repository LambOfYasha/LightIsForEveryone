'use server';

import { auth } from '@clerk/nextjs/server';
import { getUser } from '@/lib/user/getUser';
import { ReportingService } from '@/lib/ai/reportingService';

export async function generateReport(config: any) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error('Unauthorized');
    }

    const userResult = await getUser();
    if ('error' in userResult) {
      throw new Error('User not found');
    }

    if (userResult.role !== 'admin' && userResult.role !== 'teacher' && userResult.role !== 'junior_teacher' && userResult.role !== 'senior_teacher' && userResult.role !== 'lead_teacher') {
      throw new Error('Insufficient permissions');
    }

    const report = await ReportingService.generateReport(config);
    return { success: true, report };
  } catch (error: any) {
    console.error('Generate report error:', error);
    return { success: false, error: error.message };
  }
}

export async function exportReport(reportId: string, format: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error('Unauthorized');
    }

    const userResult = await getUser();
    if ('error' in userResult) {
      throw new Error('User not found');
    }

    if (userResult.role !== 'admin' && userResult.role !== 'teacher' && userResult.role !== 'junior_teacher' && userResult.role !== 'senior_teacher' && userResult.role !== 'lead_teacher') {
      throw new Error('Insufficient permissions');
    }

    // In a real implementation, you would fetch the report by ID
    // For now, we'll create a mock report
    const mockReport = {
      reportId,
      generatedAt: new Date().toISOString(),
      period: 'week',
      summary: {
        totalModerations: 150,
        allowedContent: 120,
        flaggedContent: 20,
        blockedContent: 10,
        moderationRate: 20,
        averageConfidence: 0.85,
        totalAppeals: 5,
        appealRate: 3.3,
        customGuidelinesUsed: 3
      },
      details: {
        byContentType: { post: 80, comment: 70, response: 0, blog: 0, community: 0 },
        byUserRole: { user: 120, teacher: 30, admin: 0 },
        topFlags: ['spam', 'inappropriate', 'offensive'],
        timeSeries: [
          { date: '2024-01-01', total: 20, allowed: 16, flagged: 3, blocked: 1 },
          { date: '2024-01-02', total: 25, allowed: 20, flagged: 4, blocked: 1 },
          { date: '2024-01-03', total: 30, allowed: 24, flagged: 5, blocked: 1 }
        ],
        appeals: {
          total: 5,
          pending: 2,
          approved: 2,
          rejected: 1,
          approvalRate: 40
        },
        performance: {
          accuracy: 0.92,
          falsePositives: 3,
          falseNegatives: 2,
          averageResponseTime: 1.5,
          userSatisfaction: 0.88
        },
        customGuidelines: {
          total: 5,
          active: 3,
          byCategory: {},
          averageSuccessRate: 0.87
        }
      },
      recommendations: [
        {
          type: 'performance' as const,
          title: 'High Moderation Rate Detected',
          description: 'The moderation rate is above the recommended threshold. Consider reviewing moderation guidelines.',
          priority: 'high' as const,
          impact: 'Reduces user engagement and increases appeal volume'
        }
      ]
    };

    const exportData = await ReportingService.exportReport(mockReport, format);
    return { success: true, exportData };
  } catch (error: any) {
    console.error('Export report error:', error);
    return { success: false, error: error.message };
  }
}

export async function getReportTemplates() {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error('Unauthorized');
    }

    const userResult = await getUser();
    if ('error' in userResult) {
      throw new Error('User not found');
    }

    if (userResult.role !== 'admin' && userResult.role !== 'teacher' && userResult.role !== 'junior_teacher' && userResult.role !== 'senior_teacher' && userResult.role !== 'lead_teacher') {
      throw new Error('Insufficient permissions');
    }

    const templates = ReportingService.getReportTemplates();
    return { success: true, templates };
  } catch (error: any) {
    console.error('Get report templates error:', error);
    return { success: false, error: error.message };
  }
}

export async function scheduleReport(schedule: 'daily' | 'weekly' | 'monthly', recipients: string[]) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error('Unauthorized');
    }

    const userResult = await getUser();
    if ('error' in userResult) {
      throw new Error('User not found');
    }

    if (userResult.role !== 'admin' && userResult.role !== 'teacher' && userResult.role !== 'junior_teacher' && userResult.role !== 'senior_teacher' && userResult.role !== 'lead_teacher') {
      throw new Error('Insufficient permissions');
    }

    await ReportingService.generateScheduledReport(schedule, recipients);
    return { success: true };
  } catch (error: any) {
    console.error('Schedule report error:', error);
    return { success: false, error: error.message };
  }
} 