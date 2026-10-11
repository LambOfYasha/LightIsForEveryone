import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import ts from 'typescript';

// Run the real modules with isolated provider boundaries; no live data or credentials.
function loadModule(relativePath, dependencies, extraGlobals = {}) {
  const source = fs.readFileSync(path.join(import.meta.dirname, '..', relativePath), 'utf8');
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const loadedModule = { exports: {} };
  vm.runInNewContext(compiled, {
    exports: loadedModule.exports, module: loadedModule,
    require(name) {
      assert.ok(name in dependencies, `Unexpected dependency: ${name}`);
      return dependencies[name];
    },
    console: { log() {}, error() {} }, ...extraGlobals,
  }, { filename: relativePath });
  return loadedModule.exports;
}
function authModule(identity, user, failure) {
  return loadModule('lib/auth/middleware.ts', {
    '@clerk/nextjs/server': { auth: async () => {
      if (failure) throw failure;
      return { userId: identity };
    } },
    'next/navigation': { redirect(destination) { throw new Error(`redirect:${destination}`); } },
    '../user/getUser': { getUser: async () => user },
    './roles': { hasRoleOrHigher: () => false, hasPermission: () => false },
  }, { process: { env: { NODE_ENV: 'production', VERCEL_ENV: 'production' } } });
}
test('production guests stay unauthenticated and guards never fabricate users', async () => {
  const auth = authModule(null);
  assert.equal(await auth.getCurrentUser(), null);
  for (const guard of [() => auth.requireRole('admin'), () => auth.requirePermission('canManageUsers'),
    auth.requireAdminOrTeacher, auth.requireAdminOrSeniorTeacher, auth.requireAdminOrLeadTeacher]) {
    await assert.rejects(guard, /redirect:\/sign-in/);
  }
});
test('provider failures and missing local records do not authenticate visitors', async () => {
  assert.equal(await authModule(null, null, new Error('Provider unavailable')).getCurrentUser(), null);
  assert.equal(await authModule('signed-in-id', { error: 'Record unavailable' }).getCurrentUser(), null);
  const user = { _id: 'local-id', username: 'Member', role: 'member', imageURL: '' };
  assert.equal(await authModule('signed-in-id', user).getCurrentUser(), user);
});
function reportingModule() {
  return loadModule('lib/ai/reportingService.ts', {
    './analyticsService': { AnalyticsService: {
      getModerationAnalytics: async () => ({ totalModerations: 100, allowedContent: 80, flaggedContent: 15,
        blockedContent: 5, moderationRate: 20, averageConfidence: 0.9,
        contentTypeBreakdown: { post: 100, response: 0, comment: 0, blog: 0, community: 0 },
        userRoleBreakdown: { user: 100, teacher: 0, admin: 0 }, topFlags: ['spam'], timeSeriesData: [] }),
      getPerformanceMetrics: async () => ({ averageResponseTime: 1 }),
    } },
    './appealSystem': { AppealService: { getAppealStats: async () => ({ total: 10, pending: 2,
      approved: 6, rejected: 2, approvalRate: 60 }) } },
    './customGuidelines': { CustomGuidelinesService: { getGuidelineStats: () => ({ total: 3, active: 2,
      byCategory: { spam: 3 }, averageSuccessRate: 0.8 }) } },
  }).ReportingService;
}
test('reports preserve counts and distinguish appeal rate from approval rate', async () => {
  const service = reportingModule();
  const report = await service.generateReport({ period: 'week' });
  assert.equal(report.summary.appealRate, 10);
  assert.equal(report.details.appeals.approvalRate, 60);
  assert.equal(report.details.byContentType.post, 100);
  assert.equal(report.details.topFlags[0], 'spam');
  const csv = await service.exportReport(report, 'csv');
  assert.match(csv.data, /Type,Total\npost,100/);
  assert.doesNotMatch(csv.data, /undefined|NaN/);
  const excel = await service.exportReport(report, 'excel');
  assert.equal(excel.data.sheets[1].data[1][1], 100);
});
test('unsupported reporting periods fail instead of reporting a different period', async () => {
  for (const period of ['quarter', 'year']) {
    await assert.rejects(() => reportingModule().generateReport({ period }), /does not support/);
  }
});
