
import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Wand2, ChefHat, Sparkles, Loader2, ShieldAlert, ChevronDown, ChevronUp, Check, AlertCircle, Terminal, Heart, Info, Utensils, RefreshCw, Key, Save, Circle, CheckCircle2 } from 'lucide-react';
import { generateRecipe, generateRecipeImage, checkServerHealth } from '../services/geminiService';
import { Recipe } from '../types';
import { useAuth } from '../context/AuthContext';
import { CUISINES, SKILL_LEVELS, INGREDIENT_CATEGORIES, DIETS } from '../constants';
import ChefChat from '../components/ChefChat';

declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
  interface Window {
    // Fixed: Removed readonly modifier to avoid conflict with other potential declarations (Fixes line 16 error)
    aistudio: AIStudio;
  }
}

const Studio: React.FC = () => {
  const { user, saveRecipe } = useAuth();
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedRecipe, setGeneratedRecipe] = useState<Recipe | null>(null);
  const [errorState, setErrorState] = useState<string | null>(null);
  const [healthStatus, setHealthStatus] = useState<'loading' | 'healthy' | 'unconfigured'>('loading');
  const [expandedCategory, setExpandedCategory] = useState<string | null>(INGREDIENT_CATEGORIES[0].name);
  
  const [prefs, setPrefs] = useState({
    diet: user?.preferences.diet || 'None',
    cuisine: user?.preferences.favoriteCuisines[0] || 'North Indian',
    mealType: 'Dinner',
    skill: user?.preferences.skillLevel || 'Intermediate'
  });

  // Validation Logic: Identify if we have a "Main" ingredient (Veg, Protein, or Grain)
  const validationStatus = useMemo(() => {
    const coreCategories = ['Vegetables', 'Proteins', 'Grains & Staples'];
    const coreItems = INGREDIENT_CATEGORIES
      .filter(cat => coreCategories.includes(cat.name))
      .flatMap(cat => cat.items);
    
    const hasCore = ingredients.some(ing => coreItems.includes(ing) || !coreItems.includes(ing)); // Custom inputs treated as potential cores
    const hasAny = ingredients.length > 0;
    
    return {
      hasCore,
      hasAny,
      isValid: hasAny && (hasCore || ingredients.length > 2), // Valid if core exists OR user added multiple items manually
      missingCore: !hasCore && hasAny
    };
  }, [ingredients]);

  const validateEngine = async () => {
    setHealthStatus('loading');
    try {
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
      if (status === 'unconfigured') setErrorState("API_CONFIGURATION_REQUIRED");
      else setErrorState(null);
    } catch (err) {
      setHealthStatus('unconfigured');
      setErrorState("API_CONFIGURATION_REQUIRED");
    }
  };

  useEffect(() => {
    validateEngine();
  }, []);

  const handleOpenKeySelector = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      setErrorState(null);
      setHealthStatus('healthy');
      validateEngine();
    }
  };

  const addCustomIngredient = (val?: string) => {
    const target = val || inputValue;
    if (target.trim() && !ingredients.includes(target.trim().toLowerCase())) {
      setIngredients(prev => [...prev, target.trim().toLowerCase()]);
      setInputValue('');
      return true;
    }
    return false;
  };

  const handleGenerate = async () => {
    // Auto-commit manual input if exists
    let currentIngredients = [...ingredients];
    if (inputValue.trim()) {
      const added = inputValue.trim().toLowerCase();
      if (!currentIngredients.includes(added)) {
        currentIngredients.push(added);
        setIngredients(currentIngredients);
        setInputValue('');
      }
    }

    if (currentIngredients.length === 0 || healthStatus !== 'healthy') return;
    
    setIsGenerating(true);
    setGeneratedRecipe(null);
    setErrorState(null);
    try {
      const recipe = await generateRecipe({ 
        ingredients: currentIngredients, 
        diet: prefs.diet,
        cuisine: prefs.cuisine,
        mealType: prefs.mealType,
        skill: prefs.skill 
      });
      const imageUrl = await generateRecipeImage(recipe.imagePrompt);
      setGeneratedRecipe({ ...recipe, imageUrl });
    } catch (err: any) { 
      if (err.message?.includes("API_KEY") || err.message?.includes("INVALID")) {
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
            <p className="text-neutral-400 font-medium">The synthesis protocol requires a valid API key. Please select a key to initialize the intelligence core.</p>
          </div>
          <button onClick={handleOpenKeySelector} className="w-full py-6 bg-saffron-500 text-white font-black text-xs uppercase tracking-[0.4em] flex items-center justify-center gap-4 rounded-[2rem] hover:bg-saffron-600 transition-all shadow-2xl shadow-saffron-500/20">
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
        {/* Input Sidebar */}
        <div className="lg:col-span-4 space-y-10">
          <section className="space-y-6">
            <h3 className="text-[11px] font-black text-neutral-400 uppercase tracking-[0.4em] flex items-center gap-3">
              <Sparkles size={14} className="text-saffron-500" /> Input Matrix
            </h3>
            
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {INGREDIENT_CATEGORIES.map(cat => (
                <div key={cat.name} className={`border rounded-3xl overflow-hidden bg-white dark:bg-neutral-800/40 transition-colors ${
                  !validationStatus.hasCore && ['Vegetables', 'Proteins', 'Grains & Staples'].includes(cat.name) 
                  ? 'border-saffron-500/30' : 'border-neutral-200 dark:border-neutral-800'
                }`}>
                  <button 
                    onClick={() => setExpandedCategory(expandedCategory === cat.name ? null : cat.name)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left"
                  >
                    <span className="text-xs font-bold text-neutral-900 dark:text-neutral-50 uppercase tracking-widest">{cat.name}</span>
                    {expandedCategory === cat.name ? <ChevronUp size={16} className="text-neutral-400" /> : <ChevronDown size={16} className="text-neutral-400" />}
                  </button>
                  
                  {expandedCategory === cat.name && (
                    <div className="px-6 pb-6 flex flex-wrap gap-2 animate-fade-in">
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
                placeholder="Type & Enter to add..."
                className="flex-1 bg-neutral-100 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 px-6 py-4 text-sm font-bold rounded-2xl focus:outline-none focus:border-saffron-500 transition-all text-neutral-900 dark:text-neutral-50"
              />
              <button 
                onClick={() => addCustomIngredient()}
                className="p-4 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 text-saffron-500 rounded-2xl hover:bg-saffron-50 dark:hover:bg-saffron-900/10 transition-colors"
              >
                <Plus size={20} />
              </button>
            </div>
          </section>

          <section className="space-y-6">
            <h3 className="text-[11px] font-black text-neutral-400 uppercase tracking-[0.4em]">Configuration</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-neutral-400 uppercase tracking-widest ml-1">Cuisine</label>
                <select 
                  value={prefs.cuisine}
                  onChange={e => setPrefs({...prefs, cuisine: e.target.value})}
                  className="w-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 px-4 py-3 text-[10px] font-bold rounded-xl focus:outline-none text-neutral-900 dark:text-neutral-50"
                >
                  {CUISINES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-neutral-400 uppercase tracking-widest ml-1">Diet</label>
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
            disabled={(!validationStatus.hasAny && !inputValue) || isGenerating}
            onClick={handleGenerate}
            className={`w-full py-6 text-white font-black text-xs uppercase tracking-[0.4em] flex items-center justify-center gap-4 rounded-[2rem] transition-all shadow-2xl ${
              isGenerating ? 'bg-neutral-900 dark:bg-neutral-700 cursor-not-allowed' : 'bg-saffron-500 hover:bg-saffron-600 shadow-saffron-500/30'
            } disabled:opacity-20`}
          >
            {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Wand2 size={18} />}
            {isGenerating ? 'Synthesizing...' : 'Run Synthesis'}
          </button>
        </div>

        {/* Output Area */}
        <div className="lg:col-span-8">
          {isGenerating ? (
            <div className="h-full min-h-[500px] flex flex-col items-center justify-center space-y-10 bg-neutral-100/50 dark:bg-neutral-800/20 rounded-[3rem] border-2 border-dashed border-neutral-200 dark:border-neutral-800 animate-pulse">
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
              {/* Recipe View (Unchanged high-fidelity render) */}
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
                   <button onClick={() => { saveRecipe(generatedRecipe); setGeneratedRecipe(null); }} className="p-6 bg-white text-saffron-500 rounded-full hover:scale-110 transition-transform shadow-xl">
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
            <div className="h-full min-h-[500px] flex flex-col items-center justify-center p-16 text-center space-y-12 bg-neutral-100/30 dark:bg-neutral-800/10 rounded-[3rem] border border-dashed border-neutral-200 dark:border-neutral-800/50">
              <div className="w-20 h-20 bg-neutral-50 dark:bg-neutral-800/40 rounded-3xl flex items-center justify-center text-neutral-200 dark:text-neutral-700">
                <Utensils size={32} />
              </div>
              
              <div className="max-w-md space-y-10">
                <div className="space-y-3">
                  <h3 className="text-4xl font-serif font-black text-neutral-900 dark:text-neutral-50 uppercase italic tracking-tight">Synthesis Readiness</h3>
                  <p className="text-sm text-neutral-400 font-medium">Follow the protocol checklist below to initialize the culinary logic engine.</p>
                </div>

                <div className="grid grid-cols-1 gap-4 text-left">
                  <div className={`p-5 rounded-2xl flex items-center gap-4 border transition-all ${validationStatus.hasAny || inputValue ? 'bg-saffron-50/50 dark:bg-saffron-900/10 border-saffron-200' : 'bg-white dark:bg-neutral-800 border-neutral-100'}`}>
                    {validationStatus.hasAny || inputValue ? <CheckCircle2 className="text-saffron-500" /> : <Circle className="text-neutral-200" />}
                    <div className="flex-1">
                      <p className={`text-xs font-black uppercase tracking-widest ${validationStatus.hasAny || inputValue ? 'text-saffron-600' : 'text-neutral-400'}`}>1. Component Loading</p>
                      <p className="text-[11px] text-neutral-400">At least one ingredient detected in input matrix.</p>
                    </div>
                  </div>

                  <div className={`p-5 rounded-2xl flex items-center gap-4 border transition-all ${validationStatus.isValid ? 'bg-saffron-50/50 dark:bg-saffron-900/10 border-saffron-200' : 'bg-white dark:bg-neutral-800 border-neutral-100'}`}>
                    {validationStatus.isValid ? <CheckCircle2 className="text-saffron-500" /> : <Circle className="text-neutral-200" />}
                    <div className="flex-1">
                      <p className={`text-xs font-black uppercase tracking-widest ${validationStatus.isValid ? 'text-saffron-600' : 'text-neutral-400'}`}>2. Core Calibration</p>
                      <p className="text-[11px] text-neutral-400">Found core nutrition: Proteins, Vegetables, or Grains.</p>
                    </div>
                  </div>
                </div>

                {!validationStatus.isValid && validationStatus.hasAny && (
                  <div className="p-4 bg-paprika-50 dark:bg-paprika-900/10 rounded-xl flex items-center gap-3 text-paprika-600 animate-fade-in border border-paprika-100">
                    <Info size={16} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Note: Add a main ingredient (meat, veg, rice) for higher fidelity synthesis.</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Studio;
