import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useOrg } from '../../context/OrgContext';
import { storageService } from '../../services/storageService';
import { Task, User, RoadmapItem, FinanceTransaction, GrowthMetric, BalanceSheetEntry } from '../../types';
import {
  Users,
  Kanban,
  Milestone,
  DollarSign,
  TrendingUp,
  Scale,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
} from 'lucide-react';

interface FounderDashboardProps {
  onNavigate: (tabId: string) => void;
}

export const FounderDashboard: React.FC<FounderDashboardProps> = ({ onNavigate }) => {
  const { currentUser } = useAuth();
  const { formatCurrency } = useOrg();

  const [employees, setEmployees] = useState<User[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [roadmap, setRoadmap] = useState<RoadmapItem[]>([]);
  const [finances, setFinances] = useState<FinanceTransaction[]>([]);
  const [growth, setGrowth] = useState<GrowthMetric[]>([]);
  const [balanceSheet, setBalanceSheet] = useState<BalanceSheetEntry[]>([]);

  useEffect(() => {
    try {
      setEmployees(storageService.getUsers());
      setTasks(storageService.getAllTasksAdmin(currentUser));
      setRoadmap(storageService.getRoadmap());
      setFinances(storageService.getFinanceTransactions(currentUser));
      setGrowth(storageService.getGrowthMetrics(currentUser) as GrowthMetric[]);
      setBalanceSheet(storageService.getBalanceSheet(currentUser));
    } catch (e) {
      console.error('Error loading founder dashboard data', e);
    }
  }, [currentUser]);

  // Calculations
  const totalTasks = tasks.length;
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress').length;
  const blockedTasks = tasks.filter((t) => t.status === 'blocked').length;
  const completedTasks = tasks.filter((t) => t.status === 'completed').length;

  const totalInflow = finances
    .filter((f) => f.type === 'inflow')
    .reduce((acc, f) => acc + f.amount, 0);

  const totalOutflow = finances
    .filter((f) => f.type === 'outflow')
    .reduce((acc, f) => acc + f.amount, 0);

  const totalInvestments = finances
    .filter((f) => f.type === 'investment')
    .reduce((acc, f) => acc + f.amount, 0);

  const netCashflow = totalInflow - totalOutflow;

  return (
    <div className="space-y-6">
      {/* Executive Welcome & Key Summary Cards */}
      <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-indigo-950 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold tracking-wider uppercase px-3 py-1 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30">
            Admin & Managing Director Cockpit
          </span>
          <h1 className="text-2xl sm:text-3xl font-black mt-2 tracking-tight">Executive Overview: {currentUser.name}</h1>
          <p className="text-xs text-slate-300 mt-1">
            Complete team visibility, cross-company task oversight, and administrative control.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('tasks')}
            className="px-4 py-2.5 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-pink-500/25"
          >
            <Kanban className="w-4 h-4" /> Team Tasks Matrix
          </button>
          <button
            onClick={() => onNavigate('employees')}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
          >
            <Users className="w-4 h-4" /> Employee Directory
          </button>
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Total Team Headcount</span>
            <Users className="w-4 h-4 text-brand-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{employees.length}</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">100% Active Profiles</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Total Inflow (Q3)</span>
            <ArrowUpRight className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-700 mt-1">{formatCurrency(totalInflow)}</div>
          <div className="text-[11px] text-slate-500 mt-1">Client retainers & SaaS</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Net Operating Cash</span>
            <DollarSign className="w-4 h-4 text-brand-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{formatCurrency(netCashflow)}</div>
          <div className="text-[11px] text-slate-500 mt-1">After outflows & burn</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Investments Capitalized</span>
            <TrendingUp className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-purple-700 mt-1">{formatCurrency(totalInvestments)}</div>
          <div className="text-[11px] text-slate-500 mt-1">Hardware & R&D Assets</div>
        </div>
      </div>

      {/* Grid: 7 Core Modules from Section 7 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Widget: Work Summary (Total / in-progress / blocked / completed) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs lg:col-span-1">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-blue-50 text-brand-600">
                <Kanban className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Work Summary</h3>
            </div>
            <button
              onClick={() => onNavigate('team-work')}
              className="text-xs text-brand-600 hover:text-brand-700 font-semibold flex items-center gap-1 cursor-pointer"
            >
              Matrix <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2.5">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
              <span className="text-xs text-slate-500 block">Total Tasks</span>
              <span className="text-xl font-bold text-slate-900">{totalTasks}</span>
            </div>
            <div className="bg-blue-50 p-3 rounded-xl border border-blue-100 text-center">
              <span className="text-xs text-blue-600 block">In Progress</span>
              <span className="text-xl font-bold text-blue-700">{inProgressTasks}</span>
            </div>
            <div className="bg-rose-50 p-3 rounded-xl border border-rose-100 text-center">
              <span className="text-xs text-rose-600 block">Blocked</span>
              <span className="text-xl font-bold text-rose-700">{blockedTasks}</span>
            </div>
            <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100 text-center">
              <span className="text-xs text-emerald-600 block">Completed</span>
              <span className="text-xl font-bold text-emerald-700">{completedTasks}</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mb-2">
              Recent Blocked or Urgent Work:
            </div>
            {tasks
              .filter((t) => t.status === 'blocked' || t.priority === 'urgent')
              .slice(0, 2)
              .map((t) => (
                <div key={t.id} className="p-2 rounded-lg bg-rose-50/50 border border-rose-200 text-xs mb-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900 truncate">{t.title}</span>
                    <span className="text-[10px] font-bold text-rose-700 uppercase">{t.status}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">Assignee: {t.assigneeName}</div>
                </div>
              ))}
          </div>
        </div>

        {/* Widget: Roadmap / Future Milestones */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
                <Milestone className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Upcoming Roadmap & Milestones
              </h3>
            </div>
            <button
              onClick={() => onNavigate('roadmap')}
              className="text-xs text-brand-600 hover:text-brand-700 font-semibold flex items-center gap-1 cursor-pointer"
            >
              Manage Roadmap <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {roadmap.slice(0, 3).map((item) => (
              <div key={item.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{item.title}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      item.status === 'in_progress'
                        ? 'bg-blue-100 text-blue-700'
                        : item.status === 'at_risk'
                        ? 'bg-rose-100 text-rose-700'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {item.status.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-slate-600 text-[11px] mt-1 line-clamp-1">{item.description}</p>
                <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
                  <span>Target Date: {item.targetDate}</span>
                  <span className="font-semibold capitalize text-brand-600">Priority: {item.priority}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Widget: Company Growth Graph */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                <TrendingUp className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Company Growth & Revenue Trajectory
              </h3>
            </div>
            <button
              onClick={() => onNavigate('growth')}
              className="text-xs text-brand-600 hover:text-brand-700 font-semibold flex items-center gap-1 cursor-pointer"
            >
              Full Analytics <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="mt-4">
            {/* Visual Bar Representation of Monthly Growth */}
            <div className="space-y-3">
              {growth.slice(0, 4).map((g) => {
                const percentageWidth = Math.min(100, Math.round((g.revenue / 75000) * 100));
                return (
                  <div key={g.period} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-800">{g.period}</span>
                      <span className="font-bold text-slate-900">
                        {formatCurrency(g.revenue)}{' '}
                        <span className="text-emerald-600 text-[10px]">+{g.growthPercentage}%</span>
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-brand-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${percentageWidth}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Widget: Balance Sheet Snapshot */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs lg:col-span-1">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
                <Scale className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Balance Sheet</h3>
            </div>
            <button
              onClick={() => onNavigate('balance-sheet')}
              className="text-xs text-brand-600 hover:text-brand-700 font-semibold flex items-center gap-1 cursor-pointer"
            >
              View Statement <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="mt-4 space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="text-[11px] text-slate-500 font-medium">Total Current Assets</div>
              <div className="text-lg font-bold text-slate-900 mt-0.5">
                {formatCurrency(
                  balanceSheet
                    .filter((b) => b.category === 'Current Assets')
                    .reduce((acc, b) => acc + b.closingValue, 0)
                )}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="text-[11px] text-slate-500 font-medium">Total Liabilities</div>
              <div className="text-lg font-bold text-rose-700 mt-0.5">
                {formatCurrency(
                  balanceSheet
                    .filter((b) => b.category === 'Current Liabilities' || b.category === 'Long-Term Liabilities')
                    .reduce((acc, b) => acc + b.closingValue, 0)
                )}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-100">
              <div className="text-[11px] text-emerald-700 font-medium">Total Equity & Reserves</div>
              <div className="text-lg font-bold text-emerald-800 mt-0.5">
                {formatCurrency(
                  balanceSheet
                    .filter((b) => b.category === 'Equity')
                    .reduce((acc, b) => acc + b.closingValue, 0)
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
