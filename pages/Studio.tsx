
import React, { useState, useRef } from 'react';
import { Utensils, Mic, Plus, Wand2, ChefHat, Sparkles, Loader2, Map, ChevronDown, ChevronUp, Search, Camera, Save, Check, RefreshCw } from 'lucide-react';
import { generateRecipe, generateRecipeImage, analyzeIngredients } from '../services/geminiService';
import { Recipe } from '../types';
import { useAuth } from '../context/AuthContext';
import { CUISINES, SKILL_LEVELS, MEAL_TYPES, SPICE_LEVELS, COOKING_PREFERENCES, INGREDIENT_CATEGORIES } from '../constants';
import ChefChat from '../components/ChefChat';

const Studio: React.FC = () => {
  const { saveRecipe } = useAuth();
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [generatedRecipe, setGeneratedRecipe] = useState<Recipe | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(INGREDIENT_CATEGORIES[0].name);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showCamera, setShowCamera] = useState(false);
  
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

  const handleMicToggle = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Speech recognition not supported in this browser.");
    
    const recognition = new SpeechRecognition();
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      const items = transcript.toLowerCase().split(' and ').flatMap((s:string) => s.split(', '));
      setIngredients(prev => [...new Set([...prev, ...items])]);
    };
    recognition.start();
  };

  const startCamera = async () => {
    setShowCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      alert("Camera access denied.");
      setShowCamera(false);
    }
  };

  const captureFrame = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    setIsAnalyzing(true);
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      const base64 = dataUrl.split(',')[1];
      
      const found = await analyzeIngredients(base64);
      if (found.length > 0) {
        setIngredients(prev => [...new Set([...prev, ...found])]);
      } else {
        alert("No clear ingredients identified. Try adjusting lighting or focus.");
      }
    }
    
    setIsAnalyzing(false);
    setShowCamera(false);
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGeneratedRecipe(null);
    setIsSaved(false);
    try {
      const recipe = await generateRecipe({ ingredients, ...prefs });
      const imageUrl = await generateRecipeImage(recipe.imagePrompt);
      setGeneratedRecipe({ ...recipe, imageUrl });
    } catch (err) { 
      alert("Intelligence synthesis failed. Please try a different selection."); 
    } finally { 
      setIsGenerating(false); 
    }
  };

  const handleSave = () => {
    if (generatedRecipe) {
      saveRecipe(generatedRecipe);
      setIsSaved(true);
    }
  };

  return (
    <div className="w-full px-6 md:px-12 lg:px-20 space-y-16 md:space-y-28 pb-32">
      <canvas ref={canvasRef} className="hidden" />
      
      {/* Hero */}
      <header className="flex flex-col lg:flex-row gap-12 lg:items-center">
        <div className="flex-1 space-y-8 text-left">
          <div className="inline-flex items-center gap-3 px-5 py-2 bg-saffron-50 dark:bg-saffron-900/20 text-saffron-600 rounded-full text-[10px] font-black uppercase tracking-[0.3em] border border-saffron-100">
            <Sparkles size={14} /> The Studio / Intelligence V3.1
          </div>
          <h2 className="text-7xl font-serif font-black tracking-tight text-curry-900 dark:text-white uppercase italic leading-[0.9]">
            Blueprint Your<br/><span className="text-saffron-500">Cuisine.</span>
          </h2>
          <p className="text-slate-400 font-medium text-xl max-w-2xl leading-relaxed">
            Harness vision and voice to audit your pantry and synthesize professional protocols.
          </p>
        </div>
      </header>

      {showCamera && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-6 md:p-10 animate-fade-in">
           <video ref={videoRef} autoPlay playsInline className="w-full max-w-2xl aspect-square object-cover rounded-[3rem] border-4 border-white/20 shadow-2xl" />
           <div className="mt-12 flex flex-col md:flex-row gap-6 w-full max-w-2xl">
              <button 
                onClick={captureFrame} 
                disabled={isAnalyzing}
                className="flex-1 py-6 bg-saffron-500 text-white font-black text-xs uppercase tracking-[0.4em] rounded-full shadow-2xl flex items-center justify-center gap-4 hover:bg-saffron-600 transition-all disabled:opacity-50"
              >
                {isAnalyzing ? <RefreshCw className="animate-spin" size={20} /> : <Camera size={20} />}
                {isAnalyzing ? 'Analyzing Matrix...' : 'Identify Ingredients'}
              </button>
              <button onClick={() => setShowCamera(false)} className="flex-1 py-6 bg-white/10 text-white font-black text-xs uppercase tracking-[0.4em] rounded-full hover:bg-white/20 transition-all">Cancel Scan</button>
           </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 md:gap-20">
        <div className="lg:col-span-5 space-y-12">
          {/* Controls */}
          <section className="bg-white dark:bg-charcoal-800 p-8 md:p-12 rounded-[3.5rem] border border-paper-100 dark:border-white/5 shadow-2xl space-y-10">
            <div className="flex items-center justify-between border-b border-paper-50 dark:border-white/5 pb-8">
              <h4 className="text-[11px] font-black text-curry-900 dark:text-white uppercase tracking-[0.4em]">The Pantry Core</h4>
              <div className="flex gap-4">
                 <button onClick={handleMicToggle} className={`p-4 rounded-full transition-all ${isListening ? 'bg-paprika-600 text-white animate-pulse' : 'bg-paper-100 dark:bg-charcoal-900 text-slate-400'}`}>
                    <Mic size={20} />
                 </button>
                 <button onClick={startCamera} className="p-4 bg-paper-100 dark:bg-charcoal-900 text-slate-400 rounded-full hover:bg-saffron-500 hover:text-white transition-all">
                    <Camera size={20} />
                 </button>
              </div>
            </div>

            <div className="space-y-4 max-h-[400px] overflow-y-auto no-scrollbar">
              <div className="flex flex-wrap gap-2 mb-6">
                 {ingredients.length > 0 ? ingredients.map(ing => (
                    <button 
                      key={ing} 
                      onClick={() => toggleIngredient(ing)}
                      className="px-4 py-2 bg-saffron-100 dark:bg-saffron-900/30 text-saffron-700 dark:text-saffron-300 text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-2"
                    >
                      {ing} <Check size={12} />
                    </button>
                 )) : (
                   <p className="text-xs text-slate-300 italic">No items selected yet...</p>
                 )}
              </div>

              {INGREDIENT_CATEGORIES.map(cat => (
                <div key={cat.name} className="border-b border-paper-50 dark:border-white/5 last:border-0">
                  <button 
                    onClick={() => setExpandedCategory(expandedCategory === cat.name ? null : cat.name)}
                    className="w-full flex items-center justify-between py-5 text-base font-bold text-curry-900 dark:text-white hover:text-saffron-500"
                  >
                    <span className="flex items-center gap-4">
                      <div className={`w-1.5 h-1.5 rounded-full ${expandedCategory === cat.name ? 'bg-saffron-500 scale-150' : 'bg-turmeric-400'}`} />
                      {cat.name}
                    </span>
                    {expandedCategory === cat.name ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                  {expandedCategory === cat.name && (
                    <div className="grid grid-cols-2 gap-3 pb-8 pt-2 animate-fade-in">
                      {cat.items.map(item => (
                        <button
                          key={item}
                          onClick={() => toggleIngredient(item)}
                          className={`px-4 py-3 text-[10px] font-bold uppercase tracking-widest transition-all rounded-xl border ${ingredients.includes(item) ? 'bg-saffron-50 text-saffron-700 border-saffron-400' : 'bg-paper-50 dark:bg-charcoal-900 text-slate-500 border-paper-50 dark:border-white/5'}`}
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
              <input 
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addCustomIngredient()}
                placeholder="Manual Input..."
                className="flex-1 bg-transparent border-b border-paper-100 dark:border-white/10 py-4 text-lg font-serif italic font-bold placeholder:text-slate-200 focus:outline-none focus:border-saffron-500"
              />
              <button onClick={addCustomIngredient} className="w-14 h-14 bg-curry-900 dark:bg-white text-white dark:text-charcoal-900 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"><Plus size={24} /></button>
            </div>
          </section>

          {/* Prefs */}
          <section className="bg-paper-100 dark:bg-charcoal-800/40 p-10 md:p-12 rounded-[3.5rem] border border-white dark:border-white/5 space-y-12">
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.4em] border-b border-white/40 pb-6">Synthesis Parameters</h4>
            <div className="grid grid-cols-2 gap-10 text-left">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Region / Style</label>
                <select value={prefs.cuisine} onChange={e => setPrefs(p => ({ ...p, cuisine: e.target.value }))} className="w-full bg-transparent border-b-2 border-white/50 py-3 text-base font-serif font-black italic text-curry-900 dark:text-white focus:outline-none focus:border-saffron-500">
                  {CUISINES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Proficiency</label>
                <select value={prefs.skill} onChange={e => setPrefs(p => ({ ...p, skill: e.target.value as any }))} className="w-full bg-transparent border-b-2 border-white/50 py-3 text-base font-serif font-black italic text-curry-900 dark:text-white focus:outline-none focus:border-saffron-500">
                  {SKILL_LEVELS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <button 
              onClick={handleGenerate}
              disabled={isGenerating || ingredients.length === 0}
              className="w-full py-7 bg-saffron-500 text-white font-black text-xs uppercase tracking-[0.4em] flex items-center justify-center gap-5 rounded-[2.5rem] hover:bg-saffron-600 transition-all shadow-2xl shadow-saffron-500/40 disabled:opacity-50 disabled:shadow-none"
            >
              {isGenerating ? <Loader2 size={24} className="animate-spin" /> : <Wand2 size={24} />}
              {isGenerating ? 'Computing...' : 'Initialize Synthesis'}
            </button>
          </section>
        </div>

        <div className="lg:col-span-7">
          {isGenerating ? (
            <div className="min-h-[600px] flex flex-col items-center justify-center p-20 bg-white dark:bg-charcoal-800 rounded-[4rem] border border-paper-100 dark:border-white/5 shadow-2xl animate-pulse">
               <div className="w-20 h-20 bg-saffron-50 dark:bg-charcoal-900 rounded-full flex items-center justify-center text-saffron-500 mb-8">
                  <ChefHat size={40} className="animate-bounce" />
               </div>
              <h2 className="text-3xl font-serif font-black text-curry-900 dark:text-white italic">Synthesizing Records...</h2>
              <p className="mt-4 text-slate-400 font-medium tracking-tight">Mapping ingredient vectors to culinary protocols.</p>
            </div>
          ) : generatedRecipe ? (
            <div className="space-y-12 animate-slide-up text-left">
              <div className="relative h-[550px] rounded-[4rem] overflow-hidden shadow-2xl border-8 border-white dark:border-charcoal-800 group">
                <img src={generatedRecipe.imageUrl} className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900 via-charcoal-900/20 to-transparent flex flex-col justify-end p-12">
                   <h1 className="text-6xl font-serif font-black text-white italic leading-none drop-shadow-lg">{generatedRecipe.title}</h1>
                </div>
                <button 
                  onClick={handleSave}
                  disabled={isSaved}
                  className="absolute top-10 right-10 p-5 bg-white text-saffron-500 rounded-full shadow-2xl hover:scale-110 transition-transform flex items-center gap-3 font-black text-xs uppercase tracking-widest"
                >
                  {isSaved ? <><Check size={20} /> Archived</> : <><Save size={20} /> Save to Cookbook</>}
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                 <div className="space-y-8">
                    <h4 className="text-[12px] font-black text-slate-400 uppercase tracking-[0.4em]">Aligned Components</h4>
                    <ul className="space-y-3">
                       {generatedRecipe.ingredients.map((ing, i) => (
                         <li key={i} className="flex justify-between items-center p-5 bg-white dark:bg-charcoal-800 rounded-2xl border border-paper-100 dark:border-white/5 hover:border-saffron-200 transition-colors">
                            <span className="font-bold text-curry-900 dark:text-white">{ing.name}</span>
                            <span className="text-[10px] font-black text-saffron-500 uppercase tracking-widest">{ing.amount} {ing.unit}</span>
                         </li>
                       ))}
                    </ul>
                 </div>
                 <div className="space-y-8">
                    <h4 className="text-[12px] font-black text-slate-400 uppercase tracking-[0.4em]">Execution Roadmap</h4>
                    <div className="space-y-6">
                       {generatedRecipe.instructions.map((step, i) => (
                         <div key={i} className="flex gap-6">
                            <span className="shrink-0 w-8 h-8 rounded-full bg-saffron-500 text-white flex items-center justify-center text-xs font-black">{i+1}</span>
                            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">{step}</p>
                         </div>
                       ))}
                    </div>
                 </div>
              </div>
              <ChefChat recipe={generatedRecipe} />
            </div>
          ) : (
            <div className="min-h-[600px] flex flex-col items-center justify-center p-20 bg-paper-50 dark:bg-charcoal-800/30 rounded-[4rem] border border-dashed border-paper-200 dark:border-white/10">
               <div className="w-24 h-24 bg-white dark:bg-charcoal-800 rounded-full flex items-center justify-center text-slate-100 dark:text-charcoal-900 mb-8 shadow-sm">
                  <ChefHat size={48} />
               </div>
               <h3 className="text-2xl font-serif font-black text-curry-900 dark:text-white uppercase italic">Studio Standby</h3>
               <p className="mt-6 text-slate-400 font-medium max-w-xs text-center leading-relaxed">Select items or use the Vision Audit to begin recipe synthesis.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Studio;
