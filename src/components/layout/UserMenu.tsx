import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, ShieldCheck, UserCheck, LogOut, Settings, ChevronDown, Check } from 'lucide-react';
import { cn } from '../../lib/utils';

interface UserMenuProps {
  onNavigateProfile?: () => void;
}

export const UserMenu: React.FC<UserMenuProps> = ({ onNavigateProfile }) => {
  const { currentUser, isFounder, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!currentUser) return null;

  return (
    <div ref={menuRef} className="relative select-none">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className={cn(
          'flex items-center gap-2.5 p-1.5 rounded-xl transition-all duration-150 cursor-pointer border',
          isOpen
            ? 'bg-slate-100 border-slate-300'
            : 'hover:bg-slate-100 border-transparent hover:border-slate-200'
        )}
      >
        <div className="relative">
          <img
            src={currentUser.avatarUrl}
            alt={currentUser.name}
            className="w-8 h-8 rounded-full object-cover ring-2 ring-purple-500/30"
          />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 absolute bottom-0 right-0 ring-2 ring-white" />
        </div>

        <div className="hidden md:block text-left">
          <div className="text-xs font-bold text-slate-900 leading-tight flex items-center gap-1.5">
            <span>{currentUser.name}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-[11px] text-slate-500 font-medium capitalize">
            {isFounder ? 'Admin (Shwetha)' : 'Employee'}
          </div>
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100 text-xs"
        >
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
            <p className="font-bold text-slate-900 leading-tight">{currentUser.name}</p>
            <p className="text-[11px] text-slate-500 mt-0.5 truncate">{currentUser.email}</p>
            <div className="mt-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200">
              {isFounder ? <ShieldCheck className="w-3 h-3 text-pink-600" /> : <UserCheck className="w-3 h-3 text-purple-600" />}
              <span>{isFounder ? 'Admin (Full Access)' : 'Employee Access'}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="p-1 space-y-0.5">
            {onNavigateProfile && (
              <button
                type="button"
                onClick={() => {
                  onNavigateProfile();
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer text-left font-medium"
              >
                <User className="w-4 h-4 text-slate-400" />
                <span>My Profile & Records</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                logout();
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer text-left font-medium"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
