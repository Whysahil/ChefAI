
import React, { useState, useEffect } from 'react';
import { ChefHat, BookOpen, Wand2, Plus, X, Loader2, Sparkles, Utensils, Save, Trash2, ChevronRight, AlertCircle, Sun, Moon } from 'lucide-react';
import { AIService } from './services/aiService';
import { Recipe, ViewState } from './types';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('studio');
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [diet, setDiet] = useState('Standard');
  const [cuisine, setCuisine] = useState('Global Fusion');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentRecipe, setCurrentRecipe] = useState<Recipe | null>(null);
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>(() => {
    const saved = localStorage.getItem('recipes_v2');
    return saved ? JSON.parse(saved) : [];
  });
  const [isDark, setIsDark] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('recipes_v2', JSON.stringify(savedRecipes));
  }, [savedRecipes]);

  const addIngredient = () => {
    if (input.trim() && !ingredients.includes(input.trim().toLowerCase())) {
      setIngredients([...ingredients, input.trim().toLowerCase()]);
      setInput('');
    }
  };

  const handleGenerate = async () => {
    if (ingredients.length === 0) return;
    setIsGenerating(true);
    setError(null);
    setCurrentRecipe(null);
    try {
      const recipe = await AIService.synthesizeRecipe(ingredients, diet, cuisine);
      // Added dietaryNeeds to satisfy the Recipe interface from types.ts
      const recipeWithMeta: Recipe = { 
        ...recipe, 
        id: crypto.randomUUID(), 
        createdAt: Date.now(),
        dietaryNeeds: diet !== 'Standard' ? [diet] : []
      };
      setCurrentRecipe(recipeWithMeta);
      
      const img = await AIService.generateImage(recipe.imagePrompt);
      if (img) setCurrentRecipe(prev => prev ? { ...prev, imageUrl: img } : null);
    } catch (err: any) {
      setError(err.message || "Synthesis Protocol Interrupted.");
    } finally {
      setIsGenerating(false);
    }
  };

  const saveRecipe = () => {
    if (currentRecipe) {
      setSavedRecipes([currentRecipe, ...savedRecipes]);
      setCurrentRecipe(null);
      setIngredients([]);
      setView('cookbook');
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDark ? 'dark bg-neutral-900 text-neutral-50' : 'bg-neutral-50 text-neutral-900'}`}>
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Navigation Bar */}
        <nav className="flex items-center justify-between mb-16 glass p-6 rounded-3xl border border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-saffron-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-saffron-500/20">
              <ChefHat size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-serif font-black italic leading-none">Kitchen<span className="text-saffron-500">Lab</span></h1>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 mt-1">Intelligence Studio</p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-white dark:bg-neutral-800 p-1.5 rounded-2xl shadow-sm border border-neutral-100 dark:border-neutral-700">
            <button 
              onClick={() => setView('studio')}
              className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${view === 'studio' ? 'bg-saffron-500 text-white shadow-lg' : 'text-neutral-400 hover:text-neutral-900 dark:hover:text-white'}`}
            >
              <Wand2 size={16} /> Studio
            </button>
            <button 
              onClick={() => setView('cookbook')}
              className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${view === 'cookbook' ? 'bg-saffron-500 text-white shadow-lg' : 'text-neutral-400 hover:text-neutral-900 dark:hover:text-white'}`}
            >
              <BookOpen size={16} /> Archive
            </button>
          </div>

          <button onClick={() => setIsDark(!isDark)} className="p-3 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-400 hover:text-saffron-500 transition-all">
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </nav>

        {/* Content Area */}
        <div className="animate-fade-in">
          {view === 'studio' ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              {/* Controls */}
              <div className="lg:col-span-4 space-y-10">
                <section className="space-y-6">
                  <h3 className="text-[11px] font-black text-neutral-400 uppercase tracking-[0.4em] flex items-center gap-3">
                    <Sparkles size={14} className="text-saffron-500" /> Input Matrix
                  </h3>
                  <div className="flex gap-2">
                    <input 
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && addIngredient()}
                      placeholder="Add ingredient..."
                      className="flex-1 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 px-6 py-4 rounded-2xl text-sm font-bold focus:outline-none focus:border-saffron-500 transition-all shadow-sm"
                    />
                    <button onClick={addIngredient} className="p-4 bg-saffron-500 text-white rounded-2xl hover:bg-saffron-600 transition-all">
                      <Plus size={24} />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {ingredients.map(ing => (
                      <span key={ing} className="px-4 py-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 animate-slide-up">
                        {ing}
                        <button onClick={() => setIngredients(ingredients.filter(i => i !== ing))} className="text-neutral-400 hover:text-paprika-600"><X size={12}/></button>
                      </span>
                    ))}
                  </div>
                </section>

                <section className="space-y-6">
                  <h3 className="text-[11px] font-black text-neutral-400 uppercase tracking-[0.4em]">Calibration</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-neutral-400 uppercase tracking-widest ml-1">Cuisine Style</label>
                      <select 
                        value={cuisine} 
                        onChange={e => setCuisine(e.target.value)}
                        className="w-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 px-4 py-3 rounded-xl text-xs font-bold focus:outline-none"
                      >
                        <option>Global Fusion</option>
                        <option>Classical French</option>
                        <option>Authentic Italian</option>
                        <option>Progressive Indian</option>
                        <option>Minimalist Japanese</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-neutral-400 uppercase tracking-widest ml-1">Dietary Logic</label>
                      <select 
                        value={diet} 
                        onChange={e => setDiet(e.target.value)}
                        className="w-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 px-4 py-3 rounded-xl text-xs font-bold focus:outline-none"
                      >
                        <option>Standard</option>
                        <option>Vegan</option>
                        <option>Vegetarian</option>
                        <option>Keto</option>
                        <option>Gluten-Free</option>
                      </select>
                    </div>
                  </div>
                </section>

                {error && (
                  <div className="p-4 bg-paprika-600/10 border border-paprika-600/20 text-paprika-600 rounded-2xl flex items-center gap-3 text-xs font-bold animate-pulse">
                    <AlertCircle size={18} /> {error}
                  </div>
                )}

                <button 
                  disabled={isGenerating || ingredients.length === 0}
                  onClick={handleGenerate}
                  className={`w-full py-6 rounded-3xl font-black text-xs uppercase tracking-[0.4em] flex items-center justify-center gap-4 transition-all shadow-2xl ${isGenerating ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed' : 'bg-saffron-500 text-white hover:bg-saffron-600 shadow-saffron-500/20'}`}
                >
                  {isGenerating ? <Loader2 className="animate-spin" size={20} /> : <Wand2 size={20} />}
                  {isGenerating ? 'Synthesizing...' : 'Run Synthesis'}
                </button>
              </div>

              {/* Display Area */}
              <div className="lg:col-span-8">
                {isGenerating ? (
                  <div className="h-[600px] bg-white dark:bg-neutral-800/40 rounded-[3rem] border-2 border-dashed border-neutral-200 dark:border-neutral-800 flex flex-col items-center justify-center text-center animate-pulse">
                    <div className="w-24 h-24 bg-saffron-100 dark:bg-saffron-500/10 rounded-full flex items-center justify-center text-saffron-500 mb-6">
                      <Utensils size={40} />
                    </div>
                    <h4 className="text-2xl font-serif font-black italic text-neutral-400">Calibrating Culinary Logic...</h4>
                    <p className="text-xs font-bold text-neutral-400 mt-2 uppercase tracking-[0.3em]">Layer 1: Gemini Thinking Engine Active</p>
                  </div>
                ) : currentRecipe ? (
                  <div className="space-y-12 animate-fade-in pb-20">
                    <div className="relative h-[450px] rounded-[3rem] overflow-hidden shadow-2xl border border-neutral-200 dark:border-neutral-800">
                      {currentRecipe.imageUrl ? (
                        <img src={currentRecipe.imageUrl} className="w-full h-full object-cover" alt={currentRecipe.title} />
                      ) : (
                        <div className="w-full h-full bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center">
                          <Loader2 className="animate-spin text-saffron-500" size={40} />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-transparent" />
                      <div className="absolute bottom-10 left-10 right-10 flex justify-between items-end">
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <span className="px-3 py-1 bg-saffron-500 text-white text-[9px] font-black uppercase tracking-widest rounded-lg">{currentRecipe.cuisine}</span>
                            <span className="px-3 py-1 bg-neutral-900/60 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-widest rounded-lg border border-white/20">{currentRecipe.difficulty}</span>
                          </div>
                          <h2 className="text-5xl font-serif font-black text-white italic tracking-tight">{currentRecipe.title}</h2>
                        </div>
                        <button onClick={saveRecipe} className="p-8 bg-white text-saffron-500 rounded-full hover:scale-110 transition-transform shadow-2xl">
                          <Save size={32} />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                      <div className="space-y-8">
                        <h4 className="text-[11px] font-black text-neutral-400 uppercase tracking-[0.4em] flex items-center gap-3">
                          <span className="w-6 h-px bg-saffron-500" /> Components
                        </h4>
                        <ul className="space-y-3">
                          {currentRecipe.ingredients.map((ing, i) => (
                            <li key={i} className="flex justify-between p-5 bg-white dark:bg-neutral-800/60 rounded-2xl border border-neutral-100 dark:border-neutral-800 shadow-sm">
                              <span className="text-sm font-bold capitalize">{ing.name}</span>
                              <span className="text-[10px] font-black text-saffron-500 uppercase tracking-widest">{ing.amount} {ing.unit}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="space-y-8">
                        <h4 className="text-[11px] font-black text-neutral-400 uppercase tracking-[0.4em] flex items-center gap-3">
                          <span className="w-6 h-px bg-saffron-500" /> Instructions
                        </h4>
                        <div className="space-y-6">
                          {currentRecipe.instructions.map((step, i) => (
                            <div key={i} className="flex gap-6 group">
                              <span className="text-3xl font-serif font-black text-saffron-500/20 group-hover:text-saffron-500 transition-colors italic leading-none">{i + 1}</span>
                              <p className="text-sm font-medium leading-relaxed text-neutral-600 dark:text-neutral-400 pt-1">{step}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-[600px] flex flex-col items-center justify-center text-center space-y-8 bg-neutral-100/50 dark:bg-neutral-800/10 rounded-[3rem] border border-dashed border-neutral-200 dark:border-neutral-800">
                    <div className="w-20 h-20 bg-white dark:bg-neutral-800 rounded-3xl flex items-center justify-center text-neutral-200 dark:text-neutral-700 shadow-xl border border-neutral-100 dark:border-neutral-800">
                      <Wand2 size={40} />
                    </div>
                    <div className="max-w-md">
                      <h4 className="text-3xl font-serif font-black italic text-neutral-400">Synthesis Idle</h4>
                      <p className="text-xs font-bold text-neutral-400 mt-2 uppercase tracking-[0.2em] leading-relaxed">Load your ingredient matrix to begin professional recipe synthesis with Gemini Intelligence.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-12">
              <header className="flex justify-between items-end">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-3 px-5 py-2 bg-saffron-50 dark:bg-saffron-900/20 text-saffron-600 rounded-full text-[10px] font-black uppercase tracking-[0.3em] border border-saffron-100">
                    <BookOpen size={14} /> Personal Archive
                  </div>
                  <h2 className="text-5xl font-serif font-black text-neutral-900 dark:text-neutral-50 italic">The Cook<span className="text-saffron-500">book.</span></h2>
                </div>
                <div className="flex gap-4">
                  <div className="p-6 bg-white dark:bg-neutral-800 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm text-center min-w-[120px]">
                    <p className="text-3xl font-serif font-black text-saffron-500 leading-none">{savedRecipes.length}</p>
                    <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest mt-1">Total Logs</p>
                  </div>
                </div>
              </header>

              {savedRecipes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {savedRecipes.map(recipe => (
                    <div key={recipe.id} className="bg-white dark:bg-neutral-800 rounded-[2.5rem] overflow-hidden border border-neutral-200 dark:border-neutral-800 shadow-xl group transition-all duration-500 hover:shadow-2xl">
                      <div className="relative h-56 overflow-hidden">
                        <img src={recipe.imageUrl} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt={recipe.title} />
                        <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/80 to-transparent" />
                        <button 
                          onClick={() => setSavedRecipes(savedRecipes.filter(r => r.id !== recipe.id))}
                          className="absolute top-6 right-6 p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-paprika-600 transition-colors z-10"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="p-8 space-y-6">
                        <div className="flex gap-2">
                           <span className="px-2 py-0.5 bg-saffron-50 dark:bg-saffron-900/30 text-saffron-500 text-[8px] font-black uppercase tracking-widest rounded-md border border-saffron-100 dark:border-saffron-900/50">{recipe.cuisine}</span>
                        </div>
                        <h3 className="text-xl font-serif font-black text-neutral-900 dark:text-neutral-50 italic line-clamp-1">{recipe.title}</h3>
                        <p className="text-[10px] text-neutral-400 font-medium line-clamp-2 leading-relaxed">{recipe.description}</p>
                        <button className="w-full py-4 bg-neutral-50 dark:bg-neutral-900 text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400 group-hover:bg-saffron-500 group-hover:text-white rounded-2xl transition-all flex items-center justify-center gap-2">
                          Inspect Blueprint <ChevronRight size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-32 text-center bg-neutral-100/30 dark:bg-neutral-800/10 rounded-[4rem] border border-dashed border-neutral-200 dark:border-neutral-800">
                  <BookOpen size={64} className="text-neutral-200 dark:text-neutral-700 mx-auto mb-8" />
                  <h4 className="text-3xl font-serif font-black italic text-neutral-400">Library Empty</h4>
                  <p className="text-xs font-bold text-neutral-400 mt-2 uppercase tracking-[0.2em]">No protocols found in your archive. Start synthesizing in the Studio.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
