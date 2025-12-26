
import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Studio from './pages/Studio';

const App: React.FC = () => {
  const [currentPath, setCurrentPath] = useState('/');

  const renderPage = () => {
    switch (currentPath) {
      case '/':
        return <Dashboard onNavigate={setCurrentPath} />;
      case '/studio':
        return <Studio />;
      case '/cookbook':
      case '/favorites':
      case '/settings':
        return (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400">
              <span className="text-4xl">🚧</span>
            </div>
            <h2 className="text-2xl font-bold">Coming Soon</h2>
            <p className="text-slate-500 max-w-xs">We're working hard to bring this feature to you. Stay tuned!</p>
          </div>
        );
      default:
        return <Dashboard onNavigate={setCurrentPath} />;
    }
  };

  return (
    <ThemeProvider>
      <AuthProvider>
        <Layout activePath={currentPath} onNavigate={setCurrentPath}>
          {renderPage()}
        </Layout>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
