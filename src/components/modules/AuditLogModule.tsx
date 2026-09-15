import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { storageService } from '../../services/storageService';
import { AuditLog } from '../../types';
import { ShieldAlert, ShieldCheck, Clock, User, Activity } from 'lucide-react';
import { UnauthorizedPage } from '../auth/UnauthorizedPage';

export const AuditLogModule: React.FC = () => {
  const { currentUser, isFounder } = useAuth();

  if (!isFounder) {
    return <UnauthorizedPage moduleName="Audit Logs & System Change History" />;
  }

  const logs = storageService.getAuditLogs(currentUser);

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900">Security & Operational Audit Ledger</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Section 12: Complete tamper-evident log of changes across employee profiles, task assignments, financial entries, and documents.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-brand-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Chronological Audit Trail ({logs.length} events recorded)
            </h3>
          </div>
          <span className="text-[11px] font-mono text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded">
            Immutable Trail Active
          </span>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {logs.map((log) => (
            <div key={log.id} className="p-4 hover:bg-slate-50/70 transition-colors flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">{log.user}</span>
                  <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    {log.action}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">[{log.entity}]</span>
                </div>
                <p className="text-slate-600 leading-relaxed text-[11px]">{log.changeSummary}</p>
              </div>

              <div className="text-right text-[11px] text-slate-400 font-mono shrink-0 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{log.timestamp}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
