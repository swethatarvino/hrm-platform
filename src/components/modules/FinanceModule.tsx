import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useOrg } from '../../context/OrgContext';
import { storageService } from '../../services/storageService';
import { FinanceTransaction } from '../../types';
import { DollarSign, Plus, ArrowUpRight, ArrowDownRight, TrendingUp, Filter, ShieldAlert } from 'lucide-react';
import { UnauthorizedPage } from '../auth/UnauthorizedPage';

export const FinanceModule: React.FC = () => {
  const { currentUser, isFounder } = useAuth();
  const { formatCurrency } = useOrg();

  // If non-founder somehow triggers this, show access denied
  if (!isFounder) {
    return <UnauthorizedPage moduleName="Company Financial Ledger & Cashflow" />;
  }

  const [transactions, setTransactions] = useState<FinanceTransaction[]>(() =>
    storageService.getFinanceTransactions(currentUser)
  );
  const [filterType, setFilterType] = useState<string>('all');
  const [isAddOpen, setIsAddOpen] = useState(false);

  // New Transaction Form State
  const [txType, setTxType] = useState<'inflow' | 'outflow' | 'investment'>('inflow');
  const [txAmount, setTxAmount] = useState('');
  const [txCategory, setTxCategory] = useState('Client Retainer');
  const [txDesc, setTxDesc] = useState('');
  const [txRef, setTxRef] = useState('');
  const [txDate, setTxDate] = useState('2026-09-08');

  const refreshTx = () => {
    setTransactions(storageService.getFinanceTransactions(currentUser));
  };

  const handleAddTx = (e: React.FormEvent) => {
    e.preventDefault();
    storageService.addFinanceTransaction(
      {
        type: txType,
        amount: parseFloat(txAmount) || 0,
        category: txCategory,
        description: txDesc,
        reference: txRef || `REF-${Date.now().toString().slice(-4)}`,
        date: txDate,
      },
      currentUser
    );
    setIsAddOpen(false);
    setTxAmount('');
    setTxDesc('');
    setTxRef('');
    refreshTx();
  };

  const totalInflow = transactions
    .filter((t) => t.type === 'inflow')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalOutflow = transactions
    .filter((t) => t.type === 'outflow')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalInvestment = transactions
    .filter((t) => t.type === 'investment')
    .reduce((acc, t) => acc + t.amount, 0);

  const netCash = totalInflow - totalOutflow;

  const filteredTx = transactions.filter((t) => {
    if (filterType === 'all') return true;
    return t.type === filterType;
  });

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Executive Finance Management</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Section 5: High-level tracking of cash inflow, operational outflow, and strategic capital investments.
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm self-start"
        >
          <Plus className="w-4 h-4" /> Record Transaction
        </button>
      </div>

      {/* 4 Core Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Cash Inflow</span>
            <ArrowUpRight className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-700 mt-1">{formatCurrency(totalInflow)}</div>
          <span className="text-[10px] text-slate-400">Total received revenue</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Cash Outflow</span>
            <ArrowDownRight className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold text-rose-700 mt-1">{formatCurrency(totalOutflow)}</div>
          <span className="text-[10px] text-slate-400">Operational costs & burn</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Net Cash Position</span>
            <DollarSign className="w-4 h-4 text-brand-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{formatCurrency(netCash)}</div>
          <span className="text-[10px] text-emerald-600 font-medium">Operating surplus</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Investments Made</span>
            <TrendingUp className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-purple-700 mt-1">{formatCurrency(totalInvestment)}</div>
          <span className="text-[10px] text-slate-400">Capitalized assets & hardware</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs">
        {[
          { id: 'all', label: 'All Records' },
          { id: 'inflow', label: 'Inflow Only' },
          { id: 'outflow', label: 'Outflow Only' },
          { id: 'investment', label: 'Investments Only' },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilterType(f.id)}
            className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              filterType === f.id
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3">Description</th>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3">Reference</th>
                <th className="px-6 py-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredTx.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-6 py-3.5 font-medium text-slate-800">{tx.date}</td>
                  <td className="px-6 py-3.5">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        tx.type === 'inflow'
                          ? 'bg-emerald-100 text-emerald-800'
                          : tx.type === 'outflow'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}
                    >
                      {tx.type}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 font-semibold text-slate-900 max-w-sm">{tx.description}</td>
                  <td className="px-6 py-3.5 text-slate-600">{tx.category}</td>
                  <td className="px-6 py-3.5 font-mono text-slate-500">{tx.reference}</td>
                  <td
                    className={`px-6 py-3.5 text-right font-bold text-sm ${
                      tx.type === 'inflow'
                        ? 'text-emerald-600'
                        : tx.type === 'outflow'
                        ? 'text-rose-600'
                        : 'text-purple-600'
                    }`}
                  >
                    {tx.type === 'inflow' ? '+' : '-'} {formatCurrency(tx.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Transaction Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900">Record Financial Transaction</h3>
            <p className="text-xs text-slate-500 mt-0.5">Management ledger entry</p>

            <form onSubmit={handleAddTx} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Transaction Nature</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['inflow', 'outflow', 'investment'] as const).map((typeKey) => (
                    <button
                      key={typeKey}
                      type="button"
                      onClick={() => setTxType(typeKey)}
                      className={`py-2 rounded-lg font-bold capitalize transition-colors cursor-pointer border ${
                        txType === typeKey
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white text-slate-600 border-slate-200'
                      }`}
                    >
                      {typeKey}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    value={txAmount}
                    onChange={(e) => setTxAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={txDate}
                    onChange={(e) => setTxDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category / Source</label>
                <input
                  type="text"
                  value={txCategory}
                  onChange={(e) => setTxCategory(e.target.value)}
                  placeholder="e.g. Enterprise Contract, Cloud Infrastructure"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <input
                  type="text"
                  value={txDesc}
                  onChange={(e) => setTxDesc(e.target.value)}
                  placeholder="Brief note or client name..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Reference / Invoice #</label>
                <input
                  type="text"
                  value={txRef}
                  onChange={(e) => setTxRef(e.target.value)}
                  placeholder="INV-2026-..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800 font-mono"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-bold cursor-pointer shadow-xs"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
