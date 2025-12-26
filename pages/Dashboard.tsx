
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ChefHat, BookOpen, Clock, Heart, ArrowRight, TrendingUp, Sparkles, Flame, Coffee } from 'lucide-react';

const Dashboard: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const { user } = useAuth();

  const insights = [
    { name: 'CULINARY LOGS', value: '12 Recipes', icon: <ChefHat size={18} /> },
    { name: 'COOKBOOK', value: '28 Saved', icon: <BookOpen size={18} /> },
    { name: 'KITCHEN TIME', value: '15 Hours', icon: <Clock size={18} /> },
    { name: 'FAVORITES', value: '8 Picks', icon: <Heart size={18} /> },
  ];

  return (
    <div className="space-y-20 animate-slide-up pb-10">
      {/* Editorial Hero: Modern Indian Vibe */}
      <div className="relative group">
        <div className="absolute inset-0 bg-charcoal-900 rounded-[3rem] overflow-hidden shadow-2xl">
          <img 
            src="https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&q=80&w=2000" 
            alt="Indian Spices & Cooking" 
            className="w-full h-full object-cover opacity-40 grayscale-[40%] hover:grayscale-0 transition-all duration-1000 scale-105 group-hover:scale-100"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-charcoal-900 via-charcoal-900/60 to-transparent" />
          <div className="absolute top-0 right-0 p-12 opacity-5">
            <img src="https://cdn.pixabay.com/photo/2017/09/01/21/53/mandala-2705640_1280.png" className="w-96 h-96" alt="" />
          </div>
        </div>
        
        <div className="relative z-10 px-16 py-28 space-y-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 text-saffron-500 font-bold text-[10px] tracking-[0.3em] uppercase bg-saffron-900/20 px-4 py-2 rounded-full border border-saffron-500/20">
            <Sparkles size={14} /> Traditional Heart, AI Brain
          </div>
          <h1 className="text-6xl md:text-7xl font-serif font-black text-white tracking-tight leading-[0.9]">
            Homestyle cooking, <br/> 
            <span className="text-saffron-500 italic">evolved.</span>
          </h1>
          <p className="text-xl text-slate-300 font-normal leading-relaxed tracking-tight max-w-xl">
            ChefAI blends the warmth of traditional Indian recipes with the precision of culinary intelligence. Ready for your next masterpiece?
          </p>
          <div className="flex flex-wrap gap-6 pt-4">
            <button 
              onClick={() => onNavigate('/studio')}
              className="bg-saffron-500 text-white px-10 py-5 rounded-full font-bold text-xs uppercase tracking-widest flex items-center gap-4 hover:bg-saffron-600 transition-all duration-500 shadow-xl shadow-saffron-500/30"
            >
              Enter Studio <ArrowRight size={18} />
            </button>
            <button 
              className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-10 py-5 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-white/20 transition-all duration-500"
            >
              Explore Traditions
            </button>
          </div>
        </div>
      </div>

      {/* Insight Grid: Indian Palette */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {insights.map((insight, i) => (
          <div key={i} className="bg-white dark:bg-charcoal-800 p-10 rounded-[2.5rem] border border-paper-100 dark:border-white/5 shadow-sm group hover:shadow-xl hover:-translate-y-1 transition-all duration-500">
            <div className="text-saffron-500 mb-8 p-4 bg-saffron-50 dark:bg-saffron-900/10 w-fit rounded-2xl group-hover:scale-110 transition-transform duration-500">
              {insight.icon}
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{insight.name}</p>
            <p className="text-4xl font-serif font-black tracking-tight text-curry-900 dark:text-white leading-none">{insight.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Activity Logs */}
        <section className="lg:col-span-7 space-y-10">
          <div className="flex justify-between items-end px-4">
            <h3 className="text-3xl font-serif font-black tracking-tight text-curry-900 dark:text-white flex items-center gap-4">
              <div className="w-2 h-8 bg-saffron-500 rounded-full" />
              Culinary Records
            </h3>
            <button className="text-[10px] font-bold text-saffron-600 hover:text-paprika-600 transition-colors uppercase tracking-widest border-b border-saffron-200">View Archive</button>
          </div>
          
          <div className="space-y-4">
            {[
              { title: 'Tandoori Mushroom Tikka', type: 'Synthesis Completed', date: '2h ago', icon: <Flame className="text-paprika-600" size={16} /> },
              { title: 'Mysore Masala Dosa', type: 'Saved to Traditions', date: 'Yesterday', icon: <Heart className="text-paprika-600" size={16} /> },
              { title: 'Ghee Roast Chicken', type: 'Intelligence Map Built', date: '3d ago', icon: <Sparkles className="text-saffron-500" size={16} /> }
            ].map((activity, i) => (
              <div key={i} className="flex items-center justify-between p-8 bg-white dark:bg-charcoal-800 rounded-3xl border border-paper-100 dark:border-white/5 group hover:border-saffron-200 transition-all duration-300 shadow-sm">
                <div className="flex items-center gap-8">
                  <div className="w-14 h-14 bg-paper-50 dark:bg-charcoal-900 rounded-full flex items-center justify-center text-saffron-500 shadow-inner">
                    {activity.icon}
                  </div>
                  <div>
                    <p className="font-bold text-lg tracking-tight text-curry-900 dark:text-white leading-none">{activity.title}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">{activity.type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{activity.date}</span>
                  <div className="w-10 h-10 rounded-full border border-paper-100 dark:border-white/10 flex items-center justify-center group-hover:bg-saffron-500 group-hover:text-white transition-all duration-500">
                    <ArrowRight size={16} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Nutritional & Taste Section */}
        <section className="lg:col-span-5 bg-paper-100 dark:bg-charcoal-800/40 p-12 rounded-[3.5rem] border border-white/50 dark:border-white/5 space-y-12">
          <div className="space-y-4">
            <h3 className="text-3xl font-serif font-black text-curry-900 dark:text-white">Taste Intelligence</h3>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">Your current profile leans heavily towards <span className="text-paprika-600 font-bold">Spicy</span> and <span className="text-saffron-600 font-bold">Umami</span> notes.</p>
          </div>

          <div className="space-y-12">
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Homestyle Preference</span>
                <span className="text-xl font-serif font-black text-curry-900 dark:text-white">92%</span>
              </div>
              <div className="h-2 bg-white dark:bg-charcoal-800 rounded-full overflow-hidden p-0.5">
                <div className="h-full bg-gradient-to-r from-turmeric-400 to-saffron-500 rounded-full w-[92%] transition-all duration-1000" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-12">
              <div className="space-y-3">
                <div className="p-3 bg-white dark:bg-charcoal-800 w-fit rounded-xl text-saffron-500 mb-2 shadow-sm">
                  <Coffee size={18} />
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Regional Affinity</p>
                <p className="text-xl font-serif font-black text-curry-900 dark:text-white leading-none">South Indian</p>
              </div>
              <div className="space-y-3">
                <div className="p-3 bg-white dark:bg-charcoal-800 w-fit rounded-xl text-saffron-500 mb-2 shadow-sm">
                  <TrendingUp size={18} />
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Proficiency</p>
                <p className="text-xl font-serif font-black text-curry-900 dark:text-white leading-none">Expert</p>
              </div>
            </div>

            <div className="pt-10 border-t border-white/40 dark:border-white/5 flex gap-6 items-start">
              <div className="w-10 h-10 bg-saffron-500/10 rounded-full flex-shrink-0 flex items-center justify-center text-saffron-500">
                <Sparkles size={18} />
              </div>
              <p className="text-xs font-medium text-slate-600 dark:text-slate-400 leading-relaxed italic">
                AI Suggestion: "Your frequent use of Curry Leaves and Mustard Seeds suggests an 18% match for Chettinad variations this week."
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
