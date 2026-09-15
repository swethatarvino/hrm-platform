import React, { useEffect } from 'react';
import {
  LayoutDashboard,
  User,
  CheckSquare,
  Users,
  ShieldCheck,
  X,
  Sparkles,
  Clock,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useOrg } from '../../context/OrgContext';
import { cn } from '../../lib/utils';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenThemeModal?: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  isOpen,
  onClose,
  activeTab,
  setActiveTab,
}) => {
  const { currentUser, isFounder } = useAuth();
  const { config } = useOrg();

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

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

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 lg:hidden flex"
    >
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Drawer content */}
      <div className="relative w-72 max-w-[80vw] bg-slate-950 text-slate-300 h-full flex flex-col justify-between py-5 shadow-2xl z-10 animate-in slide-in-from-left duration-200 border-r border-indigo-950">
        <div>
          {/* Header */}
          <div className="px-5 pb-4 border-b border-indigo-950 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-pink-500 to-purple-600 text-white font-extrabold flex items-center justify-center text-xs shadow-md shadow-pink-500/20">
                {config.logoText.slice(0, 4)}
              </div>
              <div>
                <span className="font-extrabold text-white text-xs truncate max-w-[140px] block">{config.name}</span>
                <span className="text-[10px] text-pink-400 font-bold">{isFounder ? 'Admin View' : 'Employee View'}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 py-4 space-y-1.5 overflow-y-auto max-h-[calc(100vh-12rem)]">
            <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Navigation Menu
            </div>
            {items.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(item.id);
                    onClose();
                  }}
                  className={cn(
                    'w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-left',
                    isActive
                      ? 'bg-gradient-to-r from-pink-500 via-fuchsia-600 to-purple-600 text-white shadow-md shadow-pink-500/25'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900/80'
                  )}
                >
                  <Icon className={cn('w-4 h-4', isActive ? 'text-white' : 'text-slate-400')} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer */}
        <div className="px-4 pt-3 border-t border-indigo-950">
          <div className="flex items-center gap-3 p-2 rounded-2xl bg-slate-900/80 border border-slate-800">
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.name}
              className="w-8 h-8 rounded-full object-cover ring-2 ring-pink-500/40"
            />
            <div className="truncate">
              <span className="text-xs font-bold text-white block truncate">{currentUser.name}</span>
              <span className="text-[10px] text-pink-300 font-semibold">{isFounder ? 'Admin' : 'Employee'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
