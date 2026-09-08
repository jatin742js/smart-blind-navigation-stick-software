import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DeviceProvider } from './context/DeviceContext';
import { Navbar } from './components/Navbar';
import { Sidebar, TabId } from './components/Sidebar';
import { SimulationToolbar } from './components/SimulationToolbar';

// Pages
import { DashboardPage } from './pages/DashboardPage';
import { LiveLocationPage } from './pages/LiveLocationPage';
import { ObstacleRadarPage } from './pages/ObstacleRadarPage';
import { EmergencyContactsPage } from './pages/EmergencyContactsPage';
import { EmergencyHistoryPage } from './pages/EmergencyHistoryPage';
import { LocationHistoryPage } from './pages/LocationHistoryPage';
import { DeviceStatusPage } from './pages/DeviceStatusPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { CaregiverPortalPage } from './pages/CaregiverPortalPage';
import { HardwareDocsPage } from './pages/HardwareDocsPage';
import { SettingsPage } from './pages/SettingsPage';
import { AuthPage } from './pages/AuthPage';

const MainAppLayout: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [currentTab, setCurrentTab] = useState<TabId>('dashboard');
  const [showSimulation, setShowSimulation] = useState<boolean>(true);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-amber-600 font-mono text-sm">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <span>Booting Smart Blind Navigation Stick System...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage onSuccess={() => setCurrentTab('dashboard')} />;
  }

  const renderActiveTab = () => {
    switch (currentTab) {
      case 'dashboard':
        return <DashboardPage onNavigate={setCurrentTab} />;
      case 'live-location':
        return <LiveLocationPage />;
      case 'obstacle-radar':
        return <ObstacleRadarPage />;
      case 'emergency-contacts':
        return <EmergencyContactsPage />;
      case 'emergency-history':
        return <EmergencyHistoryPage />;
      case 'location-history':
        return <LocationHistoryPage />;
      case 'device-status':
        return <DeviceStatusPage />;
      case 'notifications':
        return <NotificationsPage />;
      case 'caregiver-portal':
        return <CaregiverPortalPage />;
      case 'hardware-docs':
        return <HardwareDocsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardPage onNavigate={setCurrentTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      
      {/* Top Accessible Navbar */}
      <Navbar
        onToggleSimulation={() => setShowSimulation(!showSimulation)}
        showSimulation={showSimulation}
      />

      {/* Main Workspace with Sidebar */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto pb-16 lg:pb-0">
        
        {/* Sidebar */}
        <Sidebar currentTab={currentTab} onSelectTab={setCurrentTab} />

        {/* Dynamic Content Region */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-full overflow-x-hidden">
          
          {/* Hardware Demo Simulation Controls */}
          {showSimulation && (
            <SimulationToolbar onClose={() => setShowSimulation(false)} />
          )}

          {/* Active View */}
          {renderActiveTab()}

        </main>
      </div>

    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <DeviceProvider>
        <MainAppLayout />
      </DeviceProvider>
    </AuthProvider>
  );
}

export default App;
