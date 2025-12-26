
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { NAVIGATION_ITEMS, APP_NAME } from '../constants';
import { LogOut, Sun, Moon, Menu, X, User as UserIcon, ChefHat, Sparkles } from 'lucide-react';

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
    <div className="flex h-screen overflow-hidden font-sans bg-paper-50 dark:bg-charcoal-900">
      {/* Mobile Menu Drawer */}
      <div className={`fixed inset-0 z-[60] lg:hidden transition-all duration-500 ${isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
        <div className={`absolute inset-y-0 left-0 w-80 bg-paper-50 dark:bg-charcoal-900 shadow-2xl transition-transform duration-500 ease-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="p-8 h-full flex flex-col">
            <div className="flex items-center justify-between mb-12">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-saffron-500 rounded-full flex items-center justify-center text-white">
                  <ChefHat size={20} />
                </div>
                <span className="font-serif italic text-2xl font-bold text-curry-900 dark:text-saffron-500">{APP_NAME}</span>
              </div>
              <button onClick={() => setIsSidebarOpen(false)} className="text-slate-400 hover:text-paprika-600 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <nav className="space-y-2 flex-1 overflow-y-auto no-scrollbar">
              {NAVIGATION_ITEMS.map((item) => (
                <button
                  key={item.path}
                  onClick={() => { onNavigate(item.path); setIsSidebarOpen(false); }}
                  className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all text-sm font-bold tracking-tight ${activePath === item.path ? 'bg-saffron-100 text-saffron-700' : 'text-slate-400 hover:bg-paper-100'}`}
                >
                  {item.icon} {item.name}
                </button>
              ))}
            </nav>

            <div className="pt-8 border-t border-paper-100 mt-8">
               <button onClick={toggleTheme} className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-slate-400 font-bold text-sm mb-4">
                 {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                 Toggle Theme
               </button>
               {user && (
                 <button onClick={() => logout()} className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-paprika-600 font-bold text-sm">
                   <LogOut size={20} /> Sign Out
                 </button>
               )}
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-72 bg-paper-50 dark:bg-charcoal-900 border-r border-paper-100 dark:border-white/5 h-screen overflow-y-auto no-scrollbar sticky top-0">
        <div className="p-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-12 h-12 bg-saffron-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-saffron-500/20">
              <ChefHat size={24} />
            </div>
            <span className="font-serif italic text-2xl font-black text-curry-900 dark:text-saffron-500">{APP_NAME}</span>
          </div>

          <nav className="space-y-3">
            {NAVIGATION_ITEMS.map((item) => (
              <button
                key={item.path}
                onClick={() => onNavigate(item.path)}
                className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all text-sm font-bold tracking-tight ${activePath === item.path ? 'bg-saffron-50 text-saffron-600 shadow-sm' : 'text-slate-400 hover:text-curry-900 hover:bg-white'}`}
              >
                {item.icon} {item.name}
              </button>
            ))}
          </nav>
        </div>
        
        <div className="mt-auto p-10 border-t border-paper-100">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-saffron-100 flex items-center justify-center text-saffron-600 font-bold text-xs">
              {user?.displayName?.[0] || 'G'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-curry-900 dark:text-white truncate">{user?.displayName}</p>
              <button onClick={() => logout()} className="text-[10px] text-paprika-600 font-black uppercase tracking-widest hover:underline">Log Out</button>
            </div>
          </div>
        </div>
      </aside>

      {/* Content Container */}
      <main className="flex-1 overflow-y-auto no-scrollbar relative z-10">
        <header className="h-20 flex items-center justify-between px-6 md:px-12 sticky top-0 z-40 glass border-b border-paper-100 dark:border-white/5">
          <button className="lg:hidden p-2 -ml-2 text-curry-900 dark:text-white" onClick={() => setIsSidebarOpen(true)}>
            <Menu size={24} />
          </button>
          
          <div className="flex-1 hidden md:block px-8">
            <h2 className="text-[10px] font-bold tracking-[0.3em] text-slate-400 uppercase flex items-center gap-2">
              <Sparkles size={12} className="text-saffron-500" />
              Intelligence / {NAVIGATION_ITEMS.find(i => i.path === activePath)?.name || 'Chef Studio'}
            </h2>
          </div>

          <div className="flex items-center gap-6">
             <button onClick={toggleTheme} className="p-2 text-slate-400 hover:text-saffron-500 transition-colors">
               {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
             </button>
             <div className="hidden sm:flex items-center gap-3 px-4 py-1.5 bg-paper-100 dark:bg-charcoal-800 rounded-full">
               <div className="w-1.5 h-1.5 bg-saffron-500 rounded-full animate-pulse" />
               <span className="text-[9px] font-black text-slate-500 uppercase">Live Engine Active</span>
             </div>
          </div>
        </header>

        <div className="recipe-scroll">
          <div className="max-w-[1440px] mx-auto py-12 md:py-20 animate-fade-in">
             {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
