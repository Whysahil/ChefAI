
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ChefHat, BookOpen, Clock, Heart, ArrowRight, TrendingUp, Sparkles, Flame, Coffee } from 'lucide-react';

const Dashboard: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const { user } = useAuth();

  const insights = [
    { name: 'CULINARY LOGS', value: '12 Recipes', icon: <ChefHat size={16} /> },
    { name: 'COOKBOOK', value: '28 Saved', icon: <BookOpen size={16} /> },
    { name: 'KITCHEN TIME', value: '15 Hours', icon: <Clock size={16} /> },
    { name: 'FAVORITES', value: '8 Picks', icon: <Heart size={16} /> },
  ];

  return (
    <div className="space-y-12 md:space-y-16 animate-slide-up">
      {/* Visual Header Section */}
      <div className="relative h-80 md:h-[450px] rounded-[2rem] overflow-hidden shadow-xl border border-neutral-200 dark:border-neutral-800 group">
        <img 
          src="https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&q=80&w=2000" 
          alt="Culinary Inspiration" 
          className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-700 scale-100 group-hover:scale-105"
        />
        {/* Neutral Neutral-Density Gradient to preserve tones */}
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/90 via-neutral-900/40 to-transparent" />
        
        <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-16 space-y-4 md:space-y-6 max-w-4xl">
          <div className="inline-flex items-center gap-2 text-saffron-500 font-bold text-[10px] tracking-widest uppercase bg-neutral-900/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-neutral-700">
            <Sparkles size={14} /> Traditional Wisdom • AI Precision
          </div>
          <h1 className="text-4xl md:text-6xl font-serif font-black text-white tracking-tight leading-tight">
            Elevating Traditions <br/> 
            <span className="text-saffron-500 italic">via Intelligence.</span>
          </h1>
          <p className="text-base md:text-lg text-neutral-300 font-medium leading-relaxed max-w-2xl">
            Experience culinary synthesis that respects original textures and tones. Calibrated for visual clarity and long-term kitchen comfort.
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <button 
              onClick={() => onNavigate('/studio')}
              className="bg-saffron-500 text-white px-8 py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-3 hover:bg-saffron-600 transition-all shadow-lg shadow-saffron-500/20"
            >
              Enter Studio <ArrowRight size={16} />
            </button>
            <button 
              className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-8 py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-white/20 transition-all"
            >
              View Archives
            </button>
          </div>
        </div>
      </div>

      {/* Insight Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {insights.map((insight, i) => (
          <div key={i} className="bg-white dark:bg-neutral-800 p-6 md:p-8 rounded-2xl border border-neutral-200 dark:border-neutral-800 transition-all hover:border-saffron-500/50">
            <div className="text-saffron-500 mb-6 p-3 bg-saffron-50 dark:bg-saffron-900/20 w-fit rounded-xl">
              {insight.icon}
            </div>
            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">{insight.name}</p>
            <p className="text-2xl md:text-3xl font-serif font-black text-neutral-900 dark:text-neutral-50 leading-none">{insight.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
        {/* Activity Feed */}
        <section className="lg:col-span-7 space-y-8">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-2xl font-serif font-black text-neutral-900 dark:text-neutral-50 flex items-center gap-3">
              <div className="w-1.5 h-6 bg-saffron-500 rounded-full" />
              Recent Synthesis
            </h3>
            <button className="text-[10px] font-bold text-neutral-400 hover:text-saffron-500 transition-colors uppercase tracking-widest">History</button>
          </div>
          
          <div className="space-y-3">
            {[
              { title: 'Signature Garlic Naan', type: 'Synthesis Complete', date: '45m ago', icon: <Flame className="text-paprika-600" size={16} /> },
              { title: 'Spicy Dal Tadka', type: 'Archived', date: 'Yesterday', icon: <Heart className="text-paprika-600" size={16} /> },
              { title: 'Basmati Logic Map', type: 'Analysis Run', date: 'Oct 24', icon: <Sparkles className="text-saffron-500" size={16} /> }
            ].map((activity, i) => (
              <div key={i} className="flex items-center justify-between p-5 bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/80 transition-all">
                <div className="flex items-center gap-6">
                  <div className="w-10 h-10 bg-neutral-100 dark:bg-neutral-900 rounded-lg flex items-center justify-center text-saffron-500">
                    {activity.icon}
                  </div>
                  <div>
                    <p className="font-bold text-base text-neutral-900 dark:text-neutral-50 leading-tight">{activity.title}</p>
                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wide mt-1">{activity.type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase">{activity.date}</span>
                  <div className="w-8 h-8 rounded-full bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center text-neutral-300">
                    <ArrowRight size={14} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Nutritional & Taste Section */}
        <section className="lg:col-span-5 bg-neutral-100/50 dark:bg-neutral-800/40 p-8 md:p-10 rounded-[2rem] border border-neutral-200 dark:border-neutral-800 space-y-10">
          <div className="space-y-3">
            <h3 className="text-2xl font-serif font-black text-neutral-900 dark:text-neutral-50">Visual Palette Analysis</h3>
            <p className="text-sm text-neutral-500 font-medium">Monitoring color accuracy across your culinary logs.</p>
          </div>

          <div className="space-y-8">
            <div className="space-y-3">
              <div className="flex justify-between items-end">
                <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Chromatic Balance</span>
                <span className="text-lg font-serif font-black text-neutral-900 dark:text-neutral-50">98% Corrected</span>
              </div>
              <div className="h-1.5 bg-white dark:bg-neutral-900 rounded-full overflow-hidden">
                <div className="h-full bg-saffron-500 w-[98%] rounded-full" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-2">
                <div className="p-2.5 bg-white dark:bg-neutral-800 w-fit rounded-lg text-saffron-500 shadow-sm border border-neutral-100 dark:border-neutral-700">
                  <Coffee size={18} />
                </div>
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Regional Focus</p>
                <p className="text-lg font-serif font-black text-neutral-900 dark:text-neutral-50 leading-none">Global Fusion</p>
              </div>
              <div className="space-y-2">
                <div className="p-2.5 bg-white dark:bg-neutral-800 w-fit rounded-lg text-saffron-500 shadow-sm border border-neutral-100 dark:border-neutral-700">
                  <TrendingUp size={18} />
                </div>
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Current Tier</p>
                <p className="text-lg font-serif font-black text-neutral-900 dark:text-neutral-50 leading-none">Senior Chef</p>
              </div>
            </div>

            <div className="pt-8 border-t border-neutral-200 dark:border-neutral-700 flex gap-4 items-start">
              <div className="w-8 h-8 bg-saffron-500/10 rounded-lg flex-shrink-0 flex items-center justify-center text-saffron-500">
                <Sparkles size={16} />
              </div>
              <p className="text-[11px] font-medium text-neutral-500 leading-relaxed italic">
                AI Insight: "Your recipe density is high in vitamin-rich leafy greens this week. Suggesting a 2% increase in protein synthesis for balance."
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
