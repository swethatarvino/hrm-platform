import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  User,
  CheckSquare,
  Users,
  ShieldCheck,
  Sparkles,
  Camera,
  Clock,
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { currentUser, isFounder, isSuperAdmin } = useAuth();

  // Clean, focused navigation for presentation
  const employeeNavItems = [
    { id: 'dashboard', label: 'My Dashboard', icon: LayoutDashboard },
    { id: 'profile', label: 'Profile & Employment', icon: User },
    { id: 'tasks', label: 'My Tasks & Work', icon: CheckSquare },
    { id: 'work-hours', label: 'Work Hours & Attendance', icon: Clock },
    { id: 'auth-tests', label: 'Security & Auth Tests', icon: ShieldCheck },
  ];

  const adminNavItems = [
    { id: 'dashboard', label: 'Executive Dashboard', icon: LayoutDashboard },
    { id: 'employees', label: 'Employee Directory', icon: Users },
    { id: 'tasks', label: 'Task & Work Management', icon: CheckSquare },
    { id: 'work-hours', label: 'Company Work Hours', icon: Clock },
    { id: 'profile', label: 'Admin Profile & Record', icon: User },
    { id: 'auth-tests', label: 'Security & Auth Tests', icon: ShieldCheck },
  ];

  const items = isFounder ? adminNavItems : employeeNavItems;

  return (
    <aside className="hidden lg:flex w-64 bg-slate-950 text-slate-300 min-h-[calc(100vh-4rem)] flex-col justify-between py-6 shrink-0 border-r border-indigo-950/60 select-none">
      <div className="space-y-6">
        {/* Navigation Group Header */}
        <div className="px-6">
          <div className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-pink-500/10 text-pink-300 border border-pink-500/20 mb-2">
            <Sparkles className="w-3 h-3 text-pink-400" />
            <span>{isFounder ? 'Admin Cockpit' : 'Employee Workspace'}</span>
          </div>
          <h3 className="text-sm font-bold text-white tracking-tight">
            {isSuperAdmin ? 'Admininnovis (SuperAdmin)' : isFounder ? 'Shwetha (Director)' : currentUser.name}
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {isSuperAdmin ? 'Organisation-wide control & oversight' : isFounder ? 'Full company visibility & task oversight' : 'Personal tasks & profile progress'}
          </p>
        </div>

        {/* Core Menu Items */}
        <nav className="px-3 space-y-1.5">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-left',
                  isActive
                    ? 'bg-gradient-to-r from-pink-500 via-fuchsia-600 to-purple-600 text-white shadow-md shadow-pink-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900/80 hover:border-l-2 hover:border-pink-500'
                )}
              >
                <Icon className={cn('w-4 h-4', isActive ? 'text-white' : 'text-slate-400')} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer User Mini-Card with photo */}
      <div className="px-4 pt-4 border-t border-indigo-950/80">
        <div className="flex items-center gap-3 p-2 rounded-2xl bg-slate-900/60 border border-slate-800/80">
          <div className="relative shrink-0">
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.name}
              className="w-9 h-9 rounded-full object-cover ring-2 ring-pink-500/40"
            />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 absolute bottom-0 right-0 ring-2 ring-slate-950" />
          </div>
          <div className="truncate flex-1">
            <div className="text-xs font-bold text-white truncate">{currentUser.name}</div>
            <div className="text-[10px] text-pink-300 font-semibold truncate capitalize">
              {isSuperAdmin ? 'SuperAdmin' : isFounder ? 'Admin' : 'Employee'}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
