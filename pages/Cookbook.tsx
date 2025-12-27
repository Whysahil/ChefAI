
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

  // In this demo, 'onlyFavorites' is a UI filter. 
  // Real world implementation would use a 'isFavorite' property on the recipe.
  const filtered = savedRecipes
    .filter(r => r.title.toLowerCase().includes(search.toLowerCase()) || r.cuisine.toLowerCase().includes(search.toLowerCase()));

  if (selectedRecipe) {
    return (
      <div className="max-w-6xl mx-auto animate-fade-in space-y-12 pb-24 text-left">
        <button onClick={() => setSelectedRecipe(null)} className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-saffron-500 flex items-center gap-2 transition-colors">
           ← Return to Library
        </button>
        <div className="bg-white dark:bg-neutral-800/80 rounded-[3rem] p-8 md:p-16 shadow-2xl border border-neutral-200 dark:border-neutral-800 backdrop-blur-sm">
           <div className="flex flex-col lg:flex-row gap-16">
              <div className="lg:w-1/2 space-y-8">
                <div className="relative rounded-[2rem] overflow-hidden shadow-lg border border-neutral-100 dark:border-neutral-700 h-[400px]">
                  <img src={selectedRecipe.imageUrl} className="w-full h-full object-cover" alt={selectedRecipe.title} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-6 bg-neutral-50 dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800">
                    <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Cuisine Matrix</p>
                    <p className="font-serif italic font-black text-neutral-900 dark:text-neutral-50 text-xl">{selectedRecipe.cuisine}</p>
                  </div>
                  <div className="p-6 bg-neutral-50 dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800">
                    <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Time Scale</p>
                    <p className="font-serif italic font-black text-neutral-900 dark:text-neutral-50 text-xl">{selectedRecipe.cookTime}</p>
                  </div>
                </div>
              </div>
              <div className="lg:w-1/2 space-y-10">
                <div className="space-y-4">
                   <div className="flex gap-2">
                     <span className="px-3 py-1 bg-saffron-50 dark:bg-saffron-900/20 text-saffron-600 text-[9px] font-black uppercase tracking-widest rounded-lg border border-saffron-100">{selectedRecipe.difficulty}</span>
                   </div>
                   <h2 className="text-5xl font-serif font-black text-neutral-900 dark:text-neutral-50 italic tracking-tight leading-tight">{selectedRecipe.title}</h2>
                </div>
                
                <div className="space-y-8">
                  <h4 className="text-[12px] font-black text-neutral-400 uppercase tracking-[0.4em] flex items-center gap-3">
                    <span className="w-6 h-px bg-saffron-500"/> Protocol Steps
                  </h4>
                  <div className="space-y-6">
                    {selectedRecipe.instructions.map((step, i) => (
                      <div key={i} className="flex gap-6 group">
                        <span className="text-2xl font-serif font-black text-saffron-500/30 group-hover:text-saffron-500 transition-colors italic">{i+1}</span>
                        <p className="text-base text-neutral-600 dark:text-neutral-400 leading-relaxed font-medium">
                          {step}
                        </p>
                      </div>
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
    <div className="space-y-16 pb-20 text-left">
      <header className="space-y-6">
        <div className="inline-flex items-center gap-3 px-5 py-2 bg-saffron-50 dark:bg-saffron-900/20 text-saffron-600 rounded-full text-[10px] font-black uppercase tracking-[0.3em] border border-saffron-100">
           {onlyFavorites ? <Star size={14} /> : <BookOpen size={14} />} 
           {onlyFavorites ? 'Curated Favorites' : 'Personal Culinary Archive'}
        </div>
        <h2 className="text-6xl font-serif font-black tracking-tight text-neutral-900 dark:text-neutral-50 uppercase italic leading-none">
          {onlyFavorites ? 'Your Top' : 'The Home'}<br/><span className="text-saffron-500">Cookbook.</span>
        </h2>
        
        <div className="flex flex-col md:flex-row gap-6 pt-4">
          <div className="relative flex-1 group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-neutral-300 group-focus-within:text-saffron-500 transition-colors" size={20} />
            <input 
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search library..."
              className="w-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 rounded-3xl py-5 pl-16 pr-8 text-sm font-bold placeholder:text-neutral-300 focus:outline-none focus:border-saffron-500 transition-all shadow-sm"
            />
          </div>
        </div>
      </header>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {filtered.map(recipe => (
            <div 
              key={recipe.id} 
              className="bg-white dark:bg-neutral-800 rounded-[3rem] overflow-hidden border border-neutral-200 dark:border-neutral-800 shadow-xl hover:shadow-2xl transition-all duration-500 group"
            >
              <div className="relative h-64 overflow-hidden">
                <img src={recipe.imageUrl} alt={recipe.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <button 
                  onClick={(e) => { e.stopPropagation(); deleteRecipe(recipe.id); }}
                  className="absolute top-6 right-6 p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-paprika-600 transition-colors z-10"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="p-10 space-y-6">
                <div className="flex items-center gap-4 text-[10px] font-black text-saffron-500 uppercase tracking-widest">
                  <span>{recipe.cuisine}</span>
                  <div className="w-1 h-1 rounded-full bg-neutral-300" />
                  <span>{recipe.mealType}</span>
                </div>
                <h3 className="text-2xl font-serif font-black text-neutral-900 dark:text-neutral-50 leading-tight italic line-clamp-2">{recipe.title}</h3>
                <div className="flex items-center gap-8 pt-4">
                  <div className="flex items-center gap-2 text-neutral-400">
                    <Clock size={16} /> <span className="text-[10px] font-bold uppercase tracking-widest">{recipe.cookTime}</span>
                  </div>
                  <div className="flex items-center gap-2 text-neutral-400">
                    <Utensils size={16} /> <span className="text-[10px] font-bold uppercase tracking-widest">{recipe.difficulty}</span>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedRecipe(recipe)}
                  className="w-full py-4 bg-neutral-50 dark:bg-neutral-900 text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400 group-hover:bg-saffron-500 group-hover:text-white rounded-2xl transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  Open Blueprint <ChevronRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="min-h-[400px] flex flex-col items-center justify-center text-center p-20 bg-neutral-50 dark:bg-neutral-800/20 rounded-[4rem] border border-dashed border-neutral-200 dark:border-neutral-800">
          <BookOpen size={64} className="text-neutral-200 dark:text-neutral-700 mb-8" />
          <h3 className="text-3xl font-serif font-black text-neutral-900 dark:text-neutral-50 mb-4 uppercase italic">Archive Empty</h3>
          <p className="text-neutral-400 font-medium max-w-sm">No protocols found. Visit the Studio to synthesize a new culinary masterpiece.</p>
        </div>
      )}
    </div>
  );
};

export default Cookbook;
