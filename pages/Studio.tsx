
import React, { useState, useMemo } from 'react';
import { Plus, Wand2, ChefHat, Sparkles, Loader2, ChevronDown, ChevronUp, Save, Utensils, AlertTriangle, X, CheckCircle2, Info } from 'lucide-react';
import { ChefApiService } from '../services/ChefApiService';
import { Recipe } from '../types';
import { useAuth } from '../context/AuthContext';
import { CUISINES, INGREDIENT_CATEGORIES, DIETS } from '../constants';
import ChefChat from '../components/ChefChat';

const Studio: React.FC = () => {
  const { user, saveRecipe } = useAuth();
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedRecipe, setGeneratedRecipe] = useState<Recipe | null>(null);
  const [errorState, setErrorState] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(INGREDIENT_CATEGORIES[0].name);
  const [isSaved, setIsSaved] = useState(false);
  
  const [prefs, setPrefs] = useState({
    diet: user?.preferences?.diet || 'None',
    cuisine: user?.preferences?.favoriteCuisines?.[0] || 'North Indian',
    mealType: 'Dinner'
  });

  // Extract core ingredients from specified categories for validation
  const coreIngredientsList = useMemo(() => {
    const coreCategories = ['Vegetables', 'Proteins', 'Grains & Staples'];
    return INGREDIENT_CATEGORIES
      .filter(cat => coreCategories.includes(cat.name))
      .flatMap(cat => cat.items);
  }, []);

  const validationStatus = useMemo(() => {
    const hasAny = ingredients.length > 0;
    // Check if at least one selected ingredient is from the core categories
    const hasCore = ingredients.some(ing => coreIngredientsList.includes(ing));
    return { hasAny, hasCore };
  }, [ingredients, coreIngredientsList]);

  const addCustomIngredient = () => {
    const val = inputValue.trim().toLowerCase();
    if (val && !ingredients.includes(val)) {
      setIngredients(prev => [...prev, val]);
      setInputValue('');
      setValidationError(null);
      return true;
    }
    return false;
  };

  const handleGenerate = async () => {
    setValidationError(null);
    setErrorState(null);
    setIsSaved(false);

    // Initial check: must have at least something
    if (ingredients.length === 0) {
      setValidationError("Selection Matrix Empty: Please add at least one ingredient to begin synthesis.");
      return;
    }

    // Core validation: must have a base ingredient for a valid recipe
    if (!validationStatus.hasCore) {
      setValidationError("Core Requirement Missing: A master recipe needs a solid foundation. Please include at least one Vegetable, Protein, or Grain.");
      return;
    }

    setIsGenerating(true);
    setGeneratedRecipe(null);
    
    try {
      const res = await ChefApiService.generateRecipe({ 
        ingredients, 
        diet: prefs.diet,
        cuisine: prefs.cuisine 
      });
      
      if (res.status === 'success') {
        const recipe = {
          ...res.recipe,
          id: Math.random().toString(36).substr(2, 9),
          createdAt: Date.now(),
          dietaryNeeds: [prefs.diet]
        };
        setGeneratedRecipe(recipe);
        
        // Lazy load image
        try {
          const imgRes = await ChefApiService.generateImage(recipe.imagePrompt);
          if (imgRes.status === 'success') {
            setGeneratedRecipe(prev => prev ? { ...prev, imageUrl: `data:image/png;base64,${imgRes.data}` } : null);
          }
        } catch (imgErr) {
          console.warn("Failed to generate image", imgErr);
        }
      }
    } catch (err: any) { 
      setErrorState(err.message || "Synthesis interrupted. Our culinary engines encountered an unexpected variable.");
    } finally { 
      setIsGenerating(false); 
    }
  };

  const handleSave = async () => {
    if (generatedRecipe) {
      await saveRecipe(generatedRecipe);
      setIsSaved(true);
      setTimeout(() => setGeneratedRecipe(null), 1500);
    }
  };

  const toggleIngredient = (ing: string) => {
    setValidationError(null);
    setIngredients(prev => prev.includes(ing) ? prev.filter(i => i !== ing) : [...prev, ing]);
  };

  return (
    <div className="space-y-16 pb-24 text-left">
      <header className="space-y-6">
        <div className="inline-flex items-center gap-3 px-5 py-2 bg-saffron-50 dark:bg-saffron-900/20 text-saffron-600 rounded-full text-[10px] font-black uppercase tracking-[0.3em] border border-saffron-100">
           <ChefHat size={14} /> Intelligence Studio
        </div>
        <h2 className="text-6xl font-serif font-black tracking-tight text-neutral-900 dark:text-neutral-50 uppercase italic leading-none">
          Recipe<br/><span className="text-saffron-500">Synthesis.</span>
        </h2>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-4 space-y-10">
          <section className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-[11px] font-black text-neutral-400 uppercase tracking-[0.4em] flex items-center gap-3">
                <Sparkles size={14} className="text-saffron-500" /> Input Matrix
              </h3>
              <div className={`flex items-center gap-2 text-[9px] font-black uppercase tracking-widest ${validationStatus.hasCore ? 'text-green-500' : 'text-neutral-400'}`}>
                {validationStatus.hasCore ? <CheckCircle2 size={12} /> : <Info size={12} />}
                {validationStatus.hasCore ? 'Core Base Met' : 'Add a Base'}
              </div>
            </div>
            
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {INGREDIENT_CATEGORIES.map(cat => (
                <div key={cat.name} className="border rounded-3xl overflow-hidden bg-white dark:bg-neutral-800/40 border-neutral-200 dark:border-neutral-800 transition-all">
                  <button 
                    onClick={() => setExpandedCategory(expandedCategory === cat.name ? null : cat.name)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-neutral-50 dark:hover:bg-neutral-800/60"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-neutral-900 dark:text-neutral-50 uppercase tracking-widest">{cat.name}</span>
                      {['Vegetables', 'Proteins', 'Grains & Staples'].includes(cat.name) && (
                        <div className="w-1.5 h-1.5 bg-saffron-500 rounded-full" title="Core Category" />
                      )}
                    </div>
                    {expandedCategory === cat.name ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
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
                              : 'bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-500 hover:border-saffron-500'
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
              <button onClick={addCustomIngredient} className="p-4 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 text-saffron-500 rounded-2xl hover:bg-saffron-50">
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
                  className="w-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 px-4 py-3 text-[10px] font-bold rounded-xl text-neutral-900 dark:text-neutral-50 focus:outline-none"
                >
                  {CUISINES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-neutral-400 uppercase tracking-widest ml-1">Diet</label>
                <select 
                  value={prefs.diet}
                  onChange={e => setPrefs({...prefs, diet: e.target.value})}
                  className="w-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 px-4 py-3 text-[10px] font-bold rounded-xl text-neutral-900 dark:text-neutral-50 focus:outline-none"
                >
                  {DIETS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>
          </section>

          <div className="space-y-4">
            {(validationError || errorState) && (
              <div className="p-5 bg-paprika-50 dark:bg-paprika-900/20 border border-paprika-100 dark:border-paprika-900/40 rounded-3xl flex gap-4 text-paprika-600 animate-fade-in">
                <AlertTriangle size={20} className="flex-shrink-0 mt-0.5" />
                <div className="flex-1 space-y-1">
                  <p className="text-[11px] font-black uppercase tracking-wider">Protocol Alert</p>
                  <p className="text-xs font-medium opacity-90">{validationError || errorState}</p>
                </div>
                <button onClick={() => {setErrorState(null); setValidationError(null)}} className="flex-shrink-0 h-fit"><X size={16}/></button>
              </div>
            )}
            <button 
              disabled={isGenerating || ingredients.length === 0}
              onClick={handleGenerate}
              className={`w-full py-6 text-white font-black text-xs uppercase tracking-[0.4em] flex items-center justify-center gap-4 rounded-[2rem] transition-all shadow-2xl ${
                isGenerating ? 'bg-neutral-900 cursor-not-allowed' : (ingredients.length === 0 ? 'bg-neutral-300 dark:bg-neutral-800 cursor-not-allowed' : 'bg-saffron-500 hover:bg-saffron-600 shadow-saffron-500/20')
              }`}
            >
              {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Wand2 size={18} />}
              {isGenerating ? 'Synthesizing...' : 'Run Synthesis'}
            </button>
          </div>
        </div>

        <div className="lg:col-span-8 h-full min-h-[600px]">
          {isGenerating ? (
            <div className="h-full flex flex-col items-center justify-center space-y-10 bg-white dark:bg-neutral-800/20 rounded-[3rem] border-2 border-dashed border-neutral-200 dark:border-neutral-800 animate-pulse">
              <div className="relative">
                <div className="w-40 h-40 border-4 border-saffron-100 border-t-saffron-500 rounded-full animate-spin" />
                <ChefHat className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-saffron-500" size={48} />
              </div>
              <div className="text-center space-y-6 max-w-sm px-6">
                <p className="text-[11px] font-black uppercase tracking-[0.4em] text-saffron-500">Processing Culinary Intelligence</p>
                <p className="text-base text-neutral-500 dark:text-neutral-400 font-medium italic">Gemini 3 Pro is curating your professional recipe JSON...</p>
              </div>
            </div>
          ) : generatedRecipe ? (
            <div className="space-y-12 animate-fade-in text-left">
              <div className="relative rounded-[3rem] overflow-hidden shadow-2xl group h-[500px] border border-neutral-200 dark:border-neutral-800">
                {generatedRecipe.imageUrl ? (
                   <img src={generatedRecipe.imageUrl} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" alt={generatedRecipe.title} />
                ) : (
                   <div className="w-full h-full bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center">
                      <div className="flex flex-col items-center gap-4">
                        <Loader2 size={40} className="text-saffron-500 animate-spin" />
                        <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Rendering Visuals</span>
                      </div>
                   </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/95 via-neutral-900/30 to-transparent" />
                <div className="absolute bottom-12 left-12 right-12 flex justify-between items-end">
                   <div className="space-y-4 max-w-2xl">
                      <div className="flex gap-2">
                        <span className="px-3 py-1 bg-saffron-500 text-white text-[9px] font-black uppercase tracking-widest rounded-lg">{generatedRecipe.cuisine}</span>
                        <span className="px-3 py-1 bg-neutral-900/60 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-widest rounded-lg border border-white/20">{generatedRecipe.dietaryNeeds[0]}</span>
                      </div>
                      <h3 className="text-5xl md:text-6xl font-serif font-black text-white italic tracking-tight leading-tight">{generatedRecipe.title}</h3>
                   </div>
                   <button 
                     disabled={isSaved}
                     onClick={handleSave} 
                     className={`p-8 rounded-full hover:scale-110 shadow-2xl transition-all ${isSaved ? 'bg-green-500 text-white' : 'bg-white text-saffron-500'}`}
                   >
                     {isSaved ? <CheckCircle2 size={32} /> : <Save size={32} />}
                   </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-8">
                  <h4 className="text-[11px] font-black text-neutral-400 uppercase tracking-[0.4em] flex items-center gap-3">
                    <span className="w-2 h-2 bg-saffron-500 rounded-full"/> INGREDIENTS
                  </h4>
                  <ul className="space-y-4">
                    {generatedRecipe.ingredients.map((ing, i) => (
                      <li key={i} className="flex justify-between p-5 bg-white dark:bg-neutral-800/40 rounded-2xl border border-neutral-100 dark:border-neutral-800 shadow-sm transition-all hover:border-saffron-200">
                        <span className="text-sm font-bold text-neutral-900 dark:text-neutral-50 capitalize">{ing.name}</span>
                        <span className="text-[10px] font-black text-saffron-500 uppercase tracking-widest">{ing.amount} {ing.unit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="space-y-8">
                  <h4 className="text-[11px] font-black text-neutral-400 uppercase tracking-[0.4em] flex items-center gap-3">
                    <span className="w-2 h-2 bg-saffron-500 rounded-full"/> EXECUTION STEPS
                  </h4>
                  <div className="space-y-8">
                    {generatedRecipe.instructions.map((step, i) => (
                      <div key={i} className="flex gap-8 group">
                        <span className="text-3xl font-serif font-black text-saffron-100 dark:text-neutral-800 italic leading-none group-hover:text-saffron-500 transition-colors">{i + 1}</span>
                        <p className="text-base text-neutral-600 dark:text-neutral-400 font-medium leading-relaxed pt-1">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <ChefChat recipe={generatedRecipe} />
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-16 text-center space-y-12 bg-neutral-50 dark:bg-neutral-800/10 rounded-[4rem] border border-dashed border-neutral-200 dark:border-neutral-800/50">
              <div className={`w-28 h-28 rounded-3xl flex items-center justify-center bg-white dark:bg-neutral-800 text-neutral-200 dark:text-neutral-700 shadow-xl border border-neutral-100 dark:border-neutral-800`}>
                <Utensils size={48} />
              </div>
              <div className="max-w-md space-y-4">
                <h3 className="text-4xl font-serif font-black text-neutral-900 dark:text-neutral-50 uppercase italic tracking-tight">Synthesis Ready</h3>
                <p className="text-base text-neutral-400 font-medium">Configure your ingredients and preferences to generate a Michelin-star protocol.</p>
              </div>
              <div className="flex gap-3">
                 <div className={`px-4 py-2 rounded-full text-[9px] font-bold uppercase tracking-widest flex items-center gap-2 border ${ingredients.length > 0 ? 'bg-saffron-50 text-saffron-600 border-saffron-100' : 'bg-neutral-100 text-neutral-400 border-neutral-200'}`}>
                    {ingredients.length > 0 ? <CheckCircle2 size={12}/> : <span className="w-2 h-2 rounded-full bg-neutral-300"/>} {ingredients.length} Ingredients Loaded
                 </div>
                 {ingredients.length > 0 && !validationStatus.hasCore && (
                   <div className="px-4 py-2 rounded-full text-[9px] font-bold uppercase tracking-widest flex items-center gap-2 border bg-paprika-50 text-paprika-600 border-paprika-100 animate-pulse">
                      <AlertTriangle size={12}/> Core Base Needed
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
