
import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Studio from './pages/Studio';
import Login from './pages/Login';
import Cookbook from './pages/Cookbook';
import Settings from './pages/Settings';

const AuthenticatedApp: React.FC = () => {
  const { user, loading } = useAuth();
  const [currentPath, setCurrentPath] = useState('/');

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-900">
      <div className="flex flex-col items-center gap-6">
        <div className="w-12 h-12 border-4 border-saffron-100 border-t-saffron-500 rounded-full animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-400">Syncing Intelligence...</p>
      </div>
    </div>
  );

  if (!user) return <Login />;

  const renderPage = () => {
    switch (currentPath) {
      case '/':
        return <Dashboard onNavigate={setCurrentPath} />;
      case '/studio':
        return <Studio />;
      case '/cookbook':
        return <Cookbook />;
      case '/favorites':
        return <Cookbook onlyFavorites />;
      case '/settings':
        return <Settings />;
      default:
        return <Dashboard onNavigate={setCurrentPath} />;
    }
  };

  return (
    <Layout activePath={currentPath} onNavigate={setCurrentPath}>
      {renderPage()}
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AuthenticatedApp />
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
