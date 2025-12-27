
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Settings as SettingsIcon, User as UserIcon, Shield, Bell, Palette, LogOut, ChevronRight, Globe, Check, Plus, X } from 'lucide-react';
import { DIETS, SKILL_LEVELS, CUISINES } from '../constants';
import { useTheme } from '../context/ThemeContext';

const Settings: React.FC = () => {
  const { user, updatePreferences, updateProfile, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState(user?.displayName || '');

  const handleNameSave = () => {
    if (newName.trim()) {
      updateProfile({ displayName: newName.trim() });
      setEditingName(false);
    }
  };

  const toggleCuisine = (cuisine: string) => {
    const current = user?.preferences.favoriteCuisines || [];
    const updated = current.includes(cuisine)
      ? current.filter(c => c !== cuisine)
      : [...current, cuisine];
    updatePreferences({ favoriteCuisines: updated });
  };

  const sections = [
    { 
      id: 'profile', 
      title: 'Identity Framework', 
      icon: <UserIcon size={20} />,
      content: (
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-center gap-8 p-8 bg-white dark:bg-neutral-800/60 rounded-[2.5rem] border border-neutral-200 dark:border-neutral-800 shadow-sm">
            <div className="w-20 h-20 bg-saffron-100 dark:bg-saffron-500/20 text-saffron-600 dark:text-saffron-400 rounded-3xl flex items-center justify-center text-2xl font-black shadow-inner">
              {user?.displayName?.[0] || 'U'}
            </div>
            <div className="flex-1 space-y-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Public Alias</label>
                {editingName ? (
                  <div className="flex items-center gap-3">
                    <input 
                      autoFocus
                      value={newName}
                      onChange={e => setNewName(e.target.value)}
                      className="bg-transparent border-b-2 border-saffron-500 py-1 text-xl font-serif font-black italic focus:outline-none text-neutral-900 dark:text-neutral-50"
                    />
                    <button onClick={handleNameSave} className="p-2 bg-saffron-500 text-white rounded-lg hover:bg-saffron-600">
                      <Check size={16} />
                    </button>
                    <button onClick={() => { setEditingName(false); setNewName(user?.displayName || ''); }} className="p-2 text-neutral-400">
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    <h4 className="text-2xl font-serif font-black text-neutral-900 dark:text-neutral-50 italic">{user?.displayName}</h4>
                    <button onClick={() => setEditingName(true)} className="text-[10px] font-bold text-saffron-500 uppercase hover:underline">Edit Protocol</button>
                  </div>
                )}
              </div>
              <p className="text-xs font-medium text-neutral-400 truncate">{user?.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block ml-1">Proficiency Level</label>
              <select 
                value={user?.preferences.skillLevel}
                onChange={e => updatePreferences({ skillLevel: e.target.value as any })}
                className="w-full bg-neutral-100 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 px-5 py-4 text-sm font-bold rounded-2xl focus:outline-none focus:ring-2 focus:ring-saffron-500/20 transition-all"
              >
                {SKILL_LEVELS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block ml-1">Dietary Logic</label>
              <select 
                value={user?.preferences.diet}
                onChange={e => updatePreferences({ diet: e.target.value })}
                className="w-full bg-neutral-100 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 px-5 py-4 text-sm font-bold rounded-2xl focus:outline-none focus:ring-2 focus:ring-saffron-500/20 transition-all"
              >
                {DIETS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-4 text-left">
            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block ml-1">Favorite Cuisines</label>
            <div className="flex flex-wrap gap-2">
              {CUISINES.slice(0, 15).map(cuisine => {
                const isFav = user?.preferences.favoriteCuisines.includes(cuisine);
                return (
                  <button
                    key={cuisine}
                    onClick={() => toggleCuisine(cuisine)}
                    className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider border transition-all flex items-center gap-2 ${
                      isFav 
                        ? 'bg-saffron-500 border-saffron-500 text-white shadow-lg shadow-saffron-500/20' 
                        : 'bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-500 hover:border-saffron-500/50'
                    }`}
                  >
                    {cuisine}
                    {isFav ? <Check size={12} /> : <Plus size={12} />}
                  </button>
                );
              })}
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
          <div className="flex items-center justify-between p-6 bg-white dark:bg-neutral-800/60 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
            <div>
              <p className="text-sm font-bold text-neutral-900 dark:text-neutral-50">High-Contrast Dark Mode</p>
              <p className="text-xs text-neutral-400 mt-1">Optimize visual output for nocturnal environments.</p>
            </div>
            <button 
              onClick={toggleTheme}
              className={`w-14 h-8 rounded-full transition-all flex items-center p-1 ${theme === 'dark' ? 'bg-saffron-500 justify-end' : 'bg-neutral-200 dark:bg-neutral-700 justify-start'}`}
            >
              <div className="w-6 h-6 bg-white rounded-full shadow-lg" />
            </button>
          </div>
          <div className="flex items-center justify-between p-6 bg-white dark:bg-neutral-800/60 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
            <div>
              <p className="text-sm font-bold text-neutral-900 dark:text-neutral-50">Interface Locale</p>
              <p className="text-xs text-neutral-400 mt-1">AI-standard English (Global/Precision).</p>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black text-saffron-500 uppercase tracking-widest bg-saffron-50 dark:bg-saffron-900/20 px-3 py-1.5 rounded-lg border border-saffron-100 dark:border-saffron-900/50">
               <Globe size={14} /> EN-INT
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'security',
      title: 'Privacy & Sessions',
      icon: <Shield size={20} />,
      content: (
        <div className="space-y-4">
           <button 
             onClick={() => logout()}
             className="w-full flex items-center gap-4 p-6 bg-white dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-800 rounded-[2rem] text-left group hover:border-paprika-600/50 transition-all shadow-sm"
           >
              <div className="p-4 bg-paprika-50 dark:bg-paprika-900/30 text-paprika-600 rounded-2xl group-hover:bg-paprika-600 group-hover:text-white transition-all">
                <LogOut size={20} />
              </div>
              <div className="flex-1">
                 <p className="text-sm font-black text-neutral-900 dark:text-neutral-50 uppercase tracking-widest">Terminate Protocol</p>
                 <p className="text-xs text-neutral-400 mt-1 italic">Securely decouple identity from current node.</p>
              </div>
              <ChevronRight size={18} className="text-neutral-300" />
           </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-16 max-w-4xl mx-auto pb-32 animate-fade-in">
      <header className="space-y-6 text-left">
        <div className="inline-flex items-center gap-3 px-5 py-2 bg-saffron-50 dark:bg-saffron-900/20 text-saffron-600 rounded-full text-[10px] font-black uppercase tracking-[0.3em] border border-saffron-100 dark:border-saffron-900/50">
           <SettingsIcon size={14} /> Global Configuration
        </div>
        <h2 className="text-5xl md:text-6xl font-serif font-black tracking-tight text-neutral-900 dark:text-neutral-50 uppercase italic leading-none">
          Identity<br/><span className="text-saffron-500">Architecture.</span>
        </h2>
      </header>

      <div className="space-y-24">
        {sections.map(section => (
          <section key={section.id} className="space-y-10">
            <h3 className="text-[11px] font-black text-neutral-400 uppercase tracking-[0.5em] flex items-center gap-4 border-b border-neutral-100 dark:border-neutral-800 pb-6">
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
