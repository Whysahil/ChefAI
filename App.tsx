
import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Studio from './pages/Studio';
import Login from './pages/Login';
import Cookbook from './pages/Cookbook';
import Settings from './pages/Settings';
import { Key, ShieldAlert, Sparkles, ArrowRight } from 'lucide-react';

const ApiKeyGuard: React.FC<{ onKeySelected: () => void }> = ({ onKeySelected }) => {
  const handleSelectKey = async () => {
    try {
      // @ts-ignore
      await window.aistudio.openSelectKey();
      // Proceed immediately as per instructions to avoid race conditions
      onKeySelected();
    } catch (err) {
      console.error("Key selection failed", err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-900 p-6">
      <div className="max-w-md w-full space-y-8 text-center bg-white dark:bg-neutral-800 p-10 rounded-[3rem] border border-neutral-200 dark:border-neutral-700 shadow-2xl animate-slide-up">
        <div className="w-20 h-20 bg-saffron-100 dark:bg-saffron-500/10 rounded-3xl flex items-center justify-center text-saffron-500 mx-auto mb-8 shadow-inner">
          <Key size={36} />
        </div>
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-neutral-100 dark:bg-neutral-900 text-neutral-400 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-neutral-200 dark:border-neutral-700">
            <ShieldAlert size={14} /> Security Protocol V4
          </div>
          <h2 className="text-3xl font-serif font-black text-neutral-900 dark:text-neutral-50 italic uppercase leading-tight">
            System <span className="text-saffron-500">Calibration.</span>
          </h2>
          <p className="text-neutral-500 font-medium leading-relaxed">
            To initialize the ChefAI synthesis engine, you must link a valid API key from a <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="text-saffron-500 underline underline-offset-4 hover:text-saffron-600">paid GCP project</a>.
          </p>
        </div>
        <button 
          onClick={handleSelectKey}
          className="w-full py-5 bg-saffron-500 text-white font-bold text-xs uppercase tracking-[0.3em] rounded-2xl flex items-center justify-center gap-4 hover:bg-saffron-600 transition-all shadow-xl shadow-saffron-500/20 group"
        >
          Select API Key <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};

const AuthenticatedApp: React.FC = () => {
  const { user, loading } = useAuth();
  const [currentPath, setCurrentPath] = useState('/');
  const [hasKey, setHasKey] = useState<boolean | null>(null);

  useEffect(() => {
    const checkKey = async () => {
      // @ts-ignore
      if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
        // @ts-ignore
        const selected = await window.aistudio.hasSelectedApiKey();
        setHasKey(selected);
      } else {
        // Fallback for environments without the selection utility
        setHasKey(true);
      }
    };
    checkKey();
  }, []);

  if (loading || hasKey === null) return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-900">
      <div className="flex flex-col items-center gap-6">
        <div className="w-12 h-12 border-4 border-saffron-100 border-t-saffron-500 rounded-full animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-400">Syncing Intelligence...</p>
      </div>
    </div>
  );

  if (!hasKey) return <ApiKeyGuard onKeySelected={() => setHasKey(true)} />;
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
