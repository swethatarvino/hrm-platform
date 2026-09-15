import React from 'react';
import { ShieldAlert, ArrowLeft, ShieldCheck, LogOut } from 'lucide-react';
import { Button } from '../ui/Button';
import { useAuth } from '../../context/AuthContext';

export interface UnauthorizedPageProps {
  moduleName?: string;
  onReturn?: () => void;
}

export const UnauthorizedPage: React.FC<UnauthorizedPageProps> = ({
  moduleName = 'restricted management resource',
  onReturn,
}) => {
  const { currentUser, role, logout } = useAuth();

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white rounded-3xl border border-rose-200 shadow-xl p-8 text-center space-y-6 animate-in fade-in zoom-in-95 duration-150">
        {/* Shield Icon Badge */}
        <div className="w-16 h-16 rounded-3xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-xs">
          <ShieldAlert className="w-9 h-9" />
        </div>

        {/* Title & Explanation */}
        <div className="space-y-2">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
            HTTP 403 Forbidden
          </span>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Unauthorized Access Attempt
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
            You are currently signed in as <strong className="text-slate-900">{currentUser.name}</strong> with the{' '}
            <span className="font-bold text-slate-800 uppercase">[{role}]</span> role. You do not have permission to access{' '}
            <strong className="text-rose-700">{moduleName}</strong>.
          </p>
        </div>

        {/* Security Policy Reminder */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs space-y-1.5 text-slate-600">
          <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider block">
            HRM Security & Authorization Rule (Section 2 & 12)
          </span>
          <p className="text-[11px] text-slate-500 leading-normal">
            Employees are restricted from accessing executive financial ledgers, company growth data, balance sheet
            records, audit trails, and other employees' private records. Backend authorization enforced this block and logged the event to the audit ledger.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          {onReturn && (
            <Button variant="primary" size="sm" leftIcon={<ArrowLeft className="w-3.5 h-3.5" />} onClick={onReturn}>
              Return to Dashboard
            </Button>
          )}

          <Button variant="outline" size="sm" leftIcon={<LogOut className="w-3.5 h-3.5 text-rose-500" />} onClick={logout}>
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
};
