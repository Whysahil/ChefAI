
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Settings as SettingsIcon, User as UserIcon, Shield, Bell, Eye, Trash2, LogOut, ChevronRight, Globe, Palette } from 'lucide-react';
import { DIETS, SKILL_LEVELS } from '../constants';
import { useTheme } from '../context/ThemeContext';

const Settings: React.FC = () => {
  const { user, updatePreferences, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const sections = [
    { 
      id: 'profile', 
      title: 'Identity Framework', 
      icon: <UserIcon size={20} />,
      content: (
        <div className="space-y-8">
          <div className="flex items-center gap-6 p-6 bg-paper-50 dark:bg-charcoal-900 rounded-[2rem]">
            <div className="w-16 h-16 bg-saffron-100 text-saffron-600 rounded-full flex items-center justify-center text-xl font-black">
              {user?.displayName[0]}
            </div>
            <div className="text-left">
              <h4 className="text-lg font-bold text-curry-900 dark:text-white">{user?.displayName}</h4>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-widest">{user?.email}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Current Skill Level</label>
              <select 
                value={user?.preferences.skillLevel}
                onChange={e => updatePreferences({ skillLevel: e.target.value as any })}
                className="w-full bg-transparent border-b-2 border-paper-100 dark:border-white/10 py-4 text-base font-serif italic font-black text-curry-900 dark:text-white focus:outline-none focus:border-saffron-500"
              >
                {SKILL_LEVELS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Dietary Constraint</label>
              <select 
                value={user?.preferences.diet}
                onChange={e => updatePreferences({ diet: e.target.value })}
                className="w-full bg-transparent border-b-2 border-paper-100 dark:border-white/10 py-4 text-base font-serif italic font-black text-curry-900 dark:text-white focus:outline-none focus:border-saffron-500"
              >
                {DIETS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'interface',
      title: 'Experience Matrix',
      icon: <Palette size={20} />,
      content: (
        <div className="space-y-6 text-left">
          <div className="flex items-center justify-between p-6 bg-paper-50 dark:bg-charcoal-900 rounded-3xl border border-paper-100 dark:border-white/5">
            <div>
              <p className="text-sm font-bold text-curry-900 dark:text-white">Dark Mode Synthesis</p>
              <p className="text-xs text-slate-400 mt-1">Optimize interface for low-light environments.</p>
            </div>
            <button 
              onClick={toggleTheme}
              className={`w-14 h-8 rounded-full transition-all flex items-center p-1 ${theme === 'dark' ? 'bg-saffron-500 justify-end' : 'bg-slate-200 justify-start'}`}
            >
              <div className="w-6 h-6 bg-white rounded-full shadow-md" />
            </button>
          </div>
          <div className="flex items-center justify-between p-6 bg-paper-50 dark:bg-charcoal-900 rounded-3xl border border-paper-100 dark:border-white/5">
            <div>
              <p className="text-sm font-bold text-curry-900 dark:text-white">Primary Interface Locale</p>
              <p className="text-xs text-slate-400 mt-1">Currently restricted to English (Global).</p>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black text-saffron-500 uppercase tracking-widest">
               <Globe size={14} /> EN
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'security',
      title: 'Privacy & Archive',
      icon: <Shield size={20} />,
      content: (
        <div className="space-y-4">
           <button className="w-full flex items-center justify-between p-6 hover:bg-paper-50 dark:hover:bg-charcoal-900 rounded-3xl transition-all border border-transparent hover:border-paper-100 text-left">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-paper-100 dark:bg-charcoal-800 rounded-2xl text-slate-400"><Bell size={18} /></div>
                <div>
                   <p className="text-sm font-bold text-curry-900 dark:text-white">Push Notifications</p>
                   <p className="text-xs text-slate-400 mt-1">Manage culinary alerts and reminders.</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-slate-300" />
           </button>
           <button 
             onClick={() => logout()}
             className="w-full flex items-center gap-4 p-6 hover:bg-paprika-50 rounded-3xl transition-all text-paprika-600 group"
           >
              <div className="p-3 bg-paprika-100 rounded-2xl group-hover:bg-paprika-600 group-hover:text-white transition-all"><LogOut size={18} /></div>
              <div className="text-left">
                 <p className="text-sm font-black uppercase tracking-widest">Terminate Session</p>
                 <p className="text-xs opacity-60 mt-1">Securely sign out of current node.</p>
              </div>
           </button>
        </div>
      )
    }
  ];

  return (
    <div className="px-6 md:px-12 space-y-16 max-w-5xl mx-auto pb-32">
      <header className="space-y-6 text-left">
        <div className="inline-flex items-center gap-3 px-5 py-2 bg-saffron-50 dark:bg-saffron-900/20 text-saffron-600 rounded-full text-[10px] font-black uppercase tracking-[0.3em] border border-saffron-100">
           <SettingsIcon size={14} /> Global Configuration
        </div>
        <h2 className="text-6xl font-serif font-black tracking-tight text-curry-900 dark:text-white uppercase italic leading-none">
          User<br/><span className="text-saffron-500">Parameters.</span>
        </h2>
      </header>

      <div className="space-y-20">
        {sections.map(section => (
          <section key={section.id} className="space-y-10 animate-slide-up">
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] flex items-center gap-4 border-b border-paper-100 dark:border-white/5 pb-6">
              {section.icon} {section.title}
            </h3>
            {section.content}
          </section>
        ))}
      </div>
    </div>
  );
};

export default Settings;
