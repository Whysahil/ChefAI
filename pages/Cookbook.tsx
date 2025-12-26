
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Star, Trash2, ChevronRight, Clock, Utensils, Search, Filter } from 'lucide-react';
import { Recipe } from '../types';

interface CookbookProps {
  onlyFavorites?: boolean;
}

const Cookbook: React.FC<CookbookProps> = ({ onlyFavorites = false }) => {
  const { savedRecipes, deleteRecipe } = useAuth();
  const [search, setSearch] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  const filtered = savedRecipes
    .filter(r => onlyFavorites ? true : true) // Placeholder for favorite filter logic
    .filter(r => r.title.toLowerCase().includes(search.toLowerCase()) || r.cuisine.toLowerCase().includes(search.toLowerCase()));

  if (selectedRecipe) {
    return (
      <div className="px-6 md:px-12 animate-fade-in space-y-12">
        <button onClick={() => setSelectedRecipe(null)} className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-saffron-500 flex items-center gap-2">
           ← Return to Library
        </button>
        <div className="bg-white dark:bg-charcoal-800 rounded-[3rem] p-12 md:p-20 shadow-2xl border border-paper-100 dark:border-white/5">
           <div className="flex flex-col lg:flex-row gap-16">
              <div className="lg:w-1/2 space-y-8">
                <img src={selectedRecipe.imageUrl} className="w-full aspect-[4/3] object-cover rounded-[2rem]" />
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-6 bg-paper-50 dark:bg-charcoal-900 rounded-2xl">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Cuisine</p>
                    <p className="font-serif italic font-black text-curry-900 dark:text-white">{selectedRecipe.cuisine}</p>
                  </div>
                  <div className="p-6 bg-paper-50 dark:bg-charcoal-900 rounded-2xl">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Time</p>
                    <p className="font-serif italic font-black text-curry-900 dark:text-white">{selectedRecipe.cookTime}</p>
                  </div>
                </div>
              </div>
              <div className="lg:w-1/2 space-y-10 text-left">
                <h2 className="text-5xl font-serif font-black text-curry-900 dark:text-white italic">{selectedRecipe.title}</h2>
                <div className="space-y-6">
                  <h4 className="text-[12px] font-black text-slate-400 uppercase tracking-[0.4em]">Protocol Steps</h4>
                  <div className="space-y-6">
                    {selectedRecipe.instructions.map((step, i) => (
                      <p key={i} className="text-base text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                        <span className="font-black text-saffron-500 mr-4">{i+1}.</span> {step}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 md:px-12 space-y-16 pb-20">
      <header className="space-y-6">
        <div className="inline-flex items-center gap-3 px-5 py-2 bg-saffron-50 dark:bg-saffron-900/20 text-saffron-600 rounded-full text-[10px] font-black uppercase tracking-[0.3em] border border-saffron-100">
           {onlyFavorites ? <Star size={14} /> : <BookOpen size={14} />} 
           {onlyFavorites ? 'Curated Favorites' : 'Personal Culinary Archive'}
        </div>
        <h2 className="text-6xl font-serif font-black tracking-tight text-curry-900 dark:text-white uppercase italic leading-none">
          {onlyFavorites ? 'Your Top' : 'The Home'}<br/><span className="text-saffron-500">Cookbook.</span>
        </h2>
        
        <div className="flex flex-col md:flex-row gap-6 pt-4">
          <div className="relative flex-1 group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-saffron-500 transition-colors" size={20} />
            <input 
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by title, cuisine or ingredient..."
              className="w-full bg-white dark:bg-charcoal-800 border-2 border-paper-100 dark:border-white/5 rounded-3xl py-5 pl-16 pr-8 text-sm font-bold placeholder:text-slate-300 focus:outline-none focus:border-saffron-500 transition-all shadow-sm"
            />
          </div>
          <button className="px-10 py-5 bg-white dark:bg-charcoal-800 border border-paper-100 dark:border-white/5 rounded-3xl flex items-center gap-3 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-curry-900 transition-all">
            <Filter size={18} /> Refine
          </button>
        </div>
      </header>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
          {filtered.map(recipe => (
            <div 
              key={recipe.id} 
              className="bg-white dark:bg-charcoal-800 rounded-[3rem] overflow-hidden border border-paper-100 dark:border-white/5 shadow-xl hover:shadow-2xl transition-all duration-500 group"
            >
              <div className="relative h-64 overflow-hidden">
                <img src={recipe.imageUrl} alt={recipe.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <button 
                  onClick={() => deleteRecipe(recipe.id)}
                  className="absolute top-6 right-6 p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-paprika-600 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="p-10 space-y-6 text-left">
                <div className="flex items-center gap-4 text-[10px] font-black text-saffron-500 uppercase tracking-widest">
                  <span>{recipe.cuisine}</span>
                  <div className="w-1 h-1 rounded-full bg-slate-300" />
                  <span>{recipe.mealType}</span>
                </div>
                <h3 className="text-2xl font-serif font-black text-curry-900 dark:text-white leading-tight italic">{recipe.title}</h3>
                <div className="flex items-center gap-8 pt-4">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Clock size={16} /> <span className="text-[10px] font-bold uppercase tracking-widest">{recipe.cookTime}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <Utensils size={16} /> <span className="text-[10px] font-bold uppercase tracking-widest">{recipe.difficulty}</span>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedRecipe(recipe)}
                  className="w-full py-4 bg-paper-50 dark:bg-charcoal-900 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 group-hover:bg-saffron-500 group-hover:text-white rounded-2xl transition-all flex items-center justify-center gap-2"
                >
                  View Blueprint <ChevronRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="min-h-[400px] flex flex-col items-center justify-center text-center p-20 bg-paper-50 dark:bg-charcoal-800/30 rounded-[4rem] border border-dashed border-paper-200 dark:border-white/10">
          <BookOpen size={64} className="text-slate-200 dark:text-charcoal-800 mb-8" />
          <h3 className="text-3xl font-serif font-black text-curry-900 dark:text-white mb-4 uppercase italic">Archive Empty</h3>
          <p className="text-slate-400 font-medium max-w-sm">No recipes found in your synthesis history. Visit the Studio to generate a new culinary masterpiece.</p>
        </div>
      )}
    </div>
  );
};

export default Cookbook;
