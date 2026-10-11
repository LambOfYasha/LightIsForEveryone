import { ModerationResult } from './moderation';
import { AnalyticsService, type ModerationAnalytics } from './analyticsService';
import { AppealService } from './appealSystem';
import { CustomGuidelinesService } from './customGuidelines';

export interface ReportConfig {
  period: 'day' | 'week' | 'month' | 'quarter' | 'year';
  startDate?: string;
  endDate?: string;
  includeDetails: boolean;
  format: 'json' | 'csv' | 'pdf' | 'excel';
  sections: string[];
}

export interface ModerationReport {
  reportId: string;
  generatedAt: string;
  period: string;
  summary: {
    totalModerations: number;
    allowedContent: number;
    flaggedContent: number;
    blockedContent: number;
    moderationRate: number;
    averageConfidence: number;
    totalAppeals: number;
    appealRate: number;
    customGuidelinesUsed: number;
  };
  details: {
    byContentType: ModerationAnalytics['contentTypeBreakdown'];
    byUserRole: ModerationAnalytics['userRoleBreakdown'];
    topFlags: string[];
    timeSeries: Array<{
      date: string;
      total: number;
      allowed: number;
      flagged: number;
      blocked: number;
    }>;
    appeals: {
      total: number;
      pending: number;
      approved: number;
      rejected: number;
      approvalRate: number;
    };
    performance: {
      accuracy: number;
      falsePositives: number;
      falseNegatives: number;
      averageResponseTime: number;
      userSatisfaction: number;
    };
    customGuidelines: {
      total: number;
      active: number;
      byCategory: Record<string, number>;
      averageSuccessRate: number;
    };
  };
  recommendations: Array<{
    type: 'performance' | 'policy' | 'system' | 'guideline';
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
    impact: string;
  }>;
}

export interface ExportFormat {
  type: 'json' | 'csv' | 'pdf' | 'excel';
  data: any;
  filename: string;
}

