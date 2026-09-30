import React, { useState } from 'react';
import { CustomerStorefront } from './components/CustomerStorefront';
import { AdminDashboard } from './components/AdminDashboard';

export function App() {
  const [currentView, setCurrentView] = useState<'store' | 'admin'>('store');

  return (
    <div>
      {currentView === 'store' ? (
        <CustomerStorefront onOpenAdmin={() => setCurrentView('admin')} />
      ) : (
        <AdminDashboard onBackToStore={() => setCurrentView('store')} />
      )}
    </div>
  );
}

export default App;