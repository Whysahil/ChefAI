
import React, { useState, useEffect } from 'react';
import { Utensils, Mic, Plus, Trash2, Wand2, ChefHat, Sparkles, Loader2, Map, Globe, Thermometer, Zap, ChevronDown, ChevronUp, Search, Info } from 'lucide-react';
import { generateRecipe, generateRecipeImage, parseFiltersWithAI } from '../services/geminiService';
import { Recipe } from '../types';
import { CUISINES, DIETS, SKILL_LEVELS, MEAL_TYPES, SPICE_LEVELS, COOKING_PREFERENCES, INGREDIENT_CATEGORIES } from '../constants';
import ChefChat from '../components/ChefChat';

const Studio: React.FC = () => {
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedRecipe, setGeneratedRecipe] = useState<Recipe | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isParsingFilters, setIsParsingFilters] = useState(false);
  const [voiceFeedback, setVoiceFeedback] = useState<string | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(INGREDIENT_CATEGORIES[0].name);
  
  const [prefs, setPrefs] = useState({
    diet: 'None',
    cuisine: 'North Indian',
    mealType: 'Dinner',
    skill: 'Intermediate',
    spiceLevel: 'Medium',
    cookingPreference: 'Home-style'
  });

  const toggleIngredient = (ing: string) => {
    setIngredients(prev => prev.includes(ing) ? prev.filter(i => i !== ing) : [...prev, ing]);
  };

  const addCustomIngredient = () => {
    if (inputValue.trim() && !ingredients.includes(inputValue.trim().toLowerCase())) {
      setIngredients(prev => [...prev, inputValue.trim().toLowerCase()]);
      setInputValue('');
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGeneratedRecipe(null);
    try {
      const recipe = await generateRecipe({ ingredients, ...prefs });
      const imageUrl = await generateRecipeImage(recipe.imagePrompt);
      setGeneratedRecipe({ ...recipe, imageUrl });
      if (window.innerWidth < 1024) {
        document.getElementById('recipe-result')?.scrollIntoView({ behavior: 'smooth' });
      }
    } catch (err) { 
      alert("Intelligence synthesis failed. Refine inputs and retry."); 
    } finally { 
      setIsGenerating(false); 
    }
  };

  return (
    <div className="w-full px-6 md:px-12 lg:px-20 space-y-16 md:space-y-28">
      {/* Responsive Hero Section */}
      <header className="flex flex-col lg:flex-row gap-12 lg:items-center">
        <div className="flex-1 space-y-6 md:space-y-8 text-center lg:text-left">
          <div className="inline-flex items-center gap-3 px-5 py-2 bg-saffron-50 dark:bg-saffron-900/20 text-saffron-600 rounded-full text-[10px] font-black uppercase tracking-[0.3em] border border-saffron-100">
            <Sparkles size={14} /> The Studio / Engine 2.1
          </div>
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-serif font-black tracking-tight text-curry-900 dark:text-white uppercase italic leading-[1.1] lg:leading-[0.9]">
            Architect your <br/><span className="text-saffron-500 italic">Culinary Path.</span>
          </h2>
          <p className="text-slate-400 font-medium text-lg md:text-xl max-w-2xl mx-auto lg:mx-0 leading-relaxed">
            Fill your Masala Dabba with ingredients and define your parameters. ChefAI transforms your preferences into traditional masterpieces.
          </p>
        </div>
        <div className="hidden lg:block w-1/3 aspect-square relative">
          <div className="absolute inset-0 bg-paper-100 rounded-full border-8 border-white shadow-inner animate-pulse opacity-50" />
          <img 
            src="https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=1000" 
            className="w-full h-full object-cover rounded-full border-4 border-white shadow-2xl relative z-10"
            alt="Spices"
          />
        </div>
      </header>

      {/* Grid: 12 Desktop / 8 Tablet / 4 Mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 md:gap-20">
        
        {/* Input Controls (5/12 Desktop) */}
        <div className="lg:col-span-5 space-y-12">
          
          {/* Meal Types: Tablet Pill Tabs / Mobile Horizontal Scroll */}
          <section className="space-y-6">
             <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.4em] flex items-center gap-3">
              <div className="w-2 h-4 bg-saffron-500 rounded-full" />
              Meal Occasion
            </h4>
            <div className="flex overflow-x-auto gap-3 pb-4 no-scrollbar -mx-6 px-6 md:mx-0 md:px-0 scroll-smooth">
              {MEAL_TYPES.map(m => (
                <button
                  key={m.name}
                  onClick={() => setPrefs(p => ({ ...p, mealType: m.name }))}
                  className={`flex-shrink-0 flex items-center gap-3 px-6 py-3.5 rounded-2xl text-xs font-bold transition-all border ${prefs.mealType === m.name ? 'bg-saffron-500 text-white border-transparent shadow-xl shadow-saffron-500/20 scale-105' : 'bg-white dark:bg-charcoal-800 text-slate-500 border-paper-100 dark:border-white/5 hover:border-saffron-500'}`}
                >
                  {m.icon}
                  {m.name}
                </button>
              ))}
            </div>
          </section>

          {/* Ingredient Selector: Masala Dabba Aesthetic */}
          <section className="bg-white dark:bg-charcoal-800 p-8 md:p-12 rounded-[3.5rem] border border-paper-100 dark:border-white/5 shadow-2xl space-y-10">
            <div className="flex items-center justify-between border-b border-paper-50 dark:border-white/5 pb-8">
              <h4 className="text-[11px] font-black text-curry-900 dark:text-white uppercase tracking-[0.4em]">The Spice Box</h4>
              <span className="text-[10px] font-black text-saffron-600 bg-saffron-50 px-3 py-1 rounded-full uppercase">{ingredients.length} Selected</span>
            </div>

            <div className="space-y-4">
              {INGREDIENT_CATEGORIES.map(cat => (
                <div key={cat.name} className="border-b border-paper-50 dark:border-white/5 last:border-0 overflow-hidden">
                  <button 
                    onClick={() => setExpandedCategory(expandedCategory === cat.name ? null : cat.name)}
                    className="w-full flex items-center justify-between py-5 text-base font-bold text-curry-900 dark:text-white hover:text-saffron-500 transition-colors"
                  >
                    <span className="flex items-center gap-4">
                      <div className={`w-1.5 h-1.5 rounded-full transition-all ${expandedCategory === cat.name ? 'bg-saffron-500 scale-150' : 'bg-turmeric-400'}`} />
                      {cat.name}
                    </span>
                    {expandedCategory === cat.name ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                  {expandedCategory === cat.name && (
                    <div className="grid grid-cols-2 md:grid-cols-2 gap-3 pb-8 pt-2 animate-fade-in">
                      {cat.items.map(item => (
                        <button
                          key={item}
                          onClick={() => toggleIngredient(item)}
                          className={`px-4 py-3 text-[10px] font-bold uppercase tracking-widest transition-all rounded-xl border text-center ${ingredients.includes(item) ? 'bg-saffron-50 text-saffron-700 border-saffron-400' : 'bg-paper-50 dark:bg-charcoal-900 text-slate-500 border-paper-50 dark:border-white/5 hover:border-saffron-200'}`}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="pt-6 border-t border-paper-50 dark:border-white/5 flex gap-4">
              <div className="relative flex-1 group">
                <input 
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addCustomIngredient()}
                  placeholder="Custom Ingredient..."
                  className="w-full bg-transparent border-b border-paper-100 dark:border-white/10 py-4 text-lg font-serif italic font-bold placeholder:text-slate-200 focus:outline-none focus:border-saffron-500 transition-colors"
                />
              </div>
              <button onClick={addCustomIngredient} className="w-14 h-14 bg-curry-900 dark:bg-white text-white dark:text-charcoal-900 rounded-full flex items-center justify-center hover:bg-saffron-500 transition-all shadow-lg">
                <Plus size={24} />
              </button>
            </div>
          </section>

          {/* Configuration Grid */}
          <section className="bg-paper-100 dark:bg-charcoal-800/40 p-10 md:p-12 rounded-[3.5rem] border border-white dark:border-white/5 space-y-12">
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.4em] border-b border-white/40 pb-6">Synthesis Parameters</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Region / Cuisine</label>
                <select 
                  value={prefs.cuisine}
                  onChange={e => setPrefs(p => ({ ...p, cuisine: e.target.value }))}
                  className="w-full bg-transparent border-b border-white/50 dark:border-white/10 py-3 text-base font-serif font-black italic text-curry-900 dark:text-white focus:outline-none focus:border-saffron-500"
                >
                  {CUISINES.map(c => <option key={c} value={c} className="bg-white dark:bg-charcoal-900">{c}</option>)}
                </select>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Heat Profile</label>
                <select 
                  value={prefs.spiceLevel}
                  onChange={e => setPrefs(p => ({ ...p, spiceLevel: e.target.value }))}
                  className="w-full bg-transparent border-b border-white/50 dark:border-white/10 py-3 text-base font-serif font-black italic text-curry-900 dark:text-white focus:outline-none focus:border-saffron-500"
                >
                  {SPICE_LEVELS.map(s => <option key={s} value={s} className="bg-white dark:bg-charcoal-900">{s}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Execution Mode</label>
                <select 
                  value={prefs.cookingPreference}
                  onChange={e => setPrefs(p => ({ ...p, cookingPreference: e.target.value }))}
                  className="w-full bg-transparent border-b border-white/50 dark:border-white/10 py-3 text-base font-serif font-black italic text-curry-900 dark:text-white focus:outline-none focus:border-saffron-500"
                >
                  {COOKING_PREFERENCES.map(cp => <option key={cp} value={cp} className="bg-white dark:bg-charcoal-900">{cp}</option>)}
                </select>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Proficiency</label>
                <select 
                  value={prefs.skill}
                  onChange={e => setPrefs(p => ({ ...p, skill: e.target.value as any }))}
                  className="w-full bg-transparent border-b border-white/50 dark:border-white/10 py-3 text-base font-serif font-black italic text-curry-900 dark:text-white focus:outline-none focus:border-saffron-500"
                >
                  {SKILL_LEVELS.map(s => <option key={s} value={s} className="bg-white dark:bg-charcoal-900">{s}</option>)}
                </select>
              </div>
            </div>

            <button 
              onClick={handleGenerate}
              disabled={isGenerating || ingredients.length === 0}
              className="w-full py-7 bg-saffron-500 text-white font-black text-xs uppercase tracking-[0.4em] flex items-center justify-center gap-5 rounded-[2.5rem] hover:bg-saffron-600 transition-all disabled:opacity-50 shadow-2xl shadow-saffron-500/40 group"
            >
              {isGenerating ? <Loader2 size={24} className="animate-spin" /> : <Wand2 size={24} className="group-hover:rotate-12 transition-transform" />}
              {isGenerating ? 'Computing Strategy...' : '👉 Generate Personalized Recipe'}
            </button>
          </section>
        </div>

        {/* Output Area (7/12 Desktop) */}
        <div id="recipe-result" className="lg:col-span-7 pt-12 lg:pt-0">
          {isGenerating ? (
            <div className="min-h-[800px] flex flex-col items-center justify-center text-center p-20 bg-white dark:bg-charcoal-800 rounded-[4rem] border border-paper-100 dark:border-white/5 shadow-2xl animate-pulse">
              <div className="relative mb-12">
                <div className="w-32 h-32 border-4 border-paper-50 rounded-full border-t-saffron-500 animate-spin" />
                <ChefHat className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-saffron-500" size={48} strokeWidth={1} />
              </div>
              <h2 className="text-3xl font-serif font-black tracking-tight mb-6 uppercase italic text-curry-900 dark:text-white">Mapping Culinary Records...</h2>
              <p className="text-slate-400 max-w-sm mx-auto text-lg leading-relaxed font-medium italic">Consulting regional flavor profiles and optimizing your instruction set.</p>
            </div>
          ) : generatedRecipe ? (
            <div className="space-y-16 animate-slide-up pb-32">
              {/* Recipe Presentation Card */}
              <div className="relative h-[500px] md:h-[650px] rounded-[3rem] md:rounded-[4rem] overflow-hidden shadow-2xl group border-8 border-white dark:border-charcoal-800">
                <img src={generatedRecipe.imageUrl} alt={generatedRecipe.title} className="w-full h-full object-cover grayscale-[5%] group-hover:grayscale-0 transition-all duration-1000 scale-105 group-hover:scale-100" />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900 via-charcoal-900/10 to-transparent flex flex-col justify-end p-10 md:p-20">
                  <div className="space-y-4 md:space-y-6 max-w-3xl">
                    <div className="flex items-center gap-6">
                      <span className="text-saffron-500 font-bold text-[11px] uppercase tracking-[0.5em]">{generatedRecipe.cuisine}</span>
                      <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
                      <span className="text-white/60 font-bold text-[11px] uppercase tracking-[0.5em]">{generatedRecipe.mealType}</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-serif font-black text-white tracking-tight leading-none uppercase italic drop-shadow-2xl">{generatedRecipe.title}</h1>
                    <p className="text-lg md:text-xl text-slate-200 font-normal leading-relaxed italic line-clamp-2 md:line-clamp-3">"{generatedRecipe.description}"</p>
                  </div>
                </div>
              </div>

              {/* Recipe Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-20">
                <div className="space-y-16">
                  {/* Ingredients */}
                  <div className="space-y-8">
                    <h4 className="text-[12px] font-bold text-slate-400 uppercase tracking-[0.4em] flex items-center gap-4">
                      <Utensils size={18} /> Component Alignment
                    </h4>
                    <ul className="space-y-px bg-paper-50 dark:bg-charcoal-800/50 border border-paper-100 dark:border-white/5 rounded-[2.5rem] overflow-hidden">
                      {generatedRecipe.ingredients.map((ing, i) => (
                        <li key={i} className="flex items-center justify-between p-7 bg-white dark:bg-charcoal-800 hover:bg-paper-50 dark:hover:bg-charcoal-700 transition-colors border-b border-paper-50 last:border-0">
                          <span className="text-base font-bold text-curry-900 dark:text-white">{ing.name}</span>
                          <span className="text-[11px] font-black text-saffron-500 uppercase tracking-widest bg-saffron-50 dark:bg-saffron-900/10 px-4 py-1.5 rounded-full">{ing.amount} {ing.unit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Substitutions */}
                  {generatedRecipe.substitutions && (
                    <div className="p-12 bg-paper-100 dark:bg-charcoal-800/40 rounded-[3rem] border border-white dark:border-white/5 space-y-6">
                       <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.4em]">Substitutions</h5>
                       <ul className="space-y-3">
                         {generatedRecipe.substitutions.map((s, i) => (
                           <li key={i} className="text-sm font-medium text-slate-500 flex gap-3"><div className="w-1.5 h-1.5 rounded-full bg-saffron-500 mt-1.5 shrink-0" /> {s}</li>
                         ))}
                       </ul>
                    </div>
                  )}
                </div>

                <div className="space-y-16">
                  {/* Instructions */}
                  <div className="space-y-12">
                     <h4 className="text-[12px] font-bold text-slate-400 uppercase tracking-[0.4em] flex items-center gap-4">
                      <Map size={18} /> Execution Roadmap
                    </h4>
                    <div className="space-y-12">
                       {generatedRecipe.instructions.map((step, i) => (
                        <div key={i} className="flex gap-10 group">
                          <span className="flex-shrink-0 w-10 h-10 rounded-full border-2 border-paper-100 dark:border-white/10 flex items-center justify-center text-[12px] font-black text-slate-300 group-hover:bg-curry-900 group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-curry-900 transition-all duration-700">
                            {i + 1}
                          </span>
                          <p className="text-base font-medium text-slate-600 dark:text-slate-300 leading-[1.7] pt-1.5">{step}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Serving Suggestions */}
                  {generatedRecipe.servingSuggestions && (
                    <div className="p-12 bg-white dark:bg-charcoal-800 rounded-[3.5rem] border border-paper-100 dark:border-white/5 space-y-6 italic">
                       <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.4em] not-italic">Presentation Map</h5>
                       <p className="text-lg font-serif font-black text-curry-900 dark:text-white leading-relaxed">"{generatedRecipe.servingSuggestions}"</p>
                    </div>
                  )}
                </div>
              </div>
              <ChefChat recipe={generatedRecipe} />
            </div>
          ) : (
            <div className="min-h-[800px] flex flex-col items-center justify-center text-center p-20 bg-paper-50 dark:bg-charcoal-800/30 rounded-[4rem] border border-paper-100 dark:border-white/5 shadow-inner">
              <div className="w-32 h-32 bg-white dark:bg-charcoal-900 rounded-full flex items-center justify-center mb-10 shadow-2xl text-slate-100 dark:text-charcoal-800">
                <Search size={48} />
              </div>
              <h2 className="text-3xl font-serif font-black tracking-tight text-curry-900 dark:text-white mb-6 uppercase italic">Studio Awaiting Data.</h2>
              <p className="text-slate-400 max-w-sm mx-auto font-medium text-lg leading-relaxed">Select your pantry items and session goals to begin the intelligence synthesis.</p>
            </div>
          )}
        </div>
      </div>

      {/* Sticky Bottom Generate Button (Mobile Only) */}
      <div className="fixed bottom-0 left-0 right-0 p-6 lg:hidden z-50 bg-gradient-to-t from-white dark:from-charcoal-900 via-white/80 to-transparent">
        <button 
          onClick={handleGenerate}
          disabled={isGenerating || ingredients.length === 0}
          className="w-full py-5 bg-saffron-500 text-white font-black text-sm uppercase tracking-widest rounded-2xl shadow-[0_20px_40px_-10px_rgba(245,158,11,0.5)] flex items-center justify-center gap-3 disabled:opacity-50"
        >
          {isGenerating ? <Loader2 className="animate-spin" size={20} /> : <Wand2 size={20} />}
          {isGenerating ? 'Synthesizing...' : '👉 Generate Personalized Recipe'}
        </button>
      </div>
    </div>
  );
};

export default Studio;
