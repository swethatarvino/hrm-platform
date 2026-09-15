import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useOrg } from '../../context/OrgContext';
import { UserMenu } from './UserMenu';
import { NotificationMenu } from './NotificationMenu';
import { Palette, Menu } from 'lucide-react';

interface HeaderProps {
  onOpenThemeModal: () => void;
  onOpenMobileNav: () => void;
  onNavigate?: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenThemeModal,
  onOpenMobileNav,
  onNavigate,
}) => {
  const { currentUser } = useAuth();
  const { config } = useOrg();

  if (!currentUser) return null;

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
      {/* Left: Mobile Toggle & Client Branding */}
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger Drawer Trigger */}
        <button
          type="button"
          onClick={onOpenMobileNav}
          aria-label="Open mobile navigation"
          className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 lg:hidden transition-colors cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-600 text-white font-black flex items-center justify-center text-xs tracking-wider shadow-xs transition-colors shrink-0">
            {config.logoText.slice(0, 4)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-extrabold text-slate-900 leading-none truncate max-w-[150px] sm:max-w-none">
                {config.name}
              </h1>
              <span className="hidden sm:inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                HRM System
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5 hidden md:block">{config.tagline}</p>
          </div>
        </div>
      </div>

      {/* Right: Actions, Notifications, User Menu */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* White-Label Customizer Button */}
        <button
          type="button"
          onClick={onOpenThemeModal}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl transition-colors cursor-pointer shadow-2xs"
          title="Customize Brand, Client Name & Colors"
        >
          <Palette className="w-3.5 h-3.5 text-brand-600" />
          <span className="hidden sm:inline">Theming</span>
        </button>

        {/* Notification Bell Menu */}
        <NotificationMenu onNavigate={onNavigate} />

        {/* User Profile Menu with Role Switcher & Logout */}
        <UserMenu onNavigateProfile={() => onNavigate && onNavigate('profile')} />
      </div>
    </header>
  );
};
