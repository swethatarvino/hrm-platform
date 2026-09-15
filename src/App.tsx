import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { MobileNav } from './components/layout/MobileNav';
import { LoginPage } from './components/auth/LoginPage';
import { ForcePasswordChange } from './components/auth/ForcePasswordChange';
import { EmployeeDashboard } from './components/dashboard/EmployeeDashboard';
import { FounderDashboard } from './components/dashboard/FounderDashboard';
import { ProfileModule } from './components/modules/ProfileModule';
import { TasksModule } from './components/modules/TasksModule';
import { TeamVisibilityModule } from './components/modules/TeamVisibilityModule';
import { WorkHoursModule } from './components/modules/WorkHoursModule';
import { WhiteLabelSettingsModal } from './components/modules/WhiteLabelSettingsModal';
import { AuthTestingSuite } from './components/auth/AuthTestingSuite';

export const App: React.FC = () => {
  const { isFounder, isAuthenticated, mustChangePassword } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Security guard: If an employee tries to access a founder-only tab, redirect to employee dashboard
  useEffect(() => {
    const founderOnlyTabs = ['employees', 'team-work'];
    if (!isFounder && founderOnlyTabs.includes(activeTab)) {
      setActiveTab('dashboard');
    }
  }, [isFounder, activeTab]);

  // If not authenticated, strictly render Login Page (no sign-up view, no public role selection)
  if (!isAuthenticated) {
    return (
      <>
        <LoginPage
          onOpenThemeModal={() => setIsThemeModalOpen(true)}
        />
        <WhiteLabelSettingsModal
          isOpen={isThemeModalOpen}
          onClose={() => setIsThemeModalOpen(false)}
        />
      </>
    );
  }

  if (mustChangePassword) {
    return <ForcePasswordChange />;
  }

  const renderActiveModule = () => {
    // 1. Security & Auth Verification Suite
    if (activeTab === 'auth-tests') {
      return <AuthTestingSuite />;
    }

    // 2. Dashboard View
    if (activeTab === 'dashboard') {
      return isFounder ? (
        <FounderDashboard onNavigate={setActiveTab} />
      ) : (
        <EmployeeDashboard onNavigate={setActiveTab} />
      );
    }

    // 3. Core Modules
    switch (activeTab) {
      case 'profile':
        return <ProfileModule />;
      case 'tasks':
      case 'team-work':
        return <TasksModule />;
      case 'employees':
        return <TeamVisibilityModule />;
      case 'work-hours':
        return <WorkHoursModule />;
      default:
        return isFounder ? (
          <FounderDashboard onNavigate={setActiveTab} />
        ) : (
          <EmployeeDashboard onNavigate={setActiveTab} />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col selection:bg-pink-500 selection:text-white">
      {/* Top Header */}
      <Header
        onOpenThemeModal={() => setIsThemeModalOpen(true)}
        onOpenMobileNav={() => setIsMobileNavOpen(true)}
        onNavigate={setActiveTab}
      />

      {/* Main Body with Sidebar + Workspace Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Persistent Desktop Sidebar */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Scrollable Workspace Content Area */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto min-h-[calc(100vh-4rem)] bg-slate-100">
          {renderActiveModule()}
        </main>
      </div>

      {/* Mobile Responsive Navigation Drawer */}
      <MobileNav
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenThemeModal={() => setIsThemeModalOpen(true)}
      />

      {/* Live White-Label Customizer Modal */}
      <WhiteLabelSettingsModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
      />
    </div>
  );
};
