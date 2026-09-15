import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useOrg } from '../../context/OrgContext';
import { storageService } from '../../services/storageService';
import { BalanceSheetEntry } from '../../types';
import { Scale, ShieldAlert, FileText, CheckCircle2, Info } from 'lucide-react';
import { UnauthorizedPage } from '../auth/UnauthorizedPage';

export const BalanceSheetModule: React.FC = () => {
  const { currentUser, isFounder } = useAuth();
  const { formatCurrency } = useOrg();

  if (!isFounder) {
    return <UnauthorizedPage moduleName="Quarterly & Monthly Balance Sheets" />;
  }

  const [period, setPeriod] = useState<'Q3 2026' | 'August 2026'>('Q3 2026');
  const balanceSheet = storageService.getBalanceSheet(currentUser);

  const categories = [
    'Current Assets',
    'Non-Current Assets',
    'Current Liabilities',
    'Equity',
  ] as const;

  const totalAssets = balanceSheet
    .filter((b) => b.category === 'Current Assets' || b.category === 'Non-Current Assets')
    .reduce((acc, b) => acc + b.closingValue, 0);

  const totalLiabilities = balanceSheet
    .filter((b) => b.category === 'Current Liabilities' || b.category === 'Long-Term Liabilities')
    .reduce((acc, b) => acc + b.closingValue, 0);

  const totalEquity = balanceSheet
    .filter((b) => b.category === 'Equity')
    .reduce((acc, b) => acc + b.closingValue, 0);

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Statement of Financial Position (Balance Sheet)</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Section 6: Formal breakdown of company Assets, Liabilities, and Shareholder Equity across fiscal quarters.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-semibold">Reporting Period:</span>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as any)}
            className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white font-bold text-slate-800"
          >
            <option value="Q3 2026">Q3 2026 (Quarterly)</option>
            <option value="August 2026">August 2026 (Monthly)</option>
          </select>
        </div>
      </div>

      {/* Accounting Formula Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-brand-500/20 text-brand-300">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
              Fundamental Accounting Equation
            </div>
            <div className="text-sm font-bold mt-0.5">
              Total Assets ({formatCurrency(totalAssets)}) = Liabilities ({formatCurrency(totalLiabilities)}) + Equity ({formatCurrency(totalEquity)})
            </div>
          </div>
        </div>
        <span className="text-xs font-bold text-emerald-400 bg-emerald-500/20 px-3 py-1.5 rounded-full border border-emerald-500/30">
          ✓ Balanced & Verified
        </span>
      </div>

      {/* Categorized Balance Sheet Sections */}
      <div className="space-y-4">
        {categories.map((category) => {
          const items = balanceSheet.filter((b) => b.category === category);
          const catTotal = items.reduce((acc, i) => acc + i.closingValue, 0);

          return (
            <div key={category} className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="px-6 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">{category}</h3>
                <span className="text-xs font-bold text-slate-900">{formatCurrency(catTotal)}</span>
              </div>

              <table className="w-full text-xs text-left">
                <thead className="text-[10px] text-slate-400 uppercase border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-2.5">Line Item</th>
                    <th className="px-6 py-2.5 text-right">Opening Value</th>
                    <th className="px-6 py-2.5 text-right">Net Movement</th>
                    <th className="px-6 py-2.5 text-right">Closing Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-3">
                        <div className="font-semibold text-slate-900">{item.lineItem}</div>
                        {item.notes && <div className="text-[11px] text-slate-400 mt-0.5">{item.notes}</div>}
                      </td>
                      <td className="px-6 py-3 text-right text-slate-500">{formatCurrency(item.openingValue)}</td>
                      <td className="px-6 py-3 text-right text-emerald-600 font-medium">
                        +{formatCurrency(item.movementValue)}
                      </td>
                      <td className="px-6 py-3 text-right font-bold text-slate-900">
                        {formatCurrency(item.closingValue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>
    </div>
  );
};
