
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { NAVIGATION_ITEMS, APP_NAME } from '../constants';
import { LogOut, Sun, Moon, Menu, X, ChefHat, Sparkles } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activePath: string;
  onNavigate: (path: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activePath, onNavigate }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden font-sans bg-neutral-50 dark:bg-neutral-900">
      {/* Mobile Drawer */}
      <div className={`fixed inset-0 z-[60] lg:hidden transition-all duration-300 ${isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
        <div className={`absolute inset-y-0 left-0 w-72 bg-neutral-50 dark:bg-neutral-900 shadow-2xl transition-transform duration-300 ease-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-saffron-500 rounded-lg flex items-center justify-center text-white">
                  <ChefHat size={18} />
                </div>
                <span className="font-serif italic text-xl font-bold text-neutral-900 dark:text-neutral-50">{APP_NAME}</span>
              </div>
              <button onClick={() => setIsSidebarOpen(false)} className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <nav className="space-y-1 flex-1">
              {NAVIGATION_ITEMS.map((item) => (
                <button
                  key={item.path}
                  onClick={() => { onNavigate(item.path); setIsSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-semibold ${activePath === item.path ? 'bg-neutral-100 dark:bg-neutral-800 text-saffron-600' : 'text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800'}`}
                >
                  <span className={activePath === item.path ? 'text-saffron-600' : 'text-neutral-400'}>{item.icon}</span>
                  {item.name}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-neutral-50 dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 h-screen sticky top-0">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-saffron-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-saffron-500/10">
              <ChefHat size={22} />
            </div>
            <span className="font-serif italic text-2xl font-black text-neutral-900 dark:text-neutral-50 tracking-tight">{APP_NAME}</span>
          </div>

          <nav className="space-y-1.5">
            {NAVIGATION_ITEMS.map((item) => (
              <button
                key={item.path}
                onClick={() => onNavigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-semibold ${activePath === item.path ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50 shadow-sm border border-neutral-200 dark:border-neutral-700' : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-50 hover:bg-neutral-100 dark:hover:bg-neutral-800'}`}
              >
                <span className={activePath === item.path ? 'text-saffron-500' : 'text-neutral-400'}>{item.icon}</span>
                {item.name}
              </button>
            ))}
          </nav>
        </div>
        
        <div className="mt-auto p-8 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-100/30 dark:bg-neutral-800/20">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-saffron-100 dark:bg-saffron-900/30 flex items-center justify-center text-saffron-600 font-bold text-xs">
              {user?.displayName?.[0] || 'G'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-neutral-900 dark:text-neutral-50 truncate">{user?.displayName}</p>
              <button onClick={() => logout()} className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider hover:text-paprika-600 transition-colors">Sign Out</button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative z-10">
        <header className="h-16 flex items-center justify-between px-6 md:px-10 sticky top-0 z-40 glass border-b border-neutral-200 dark:border-neutral-800">
          <button className="lg:hidden p-2 -ml-2 text-neutral-900 dark:text-neutral-50" onClick={() => setIsSidebarOpen(true)}>
            <Menu size={20} />
          </button>
          
          <div className="flex-1 hidden md:block px-6">
            <h2 className="text-[10px] font-bold tracking-[0.2em] text-neutral-400 uppercase flex items-center gap-2">
              <Sparkles size={12} className="text-saffron-500" />
              Intelligence Center / {NAVIGATION_ITEMS.find(i => i.path === activePath)?.name || 'Studio'}
            </h2>
          </div>

          <div className="flex items-center gap-5">
             <button onClick={toggleTheme} className="p-2 text-neutral-400 hover:text-saffron-500 transition-colors">
               {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
             </button>
             <div className="hidden sm:flex items-center gap-2.5 px-3 py-1 bg-neutral-100 dark:bg-neutral-800 rounded-full border border-neutral-200 dark:border-neutral-700">
               <div className="w-1.5 h-1.5 bg-saffron-500 rounded-full animate-pulse" />
               <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-wide">Live Engine Synced</span>
             </div>
          </div>
        </header>

        <div className="max-w-6xl mx-auto py-8 md:py-12 px-6 md:px-10 animate-fade-in">
           {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