export class ReportingService {
  /**
   * Generate comprehensive moderation report
   */
  static async generateReport(config: ReportConfig): Promise<ModerationReport> {
    const reportId = `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Get analytics data
    if (config.period === 'quarter' || config.period === 'year') {
      throw new Error(`Analytics does not support the ${config.period} reporting period`);
    }
    const analytics = await AnalyticsService.getModerationAnalytics(config.period);
    const appealStats = await AppealService.getAppealStats();
    const guidelineStats = CustomGuidelinesService.getGuidelineStats();
    const performanceMetrics = await AnalyticsService.getPerformanceMetrics();

    // Calculate summary
    const summary = {
      totalModerations: analytics.totalModerations,
      allowedContent: analytics.allowedContent,
      flaggedContent: analytics.flaggedContent,
      blockedContent: analytics.blockedContent,
      moderationRate: analytics.moderationRate,
      averageConfidence: analytics.averageConfidence,
      totalAppeals: appealStats.total,
      appealRate: analytics.totalModerations > 0 ? (appealStats.total / analytics.totalModerations) * 100 : 0,
      customGuidelinesUsed: guidelineStats.active
    };

    // Generate details
    const details = {
      byContentType: analytics.contentTypeBreakdown,
      byUserRole: analytics.userRoleBreakdown,
      topFlags: analytics.topFlags,
      timeSeries: analytics.timeSeriesData,
      appeals: appealStats,
      performance: performanceMetrics,
      customGuidelines: guidelineStats
    };

    // Generate recommendations
    const recommendations = this.generateRecommendations(summary, details);

    const report: ModerationReport = {
      reportId,
      generatedAt: new Date().toISOString(),
      period: config.period,
      summary,
      details,
      recommendations
    };

    return report;
  }

  /**
   * Generate recommendations based on report data
   */
  private static generateRecommendations(
    summary: ModerationReport['summary'],
    details: ModerationReport['details']
  ): ModerationReport['recommendations'] {
    const recommendations: ModerationReport['recommendations'] = [];

    // Performance recommendations
    if (summary.moderationRate > 15) {
      recommendations.push({
        type: 'performance',
        title: 'High Moderation Rate Detected',
        description: 'The moderation rate is above the recommended threshold. Consider reviewing moderation guidelines.',
        priority: 'high',
        impact: 'Reduces user engagement and increases appeal volume'
      });
    }

    if (summary.averageConfidence < 0.8) {
      recommendations.push({
        type: 'performance',
        title: 'Low Confidence Scores',
        description: 'AI confidence scores are below optimal levels. Consider retraining or adjusting thresholds.',
        priority: 'medium',
        impact: 'May lead to inconsistent moderation decisions'
      });
    }

    // Policy recommendations
    if (summary.appealRate > 5) {
      recommendations.push({
        type: 'policy',
        title: 'High Appeal Rate',
        description: 'Appeal rate is higher than expected. Review moderation policies and guidelines.',
        priority: 'high',
        impact: 'Indicates potential issues with moderation accuracy'
      });
    }

    // System recommendations
    if (details.performance.averageResponseTime > 2) {
      recommendations.push({
        type: 'system',
        title: 'Slow Response Times',
        description: 'Average response time is above target. Consider optimizing API calls or upgrading infrastructure.',
        priority: 'medium',
        impact: 'Affects user experience and system performance'
      });
    }

    // Guideline recommendations
    if (details.customGuidelines.active < 5) {
      recommendations.push({
        type: 'guideline',
        title: 'Limited Custom Guidelines',
        description: 'Consider creating more custom guidelines to improve moderation accuracy.',
        priority: 'low',
        impact: 'Could improve moderation precision for specific content types'
      });
    }

    return recommendations;
  }

  /**
   * Export report in various formats
   */
  static async exportReport(report: ModerationReport, format: string): Promise<ExportFormat> {
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `moderation_report_${report.period}_${timestamp}`;

    switch (format) {
      case 'json':
        return {
          type: 'json',
          data: JSON.stringify(report, null, 2),
          filename: `${filename}.json`
        };

      case 'csv':
        return {
          type: 'csv',
          data: this.convertToCSV(report),
          filename: `${filename}.csv`
        };

      case 'pdf':
        return {
          type: 'pdf',
          data: this.convertToPDF(report),
          filename: `${filename}.pdf`
        };

      case 'excel':
        return {
          type: 'excel',
          data: this.convertToExcel(report),
          filename: `${filename}.xlsx`
        };

      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  /**
   * Convert report to CSV format
   */
  private static convertToCSV(report: ModerationReport): string {
    const lines: string[] = [];
    
    // Summary section
    lines.push('Summary');
    lines.push('Metric,Value');
    lines.push(`Total Moderations,${report.summary.totalModerations}`);
    lines.push(`Allowed Content,${report.summary.allowedContent}`);
    lines.push(`Flagged Content,${report.summary.flaggedContent}`);
    lines.push(`Blocked Content,${report.summary.blockedContent}`);
    lines.push(`Moderation Rate,${report.summary.moderationRate}%`);
    lines.push(`Average Confidence,${(report.summary.averageConfidence * 100).toFixed(1)}%`);
    lines.push(`Total Appeals,${report.summary.totalAppeals}`);
    lines.push(`Appeal Rate,${report.summary.appealRate}%`);
    lines.push('');

    // Content type breakdown
    lines.push('Content Type Breakdown');
    lines.push('Type,Total');
    Object.entries(report.details.byContentType).forEach(([type, data]) => {
      lines.push(`${type},${data}`);
    });
    lines.push('');

    // Top flags
    lines.push('Top Flags');
    lines.push('Flag');
    report.details.topFlags.forEach(flag => {
      lines.push(`${flag}`);
    });

    return lines.join('\n');
  }

  /**
   * Convert report to PDF format (mock implementation)
   */
  private static convertToPDF(report: ModerationReport): any {
    // In a real implementation, you would use a PDF library like jsPDF
    return {
      content: report,
      metadata: {
        title: `Moderation Report - ${report.period}`,
        author: 'AI Moderation System',
        subject: 'Content Moderation Analysis'
      }
    };
  }

  /**
   * Convert report to Excel format (mock implementation)
   */
  private static convertToExcel(report: ModerationReport): any {
    // In a real implementation, you would use a library like xlsx
    return {
      sheets: [
        {
          name: 'Summary',
          data: [
            ['Metric', 'Value'],
            ['Total Moderations', report.summary.totalModerations],
            ['Allowed Content', report.summary.allowedContent],
            ['Flagged Content', report.summary.flaggedContent],
            ['Blocked Content', report.summary.blockedContent],
            ['Moderation Rate', `${report.summary.moderationRate}%`],
            ['Average Confidence', `${(report.summary.averageConfidence * 100).toFixed(1)}%`]
          ]
        },
        {
          name: 'Content Types',
          data: [
            ['Type', 'Total'],
            ...Object.entries(report.details.byContentType).map(([type, data]) => [
              type,
              data
            ])
          ]
        }
      ]
    };
  }

  /**
   * Generate scheduled reports
   */
  static async generateScheduledReport(
    schedule: 'daily' | 'weekly' | 'monthly',
    recipients: string[]
  ): Promise<void> {
    const config: ReportConfig = {
      period: schedule === 'daily' ? 'day' : schedule === 'weekly' ? 'week' : 'month',
      includeDetails: true,
      format: 'pdf',
      sections: ['summary', 'details', 'recommendations']
    };

    const report = await this.generateReport(config);
    
    // In a real implementation, you would:
    // 1. Export the report
    // 2. Send via email to recipients
    // 3. Store in database for archive
    // 4. Send notifications to admins

    console.log(`Scheduled ${schedule} report generated for ${recipients.length} recipients`);
  }

  /**
   * Get report templates
   */
  static getReportTemplates(): Array<{
    id: string;
    name: string;
    description: string;
    config: ReportConfig;
  }> {
    return [
      {
        id: 'executive_summary',
        name: 'Executive Summary',
        description: 'High-level overview for management',
        config: {
          period: 'month',
          includeDetails: false,
          format: 'pdf',
          sections: ['summary', 'recommendations']
        }
      },
      {
        id: 'detailed_analysis',
        name: 'Detailed Analysis',
        description: 'Comprehensive report with all details',
        config: {
          period: 'week',
          includeDetails: true,
          format: 'excel',
          sections: ['summary', 'details', 'recommendations']
        }
      },
      {
        id: 'performance_review',
        name: 'Performance Review',
        description: 'Focus on system performance metrics',
        config: {
          period: 'month',
          includeDetails: true,
          format: 'pdf',
          sections: ['summary', 'performance', 'recommendations']
        }
      }
    ];
  }
} 