import React, { useState, useEffect } from 'react';
import { Plus, Wand2, ChefHat, Sparkles, Loader2, ShieldAlert, ChevronDown, ChevronUp, Check, AlertCircle, Terminal, Heart, Info, Utensils, RefreshCw, Key, Save } from 'lucide-react';
import { generateRecipe, generateRecipeImage, checkServerHealth } from '../services/geminiService';
import { Recipe } from '../types';
import { useAuth } from '../context/AuthContext';
import { CUISINES, SKILL_LEVELS, INGREDIENT_CATEGORIES, DIETS } from '../constants';
import ChefChat from '../components/ChefChat';

// Define AIStudio interface for global window access
// Fixing the "All declarations of 'aistudio' must have identical modifiers" and "Subsequent property declarations must have the same type" errors
// by moving the interface into the declare global block to ensure correct scoping for type merging.
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
  interface Window {
    readonly aistudio: AIStudio;
  }
}

const Studio: React.FC = () => {
  const { user, saveRecipe, updatePreferences } = useAuth();
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedRecipe, setGeneratedRecipe] = useState<Recipe | null>(null);
  const [errorState, setErrorState] = useState<string | null>(null);
  const [healthStatus, setHealthStatus] = useState<'loading' | 'healthy' | 'unconfigured'>('loading');
  const [expandedCategory, setExpandedCategory] = useState<string | null>(INGREDIENT_CATEGORIES[0].name);
  
  // Initialize preferences from User Profile for seamless customization
  const [prefs, setPrefs] = useState({
    diet: user?.preferences.diet || 'None',
    cuisine: user?.preferences.favoriteCuisines[0] || 'North Indian',
    mealType: 'Dinner',
    skill: user?.preferences.skillLevel || 'Intermediate'
  });

  // Logic to validate the synthesis engine health and check if an API key has been selected
  const validateEngine = async () => {
    setHealthStatus('loading');
    try {
      // Check if API key is already selected in the environment as per the guidelines
      if (window.aistudio) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        if (!hasKey) {
          setHealthStatus('unconfigured');
          setErrorState("API_CONFIGURATION_REQUIRED");
          return;
        }
      }

      const status = await checkServerHealth();
      setHealthStatus(status);
      if (status === 'unconfigured') {
        setErrorState("API_CONFIGURATION_REQUIRED");
      } else {
        setErrorState(null);
      }
    } catch (err) {
      setHealthStatus('unconfigured');
      setErrorState("API_CONFIGURATION_REQUIRED");
    }
  };

  useEffect(() => {
    validateEngine();
  }, []);

  // Handle opening the API key selection dialog
  const handleOpenKeySelector = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      // MUST assume the key selection was successful after triggering openSelectKey() and proceed to the app
      // to mitigate potential race conditions.
      setErrorState(null);
      setHealthStatus('healthy');
      // Trigger a background health check to verify connectivity
      validateEngine();
    }
  };

  const handleGenerate = async () => {
    if (ingredients.length === 0 || healthStatus !== 'healthy') return;
    
    setIsGenerating(true);
    setGeneratedRecipe(null);
    setErrorState(null);
    try {
      const recipe = await generateRecipe({ 
        ingredients, 
        diet: prefs.diet,
        cuisine: prefs.cuisine,
        mealType: prefs.mealType,
        skill: prefs.skill 
      });
      const imageUrl = await generateRecipeImage(recipe.imagePrompt);
      setGeneratedRecipe({ ...recipe, imageUrl });
    } catch (err: any) { 
      console.error("Synthesis Error:", err);
      // If the request fails with an error message containing "Requested entity was not found." or API key issues,
      // reset the key selection state and prompt the user to select a key again via openSelectKey().
      if (err.message?.includes("API_KEY") || err.message?.includes("Requested entity was not found") || err.message?.includes("API_KEY_INVALID")) {
        setErrorState("API_CONFIGURATION_REQUIRED");
        setHealthStatus('unconfigured');
      } else {
        setErrorState("SYNTHESIS_INTERRUPTED");
      }
    } finally { 
      setIsGenerating(false); 
    }
  };

  const toggleIngredient = (ing: string) => setIngredients(prev => prev.includes(ing) ? prev.filter(i => i !== ing) : [...prev, ing]);
  
  const addCustomIngredient = () => {
    if (inputValue.trim() && !ingredients.includes(inputValue.trim().toLowerCase())) {
      setIngredients(prev => [...prev, inputValue.trim().toLowerCase()]);
      setInputValue('');
    }
  };

  if (healthStatus === 'loading' && !errorState) {
    return (
      <div className="min-h-[600px] flex flex-col items-center justify-center space-y-6">
        <Loader2 size={40} className="text-saffron-500 animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-400">Calibrating Engine...</p>
      </div>
    );
  }

  if (errorState === "API_CONFIGURATION_REQUIRED") {
    return (
      <div className="min-h-[600px] flex items-center justify-center p-10 animate-fade-in text-left">
        <div className="max-w-md w-full text-center space-y-10">
          <div className="w-24 h-24 bg-paprika-50 dark:bg-paprika-900/20 text-paprika-600 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-xl">
             <ShieldAlert size={40} />
          </div>
          <div className="space-y-4 text-center">
            <h2 className="text-4xl font-serif font-black text-neutral-900 dark:text-neutral-50 uppercase italic leading-tight">Engine Offline</h2>
            <p className="text-neutral-400 font-medium">The synthesis protocol requires a valid API key from a paid GCP project. Please select a key to initialize the intelligence core. See <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-saffron-500 underline hover:text-saffron-600">billing documentation</a> for details.</p>
          </div>
          <button 
            onClick={handleOpenKeySelector}
            className="w-full py-6 bg-saffron-500 text-white font-black text-xs uppercase tracking-[0.4em] flex items-center justify-center gap-4 rounded-[2rem] hover:bg-saffron-600 transition-all shadow-2xl shadow-saffron-500/20"
          >
            Select API Key <Key size={18} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-16 pb-24 text-left">
      <header className="space-y-6">
        <div className="inline-flex items-center gap-3 px-5 py-2 bg-saffron-50 dark:bg-saffron-900/20 text-saffron-600 rounded-full text-[10px] font-black uppercase tracking-[0.3em] border border-saffron-100 dark:border-saffron-900/50">
           <ChefHat size={14} /> Neural Studio
        </div>
        <h2 className="text-6xl font-serif font-black tracking-tight text-neutral-900 dark:text-neutral-50 uppercase italic leading-none">
          Recipe<br/><span className="text-saffron-500">Synthesis.</span>
        </h2>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-4 space-y-10">
          <section className="space-y-6">
            <h3 className="text-[11px] font-black text-neutral-400 uppercase tracking-[0.4em] flex items-center gap-3">
              <Sparkles size={14} className="text-saffron-500" /> Input Ingredients
            </h3>
            
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {INGREDIENT_CATEGORIES.map(cat => (
                <div key={cat.name} className="border border-neutral-200 dark:border-neutral-800 rounded-3xl overflow-hidden bg-white dark:bg-neutral-800/40">
                  <button 
                    onClick={() => setExpandedCategory(expandedCategory === cat.name ? null : cat.name)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left"
                  >
                    <span className="text-xs font-bold text-neutral-900 dark:text-neutral-50 uppercase tracking-widest">{cat.name}</span>
                    {expandedCategory === cat.name ? <ChevronUp size={16} className="text-neutral-400" /> : <ChevronDown size={16} className="text-neutral-400" />}
                  </button>
                  
                  {expandedCategory === cat.name && (
                    <div className="px-6 pb-6 flex flex-wrap gap-2">
                      {cat.items.map(item => (
                        <button
                          key={item}
                          onClick={() => toggleIngredient(item)}
                          className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider border transition-all ${
                            ingredients.includes(item)
                              ? 'bg-saffron-500 border-saffron-500 text-white shadow-lg shadow-saffron-500/20' 
                              : 'bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-400 hover:border-saffron-500/50'
                          }`}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-4">
              <input 
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addCustomIngredient()}
                placeholder="Manual entry..."
                className="flex-1 bg-neutral-100 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 px-6 py-4 text-sm font-bold rounded-2xl focus:outline-none focus:border-saffron-500 transition-all text-neutral-900 dark:text-neutral-50"
              />
              <button 
                onClick={addCustomIngredient}
                className="p-4 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 text-saffron-500 rounded-2xl"
              >
                <Plus size={20} />
              </button>
            </div>
          </section>

          <section className="space-y-6">
            <h3 className="text-[11px] font-black text-neutral-400 uppercase tracking-[0.4em]">Customization Protocol</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-neutral-400 uppercase tracking-widest ml-1">Cuisine Focus</label>
                <select 
                  value={prefs.cuisine}
                  onChange={e => setPrefs({...prefs, cuisine: e.target.value})}
                  className="w-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 px-4 py-3 text-[10px] font-bold rounded-xl focus:outline-none text-neutral-900 dark:text-neutral-50"
                >
                  {CUISINES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-neutral-400 uppercase tracking-widest ml-1">Dietary Logic</label>
                <select 
                  value={prefs.diet}
                  onChange={e => setPrefs({...prefs, diet: e.target.value})}
                  className="w-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 px-4 py-3 text-[10px] font-bold rounded-xl focus:outline-none text-neutral-900 dark:text-neutral-50"
                >
                  {DIETS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>
          </section>

          <button 
            disabled={ingredients.length === 0 || isGenerating}
            onClick={handleGenerate}
            className={`w-full py-6 text-white font-black text-xs uppercase tracking-[0.4em] flex items-center justify-center gap-4 rounded-[2rem] transition-all shadow-2xl ${
              isGenerating ? 'bg-neutral-900 dark:bg-neutral-700 cursor-not-allowed' : 'bg-saffron-500 hover:bg-saffron-600 shadow-saffron-500/30'
            } disabled:opacity-20`}
          >
            {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Wand2 size={18} />}
            {isGenerating ? 'Synthesizing...' : 'Run Synthesis'}
          </button>
        </div>

        <div className="lg:col-span-8">
          {isGenerating ? (
            <div className="h-full min-h-[500px] flex flex-col items-center justify-center space-y-10 bg-neutral-100/50 dark:bg-neutral-800/20 rounded-[3rem] border-2 border-dashed border-neutral-200 dark:border-neutral-800">
              <div className="relative">
                <div className="w-32 h-32 border-4 border-saffron-100 border-t-saffron-500 rounded-full animate-spin" />
                <ChefHat className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-saffron-500" size={32} />
              </div>
              <div className="text-center space-y-4">
                <p className="text-[11px] font-black uppercase tracking-[0.4em] text-saffron-500 animate-pulse">Mapping Culinary Vectors</p>
                <p className="text-sm text-neutral-400 font-medium italic">Gemini is parsing your profile preferences and ingredients...</p>
              </div>
            </div>
          ) : generatedRecipe ? (
            <div className="space-y-12 animate-fade-in text-left">
              <div className="relative rounded-[3rem] overflow-hidden shadow-2xl group h-[450px]">
                <img src={generatedRecipe.imageUrl} className="w-full h-full object-cover" alt={generatedRecipe.title} />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/90 via-neutral-900/20 to-transparent" />
                <div className="absolute bottom-12 left-12 right-12 flex justify-between items-end">
                   <div className="space-y-4">
                      <div className="flex gap-3">
                        <span className="px-3 py-1 bg-saffron-500 text-white text-[9px] font-black uppercase tracking-widest rounded-lg">{generatedRecipe.cuisine}</span>
                        <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-widest rounded-lg">{generatedRecipe.dietaryNeeds[0] || 'Standard'}</span>
                      </div>
                      <h3 className="text-5xl font-serif font-black text-white italic tracking-tight">{generatedRecipe.title}</h3>
                   </div>
                   <button 
                     onClick={() => { saveRecipe(generatedRecipe); setGeneratedRecipe(null); }}
                     className="p-6 bg-white text-saffron-500 rounded-full hover:scale-110 transition-transform shadow-xl"
                   >
                     <Save size={28} />
                   </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-8">
                  <div className="flex items-center gap-4">
                    <div className="w-1.5 h-6 bg-saffron-500 rounded-full" />
                    <h4 className="text-[11px] font-black text-neutral-400 uppercase tracking-[0.4em]">Ingredient Matrix</h4>
                  </div>
                  <ul className="space-y-4">
                    {generatedRecipe.ingredients.map((ing, i) => (
                      <li key={i} className="flex items-center justify-between p-4 bg-white dark:bg-neutral-800/40 rounded-2xl border border-neutral-100 dark:border-neutral-800 shadow-sm">
                        <span className="text-sm font-bold text-neutral-900 dark:text-neutral-50">{ing.name}</span>
                        <span className="text-[10px] font-black text-saffron-500 uppercase tracking-widest">{ing.amount} {ing.unit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-8">
                  <div className="flex items-center gap-4">
                    <div className="w-1.5 h-6 bg-saffron-500 rounded-full" />
                    <h4 className="text-[11px] font-black text-neutral-400 uppercase tracking-[0.4em]">Execution Protocol</h4>
                  </div>
                  <div className="space-y-6">
                    {generatedRecipe.instructions.map((step, i) => (
                      <div key={i} className="flex gap-6">
                        <span className="text-2xl font-serif font-black text-saffron-500 italic leading-none">{i + 1}</span>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium leading-relaxed">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <ChefChat recipe={generatedRecipe} />
            </div>
          ) : (
            <div className="h-full min-h-[500px] flex flex-col items-center justify-center p-16 text-center space-y-8 bg-neutral-100/30 dark:bg-neutral-800/10 rounded-[3rem] border border-dashed border-neutral-200 dark:border-neutral-800/50">
              <div className="w-20 h-20 bg-neutral-50 dark:bg-neutral-800/40 rounded-3xl flex items-center justify-center text-neutral-200 dark:text-neutral-700">
                <Utensils size={32} />
              </div>
              <div className="max-w-sm space-y-4">
                <h3 className="text-2xl font-serif font-black text-neutral-900 dark:text-neutral-50 uppercase italic tracking-tight">Awaiting Parameters</h3>
                <p className="text-sm text-neutral-400 font-medium">Configure your ingredient list and synthesis preferences to generate a precision-engineered culinary protocol.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Studio;