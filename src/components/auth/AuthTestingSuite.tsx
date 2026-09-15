import React, { useState, useEffect } from 'react';
import { PageHeader } from '../ui/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useAuth } from '../../context/AuthContext';
import { runAuthTestSuite, TestResult } from '../../services/__tests__/auth.test';
import { storageService } from '../../services/storageService';
import { AuthorizationError } from '../../services/authService';
import {
  ShieldCheck,
  ShieldAlert,
  Play,
  CheckCircle2,
  XCircle,
  Clock,
  Lock,
  UserCheck,
  KeyRound,
  AlertTriangle,
} from 'lucide-react';

export const AuthTestingSuite: React.FC = () => {
  const { currentUser, role, login } = useAuth();
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [simulationLog, setSimulationLog] = useState<string | null>(null);

  const runAllTests = async () => {
    setIsRunning(true);
    const testResults = await runAuthTestSuite();
    setResults(testResults);
    setIsRunning(false);
  };

  useEffect(() => {
    runAllTests();
  }, []);

  const handleSimulateRestrictedCall = () => {
    try {
      setSimulationLog(null);
      // Attempt to access Founder-only finance transactions
      storageService.getFinanceTransactions(currentUser);
      setSimulationLog('Success: Request authorized (Caller is Founder/Director).');
    } catch (err: any) {
      if (err instanceof AuthorizationError) {
        setSimulationLog(
          `BLOCKED BY BACKEND RBAC [${err.statusCode} ${err.code}]: "${err.message}". Security violation logged to Director Audit Ledger.`
        );
      } else {
        setSimulationLog(`Error: ${err.message}`);
      }
    }
  };

  const allPassed = results.length > 0 && results.every((r) => r.status === 'passed');

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <PageHeader
        title="Module 1: Authentication & Authorization Verification Suite"
        description="Verify role-based access control, salted password hashing, admin employee creation, and access isolation between Founder and Employees."
        breadcrumbs={[
          { label: 'HRM Platform' },
          { label: 'Security & Auth' },
          { label: 'Verification Suite', active: true },
        ]}
        badge={
          <Badge variant={allPassed ? 'success' : 'warning'} size="md" withDot>
            {allPassed ? `All ${results.length} Security Tests Passed` : 'Tests Pending'}
          </Badge>
        }
        actions={
          <Button
            variant="primary"
            size="sm"
            isLoading={isRunning}
            leftIcon={<Play className="w-3.5 h-3.5 fill-white" />}
            onClick={runAllTests}
          >
            Run All Security Tests
          </Button>
        }
      />

      {/* Active Session & Seed Credentials Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-brand-200 bg-brand-50/20">
          <CardHeader>
            <CardTitle>Active Test Session</CardTitle>
            <CardDescription>Current identity & role</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2.5">
              <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-9 h-9 rounded-full object-cover" />
              <div>
                <div className="text-xs font-bold text-slate-900">{currentUser.name}</div>
                <div className="text-[11px] text-slate-500">{currentUser.email}</div>
              </div>
            </div>
            <div className="pt-2">
              <Badge variant={role === 'FOUNDER_DIRECTOR' ? 'brand' : 'info'} size="sm" withDot>
                {role}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Verified Salted Credentials Matrix</CardTitle>
            <CardDescription>Passwords are stored as salted SHA-256 hashes in database</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100 text-xs">
              <div className="p-3 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900">Shwetha (Managing Director & Admin)</span>
                  <span className="text-slate-500 block text-[11px]">shwetha@apextech.io • Role: FOUNDER_DIRECTOR</span>
                </div>
                <Button variant="outline" size="xs" onClick={() => login('shwetha@apextech.io', 'Password@123')}>
                  Authenticate as Shwetha
                </Button>
              </div>
              <div className="p-3 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900">David Miller (Employee)</span>
                  <span className="text-slate-500 block text-[11px]">david.miller@apextech.io • Role: EMPLOYEE</span>
                </div>
                <Button variant="outline" size="xs" onClick={() => login('david.miller@apextech.io', 'Password@123')}>
                  Authenticate as David
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Test Results Table */}
      <Card>
        <CardHeader>
          <CardTitle>Automated Security Test Results (6 of 6 Required Criteria)</CardTitle>
          <CardDescription>
            Validates token verification, 401 unauthenticated blocks, and 403 forbidden data isolation.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100">
            {results.map((t) => (
              <div key={t.id} className="p-4 flex items-start justify-between gap-4 hover:bg-slate-50/60 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0">
                    {t.status === 'passed' ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-rose-600" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold text-slate-400">[{t.id}]</span>
                      <h4 className="text-xs font-bold text-slate-900">{t.name}</h4>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5">{t.message}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {t.durationMs}ms
                  </span>
                  <Badge variant={t.status === 'passed' ? 'success' : 'error'} size="sm">
                    {t.status.toUpperCase()}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Live Backend Enforcement Simulator */}
      <Card className="border-slate-300">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-brand-600" />
            <CardTitle>Live Backend Authorization Simulator</CardTitle>
          </div>
          <CardDescription>
            Click below to execute a protected backend API call (<code className="text-[11px] font-mono text-brand-700">getFinanceTransactions()</code>) as the current user.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Button variant="primary" size="sm" onClick={handleSimulateRestrictedCall}>
              Trigger Protected Finance API Call
            </Button>
            <span className="text-xs text-slate-500">
              Active Role: <strong className="text-slate-800">{role}</strong>
            </span>
          </div>

          {simulationLog && (
            <div
              className={`p-4 rounded-xl border text-xs font-mono leading-relaxed animate-in fade-in duration-150 ${
                simulationLog.startsWith('BLOCKED')
                  ? 'bg-rose-50 border-rose-200 text-rose-900'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-900'
              }`}
            >
              {simulationLog}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
