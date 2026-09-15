import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useOrg } from '../../context/OrgContext';
import { storageService } from '../../services/storageService';
import { GrowthMetric } from '../../types';
import { TrendingUp, ArrowUpRight, BarChart3, Calendar, Layers, ShieldAlert } from 'lucide-react';
import { UnauthorizedPage } from '../auth/UnauthorizedPage';

export const GrowthModule: React.FC = () => {
  const { currentUser, isFounder } = useAuth();
  const { formatCurrency } = useOrg();

  if (!isFounder) {
    return <UnauthorizedPage moduleName="Company Growth & Trajectory Analytics" />;
  }

  const [timeframe, setTimeframe] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
  const metrics: GrowthMetric[] = storageService.getGrowthMetrics(currentUser) as GrowthMetric[];

  const quarterlyData = [
    { period: 'Q4 2025', revenue: 115000, burnRate: 48000, netMargin: 67000, growthPercentage: 14.2 },
    { period: 'Q1 2026', revenue: 138000, burnRate: 52000, netMargin: 86000, growthPercentage: 20.0 },
    { period: 'Q2 2026', revenue: 165000, burnRate: 58000, netMargin: 107000, growthPercentage: 19.5 },
    { period: 'Q3 2026 (Est.)', revenue: 205000, burnRate: 64000, netMargin: 141000, growthPercentage: 24.2 },
  ];

  const yearlyData = [
    { period: 'FY 2024', revenue: 320000, burnRate: 150000, netMargin: 170000, growthPercentage: 45.0 },
    { period: 'FY 2025', revenue: 540000, burnRate: 210000, netMargin: 330000, growthPercentage: 68.7 },
    { period: 'FY 2026 (Paced)', revenue: 780000, burnRate: 270000, netMargin: 510000, growthPercentage: 44.4 },
  ];

  const activeSet =
    timeframe === 'monthly' ? metrics : timeframe === 'quarterly' ? quarterlyData : yearlyData;

  const maxRevenue = Math.max(...activeSet.map((d) => d.revenue));

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Company Growth & Trajectory Analytics</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Section 6: Track monthly, quarterly, and annual revenue expansion and net margins.
          </p>
        </div>

        {/* Timeframe Selector */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
          {(['monthly', 'quarterly', 'yearly'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setTimeframe(mode)}
              className={`px-3.5 py-1.5 rounded-lg font-semibold capitalize transition-all cursor-pointer ${
                timeframe === mode ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Visual Chart Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 capitalize">{timeframe} Revenue & Expansion Curve</h3>
              <p className="text-xs text-slate-500">Visual comparison across periods</p>
            </div>
          </div>
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            +21.4% Overall Trend
          </span>
        </div>

        {/* Bar Visualizer */}
        <div className="space-y-5 pt-2">
          {activeSet.map((item) => {
            const barWidth = Math.round((item.revenue / maxRevenue) * 100);
            return (
              <div key={item.period} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">{item.period}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-500 text-[11px]">
                      Burn: {formatCurrency(item.burnRate)}
                    </span>
                    <span className="font-bold text-slate-900 text-sm">
                      {formatCurrency(item.revenue)}
                    </span>
                    <span className="text-emerald-700 font-bold text-[10px] bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                      <ArrowUpRight className="w-3 h-3" /> +{item.growthPercentage}%
                    </span>
                  </div>
                </div>

                <div className="w-full bg-slate-100 h-4 rounded-xl overflow-hidden p-0.5">
                  <div
                    className="bg-brand-600 h-full rounded-lg transition-all duration-700"
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Numerical Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Traceable Financial Values ({timeframe})
          </h3>
        </div>

        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
            <tr>
              <th className="px-6 py-3">Reporting Period</th>
              <th className="px-6 py-3 text-right">Gross Revenue</th>
              <th className="px-6 py-3 text-right">Operating Burn</th>
              <th className="px-6 py-3 text-right">Net Operating Margin</th>
              <th className="px-6 py-3 text-right">Growth Rate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {activeSet.map((row) => (
              <tr key={row.period} className="hover:bg-slate-50/60 transition-colors">
                <td className="px-6 py-3.5 font-bold text-slate-900">{row.period}</td>
                <td className="px-6 py-3.5 text-right font-bold text-slate-900">{formatCurrency(row.revenue)}</td>
                <td className="px-6 py-3.5 text-right text-rose-600">{formatCurrency(row.burnRate)}</td>
                <td className="px-6 py-3.5 text-right text-emerald-700 font-bold">
                  {formatCurrency(row.netMargin)}
                </td>
                <td className="px-6 py-3.5 text-right font-bold text-emerald-600">+{row.growthPercentage}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
