import React, { useState, useRef, useEffect } from 'react';
import { Bell, Megaphone, CheckSquare, MessageSquare, Check, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { storageService } from '../../services/storageService';
import { cn } from '../../lib/utils';

export const NotificationMenu: React.FC<{ onNavigate?: (tab: string) => void }> = ({ onNavigate }) => {
  const { currentUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click or escape
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    window.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      window.removeEventListener('keydown', handleKey);
    };
  }, []);

  const announcements = storageService.getAnnouncements();
  const unreadAnnouncements = announcements.filter(
    (a) => currentUser && !a.acknowledgedUserIds.includes(currentUser.id)
  );

  const notificationsCount = unreadAnnouncements.length;

  return (
    <div ref={menuRef} className="relative select-none">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="View notifications"
        className={cn(
          'p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors relative cursor-pointer',
          isOpen && 'bg-slate-100 text-slate-900'
        )}
      >
        <Bell className="w-4 h-4" />
        {notificationsCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white animate-pulse" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100 text-xs">
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <span className="font-bold text-slate-900">Notifications & Alerts</span>
            {notificationsCount > 0 && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                {notificationsCount} new
              </span>
            )}
          </div>

          {/* List */}
          <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
            {unreadAnnouncements.length === 0 ? (
              <div className="p-6 text-center text-slate-400">
                <Check className="w-8 h-8 mx-auto mb-1 text-emerald-500 opacity-60" />
                <p className="font-medium text-slate-600">You are all caught up!</p>
                <p className="text-[11px] text-slate-400 mt-0.5">No unread announcements or pending alerts.</p>
              </div>
            ) : (
              unreadAnnouncements.map((ann) => (
                <div
                  key={ann.id}
                  onClick={() => {
                    if (onNavigate) onNavigate('announcements');
                    setIsOpen(false);
                  }}
                  className="p-3.5 hover:bg-slate-50/80 transition-colors cursor-pointer flex items-start gap-3"
                >
                  <div className="p-2 rounded-xl bg-amber-100 text-amber-700 shrink-0 mt-0.5">
                    <Megaphone className="w-3.5 h-3.5" />
                  </div>
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 truncate max-w-[140px]">{ann.title}</span>
                      <span className="text-[10px] text-slate-400">{ann.publishTime.split(' ')[0]}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">{ann.content}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {onNavigate && (
            <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
              <button
                type="button"
                onClick={() => {
                  onNavigate('announcements');
                  setIsOpen(false);
                }}
                className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center justify-center gap-1 mx-auto cursor-pointer"
              >
                View all announcements <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
