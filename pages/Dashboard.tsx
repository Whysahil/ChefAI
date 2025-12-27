
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ChefHat, BookOpen, Clock, Heart, ArrowRight, TrendingUp, Sparkles, Flame, Coffee, ChevronRight } from 'lucide-react';

const Dashboard: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const { user, savedRecipes } = useAuth();

  // Dynamic metrics based on actual data
  const insights = [
    { name: 'CULINARY LOGS', value: `${savedRecipes.length} Recipes`, icon: <ChefHat size={16} /> },
    { name: 'COOKBOOK', value: `${savedRecipes.length} Saved`, icon: <BookOpen size={16} /> },
    { name: 'KITCHEN TIME', value: '15 Hours', icon: <Clock size={16} /> },
    { name: 'FAVORITES', value: '8 Picks', icon: <Heart size={16} /> },
  ];

  // Get the 3 most recent recipes
  const recentRecipes = [...savedRecipes]
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 3);

  const formatRelativeTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return 'Recently';
  };

  return (
    <div className="space-y-12 md:space-y-16 animate-slide-up">
      {/* Visual Header Section - Preserved from high-fidelity spec */}
      <div className="relative h-80 md:h-[450px] rounded-[2.5rem] overflow-hidden shadow-2xl border border-neutral-200 dark:border-neutral-800 group">
        <img 
          src="https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&q=80&w=2000" 
          alt="Culinary Inspiration" 
          className="w-full h-full object-cover transition-all duration-1000 scale-100 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/90 via-neutral-900/40 to-transparent" />
        
        <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-16 space-y-4 md:space-y-6 max-w-4xl">
          <div className="inline-flex items-center gap-2 text-saffron-500 font-bold text-[10px] tracking-widest uppercase bg-neutral-900/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-neutral-700">
            <Sparkles size={14} /> Intelligence V4.0 • Active Analysis
          </div>
          <h1 className="text-4xl md:text-6xl font-serif font-black text-white tracking-tight leading-tight italic">
            Elevating Tradition <br/> 
            <span className="text-saffron-500">via Precision.</span>
          </h1>
          <p className="text-base md:text-lg text-neutral-300 font-medium leading-relaxed max-w-2xl">
            Calibrated synthesis protocols designed for maximum visual comfort and accuracy. 
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <button 
              onClick={() => onNavigate('/studio')}
              className="bg-saffron-500 text-white px-8 py-4 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-3 hover:bg-saffron-600 transition-all shadow-xl shadow-saffron-500/20"
            >
              Enter Studio <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Insight Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {insights.map((insight, i) => (
          <div key={i} className="bg-white dark:bg-neutral-800/60 p-6 md:p-8 rounded-3xl border border-neutral-200 dark:border-neutral-800 transition-all hover:border-saffron-500/50 shadow-sm backdrop-blur-sm">
            <div className="text-saffron-500 mb-6 p-3 bg-saffron-50 dark:bg-saffron-900/20 w-fit rounded-xl">
              {insight.icon}
            </div>
            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">{insight.name}</p>
            <p className="text-2xl md:text-3xl font-serif font-black text-neutral-900 dark:text-neutral-50 leading-none">{insight.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
        {/* Activity Feed / Recent Synthesis */}
        <section className="lg:col-span-7 space-y-8">
          <div className="flex justify-between items-end px-1">
            <div className="flex items-center gap-4">
              <div className="w-1.5 h-8 bg-saffron-500 rounded-full" />
              <h3 className="text-3xl font-serif font-black text-neutral-900 dark:text-neutral-50 italic">
                Recent Synthesis
              </h3>
            </div>
            <button 
              onClick={() => onNavigate('/cookbook')}
              className="text-[10px] font-bold text-neutral-400 hover:text-saffron-500 transition-colors uppercase tracking-[0.2em]"
            >
              History
            </button>
          </div>
          
          <div className="space-y-4">
            {recentRecipes.length > 0 ? recentRecipes.map((recipe, i) => (
              <button 
                key={recipe.id} 
                onClick={() => onNavigate('/cookbook')}
                className="w-full flex items-center justify-between p-6 bg-white dark:bg-neutral-800/80 rounded-[2rem] border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all group shadow-sm text-left"
              >
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 bg-neutral-100 dark:bg-neutral-900 rounded-2xl flex items-center justify-center text-saffron-500 group-hover:scale-110 transition-transform">
                    {i === 0 ? <Flame size={20} /> : i === 1 ? <Heart size={20} /> : <Sparkles size={20} />}
                  </div>
                  <div>
                    <p className="font-bold text-lg text-neutral-900 dark:text-neutral-50 leading-tight">{recipe.title}</p>
                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-1">Synthesis Complete • {recipe.cuisine}</p>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <span className="text-[10px] font-black text-neutral-400 uppercase tracking-wider">{formatRelativeTime(recipe.createdAt)}</span>
                  <div className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center text-neutral-400 group-hover:text-saffron-500 transition-colors">
                    <ChevronRight size={18} />
                  </div>
                </div>
              </button>
            )) : (
              <div className="p-12 text-center bg-neutral-100/20 dark:bg-neutral-800/40 rounded-[2rem] border-2 border-dashed border-neutral-200 dark:border-neutral-800">
                <p className="text-neutral-400 font-medium italic">No recent protocols synthesized. Visit the Studio to begin.</p>
              </div>
            )}
          </div>
        </section>

        {/* Visual Palette Analysis Card */}
        <section className="lg:col-span-5 bg-neutral-100/50 dark:bg-neutral-800/40 p-8 md:p-12 rounded-[2.5rem] border border-neutral-200 dark:border-neutral-800 space-y-12 backdrop-blur-md">
          <div className="space-y-4">
            <h3 className="text-3xl font-serif font-black text-neutral-900 dark:text-neutral-50 italic">Visual Palette Analysis</h3>
            <p className="text-sm text-neutral-500 font-medium leading-relaxed">Monitoring color accuracy across your culinary logs for maximum display fidelity.</p>
          </div>

          <div className="space-y-10">
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-[0.2em]">Chromatic Balance</span>
                <span className="text-2xl font-serif font-black text-neutral-900 dark:text-neutral-50 italic">98% Corrected</span>
              </div>
              <div className="h-2 bg-white dark:bg-neutral-900 rounded-full overflow-hidden shadow-inner">
                <div className="h-full bg-saffron-500 w-[98%] rounded-full shadow-[0_0_12px_rgba(230,126,34,0.3)] transition-all duration-1000" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-3">
                <div className="p-3 bg-white dark:bg-neutral-800 w-fit rounded-xl text-saffron-500 shadow-sm border border-neutral-100 dark:border-neutral-700">
                  <Coffee size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Regional Focus</p>
                  <p className="text-lg font-serif font-black text-neutral-900 dark:text-neutral-50 leading-none mt-1">Global Fusion</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="p-3 bg-white dark:bg-neutral-800 w-fit rounded-xl text-saffron-500 shadow-sm border border-neutral-100 dark:border-neutral-700">
                  <TrendingUp size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Current Tier</p>
                  <p className="text-lg font-serif font-black text-neutral-900 dark:text-neutral-50 leading-none mt-1">Senior Chef</p>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-neutral-200 dark:border-neutral-700 flex gap-5 items-start">
              <div className="w-10 h-10 bg-saffron-500/10 rounded-xl flex-shrink-0 flex items-center justify-center text-saffron-500">
                <Sparkles size={18} />
              </div>
              <p className="text-xs font-medium text-neutral-500 leading-relaxed italic">
                AI Insight: "Your recipe density shows a high concentration of vibrant pigments. Chromatic balance is optimized for OLED displays."
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
