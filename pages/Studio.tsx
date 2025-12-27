
import React, { useState, useRef } from 'react';
import { Utensils, Mic, Plus, Wand2, ChefHat, Sparkles, Loader2, ShieldAlert, ChevronDown, ChevronUp, Camera, Save, Check, RefreshCw, AlertCircle, Terminal } from 'lucide-react';
import { generateRecipe, generateRecipeImage, analyzeIngredients } from '../services/geminiService';
import { Recipe } from '../types';
import { useAuth } from '../context/AuthContext';
import { CUISINES, SKILL_LEVELS, INGREDIENT_CATEGORIES } from '../constants';
import ChefChat from '../components/ChefChat';

const Studio: React.FC = () => {
  const { saveRecipe } = useAuth();
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [generatedRecipe, setGeneratedRecipe] = useState<Recipe | null>(null);
  const [errorState, setErrorState] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(INGREDIENT_CATEGORIES[0].name);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [prefs, setPrefs] = useState({
    diet: 'None',
    cuisine: 'North Indian',
    mealType: 'Dinner',
    skill: 'Intermediate',
    spiceLevel: 'Medium',
    cookingPreference: 'Home-style'
  });

  const handleGenerate = async () => {
    if (ingredients.length === 0) return;
    
    setIsGenerating(true);
    setGeneratedRecipe(null);
    setErrorState(null);
    setIsSaved(false);
    try {
      const recipe = await generateRecipe({ ingredients, ...prefs });
      const imageUrl = await generateRecipeImage(recipe.imagePrompt);
      setGeneratedRecipe({ ...recipe, imageUrl });
    } catch (err: any) { 
      console.error("Synthesis Error:", err);
      if (err.message === "API_KEY_MISSING") {
        setErrorState("API_CONFIGURATION_REQUIRED");
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

  if (errorState === "API_CONFIGURATION_REQUIRED") {
    return (
      <div className="min-h-[600px] flex items-center justify-center p-10">
        <div className="max-w-xl w-full bg-white dark:bg-neutral-800 p-12 rounded-[3rem] border border-neutral-200 dark:border-neutral-700 shadow-2xl text-center space-y-8 animate-slide-up">
          <div className="w-20 h-20 bg-paprika-50 dark:bg-paprika-500/10 text-paprika-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
            <ShieldAlert size={40} />
          </div>
          <div className="space-y-4">
            <h2 className="text-3xl font-serif font-black text-neutral-900 dark:text-neutral-50 uppercase italic tracking-tight">System Offline.</h2>
            <p className="text-neutral-500 font-medium leading-relaxed">
              The ChefAI synthesis engine is missing its server-side <span className="text-saffron-600 font-bold">API_KEY</span>. 
              Please verify your Vercel Dashboard Environment Variables.
            </p>
          </div>
          <div className="bg-neutral-50 dark:bg-neutral-900 p-4 rounded-2xl text-left border border-neutral-100 dark:border-neutral-700">
             <div className="flex items-center gap-2 mb-2">
                <Terminal size={14} className="text-neutral-400" />
                <span className="text-[10px] font-bold text-neutral-400 uppercase">Production Resolution</span>
             </div>
             <p className="text-[11px] text-neutral-500 leading-normal">
                1. Go to Vercel Dashboard > Settings > Environment Variables.<br/>
                2. Add <code className="text-saffron-500 font-bold">API_KEY</code>.<br/>
                3. Redeploy your application to activate the key.
             </p>
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="w-full py-5 bg-neutral-900 dark:bg-neutral-50 text-white dark:text-neutral-900 font-bold text-xs uppercase tracking-widest rounded-2xl hover:scale-[1.02] transition-transform shadow-lg"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-12 md:space-y-20">
      <canvas ref={canvasRef} className="hidden" />
      <header className="flex flex-col lg:flex-row gap-8 lg:items-center">
        <div className="flex-1 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-saffron-50 dark:bg-saffron-900/10 text-saffron-600 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-saffron-100/50">
            <Sparkles size={14} /> Secure Server Mode • Active
          </div>
          <h2 className="text-5xl md:text-7xl font-serif font-black tracking-tight text-neutral-900 dark:text-neutral-50 uppercase italic leading-[0.9]">
            Synthesis<br/><span className="text-saffron-500">Laboratory.</span>
          </h2>
          <p className="text-neutral-500 font-medium text-lg md:text-xl max-w-2xl leading-relaxed">
            Audit your pantry and generate culinary blueprints via our server-hardened AI synthesis engine.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-16">
        <div className="lg:col-span-5 space-y-8">
          <section className="bg-white dark:bg-neutral-800 p-8 rounded-[2rem] border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-8">
            <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest border-b border-neutral-100 dark:border-neutral-700 pb-4">Pantry Audit</h4>
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              <div className="flex flex-wrap gap-2">
                {ingredients.map(ing => (
                  <button key={ing} onClick={() => toggleIngredient(ing)} className="px-3 py-1.5 bg-saffron-50 dark:bg-saffron-900/20 text-saffron-600 text-[10px] font-bold uppercase tracking-wider rounded-lg flex items-center gap-2 border border-saffron-100 dark:border-saffron-900/50">
                    {ing} <Check size={12} />
                  </button>
                ))}
              </div>
              {INGREDIENT_CATEGORIES.map(cat => (
                <div key={cat.name} className="border-b border-neutral-100 dark:border-neutral-700 last:border-0">
                  <button onClick={() => setExpandedCategory(expandedCategory === cat.name ? null : cat.name)} className="w-full flex items-center justify-between py-4 text-sm font-bold text-neutral-700 dark:text-neutral-200 hover:text-saffron-500">
                    {cat.name} {expandedCategory === cat.name ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  {expandedCategory === cat.name && (
                    <div className="grid grid-cols-2 gap-2 pb-5 animate-fade-in">
                      {cat.items.map(item => (
                        <button key={item} onClick={() => toggleIngredient(item)} className={`px-4 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg border ${ingredients.includes(item) ? 'bg-saffron-500 text-white border-saffron-500' : 'bg-neutral-50 dark:bg-neutral-900 text-neutral-400 border-neutral-100 dark:border-neutral-700'}`}>{item}</button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="pt-6 border-t border-neutral-100 dark:border-neutral-700 flex gap-3">
              <input value={inputValue} onChange={e => setInputValue(e.target.value)} onKeyDown={e => e.key === 'Enter' && addCustomIngredient()} placeholder="Manual entry..." className="flex-1 bg-transparent border-b border-neutral-200 dark:border-neutral-700 py-3 text-sm font-bold focus:outline-none focus:border-saffron-500" />
              <button onClick={addCustomIngredient} className="w-12 h-12 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-xl flex items-center justify-center"><Plus size={20} /></button>
            </div>
          </section>

          <section className="bg-neutral-100/50 dark:bg-neutral-800/40 p-8 rounded-[2rem] border border-neutral-200 dark:border-neutral-800 space-y-10">
            <div className="grid grid-cols-2 gap-8 text-left">
              <div className="space-y-2.5">
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block">Region Focus</label>
                <select value={prefs.cuisine} onChange={e => setPrefs(p => ({ ...p, cuisine: e.target.value }))} className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 px-3 py-2.5 text-xs font-bold rounded-xl">
                  {CUISINES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="space-y-2.5">
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block">Proficiency</label>
                <select value={prefs.skill} onChange={e => setPrefs(p => ({ ...p, skill: e.target.value as any }))} className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 px-3 py-2.5 text-xs font-bold rounded-xl">
                  {SKILL_LEVELS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <button 
              onClick={handleGenerate} 
              disabled={isGenerating || ingredients.length === 0} 
              className="w-full py-5 bg-saffron-500 text-white font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-4 rounded-2xl hover:bg-saffron-600 transition-all shadow-xl shadow-saffron-500/20 disabled:opacity-40"
            >
              {isGenerating ? <Loader2 size={20} className="animate-spin" /> : <Wand2 size={20} />}
              {isGenerating ? 'Synthesizing...' : 'Initialize Logic'}
            </button>
            {errorState === "SYNTHESIS_INTERRUPTED" && (
              <div className="p-4 bg-paprika-50 dark:bg-paprika-500/10 rounded-xl flex items-center gap-3 text-paprika-600 animate-fade-in">
                <AlertCircle size={18} />
                <span className="text-[10px] font-bold uppercase tracking-wider">Logic Error: Synthesis Interrupted.</span>
              </div>
            )}
          </section>
        </div>

        <div className="lg:col-span-7">
          {isGenerating ? (
            <div className="min-h-[500px] flex flex-col items-center justify-center p-12 bg-white dark:bg-neutral-800 rounded-[2.5rem] border border-neutral-200 dark:border-neutral-700 shadow-sm animate-pulse">
               <ChefHat size={40} className="text-saffron-500 animate-bounce mb-6" />
               <h2 className="text-2xl font-serif font-black text-neutral-900 dark:text-neutral-50 uppercase italic">Mapping Vectors...</h2>
               <p className="mt-4 text-neutral-400 font-medium">Communicating with secure synthesis node.</p>
            </div>
          ) : generatedRecipe ? (
            <div className="space-y-10 animate-slide-up">
              <div className="relative h-[450px] rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white dark:border-neutral-800 group">
                <img src={generatedRecipe.imageUrl} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-transparent flex flex-col justify-end p-10">
                   <h1 className="text-4xl md:text-5xl font-serif font-black text-white italic leading-none">{generatedRecipe.title}</h1>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                 <div className="space-y-6">
                    <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest border-b pb-3">Inputs</h4>
                    <ul className="space-y-2">
                       {generatedRecipe.ingredients.map((ing, i) => (
                         <li key={i} className="flex justify-between items-center p-4 bg-white dark:bg-neutral-800 rounded-xl border">
                            <span className="font-bold text-sm">{ing.name}</span>
                            <span className="text-[10px] font-bold text-saffron-500 uppercase">{ing.amount} {ing.unit}</span>
                         </li>
                       ))}
                    </ul>
                 </div>
                 <div className="space-y-6">
                    <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest border-b pb-3">Execution</h4>
                    <div className="space-y-5">
                       {generatedRecipe.instructions.map((step, i) => (
                         <div key={i} className="flex gap-4">
                            <span className="shrink-0 w-6 h-6 rounded-lg bg-neutral-900 dark:bg-neutral-50 text-white dark:text-neutral-900 flex items-center justify-center text-[10px] font-black">{i+1}</span>
                            <p className="text-sm leading-relaxed">{step}</p>
                         </div>
                       ))}
                    </div>
                 </div>
              </div>
              <ChefChat recipe={generatedRecipe} />
            </div>
          ) : (
            <div className="min-h-[500px] flex flex-col items-center justify-center p-12 bg-neutral-50/50 dark:bg-neutral-800/20 rounded-[2.5rem] border-2 border-dashed border-neutral-200 dark:border-neutral-800">
               <ChefHat size={48} className="text-neutral-200 dark:text-neutral-700 mb-6" />
               <h3 className="text-xl font-serif font-black text-neutral-500 uppercase italic">Ready for Synthesis</h3>
               <p className="mt-2 text-neutral-400 text-sm">Select ingredients to begin protocol.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Studio;
