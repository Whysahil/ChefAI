
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
    if (!SpeechRecognition) return alert("Visual accessibility: Speech recognition not supported in this environment.");
    
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
      alert("Vision audit: Camera access denied.");
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
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      const base64 = dataUrl.split(',')[1];
      
      const found = await analyzeIngredients(base64);
      if (found.length > 0) {
        setIngredients(prev => [...new Set([...prev, ...found])]);
      } else {
        alert("Chromatic identification failure. Adjust focus or lighting.");
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
      alert("Synthesis map interrupted. Refine parameters."); 
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
    <div className="w-full space-y-12 md:space-y-20">
      <canvas ref={canvasRef} className="hidden" />
      
      <header className="flex flex-col lg:flex-row gap-8 lg:items-center">
        <div className="flex-1 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-saffron-50 dark:bg-saffron-900/10 text-saffron-600 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-saffron-100/50">
            <Sparkles size={14} /> Module V4.0 • Display Corrected
          </div>
          <h2 className="text-5xl md:text-7xl font-serif font-black tracking-tight text-neutral-900 dark:text-neutral-50 uppercase italic leading-[0.9]">
            Synthesis<br/><span className="text-saffron-500">Laboratory.</span>
          </h2>
          <p className="text-neutral-500 font-medium text-lg md:text-xl max-w-2xl leading-relaxed">
            Audit your pantry using multi-spectral vision and voice recognition to generate calibrated culinary blueprints.
          </p>
        </div>
      </header>

      {showCamera && (
        <div className="fixed inset-0 z-[100] bg-neutral-900/95 backdrop-blur-2xl flex flex-col items-center justify-center p-6 animate-fade-in">
           <div className="relative w-full max-w-2xl aspect-square rounded-[2.5rem] overflow-hidden border-2 border-white/20 shadow-2xl">
             <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
             <div className="absolute inset-0 border-[20px] border-neutral-900/20 pointer-events-none" />
           </div>
           <div className="mt-10 flex gap-4 w-full max-w-2xl">
              <button 
                onClick={captureFrame} 
                disabled={isAnalyzing}
                className="flex-1 py-5 bg-saffron-500 text-white font-bold text-xs uppercase tracking-widest rounded-2xl shadow-xl flex items-center justify-center gap-3 hover:bg-saffron-600 transition-all disabled:opacity-50"
              >
                {isAnalyzing ? <RefreshCw className="animate-spin" size={18} /> : <Camera size={18} />}
                {isAnalyzing ? 'Scanning...' : 'Capture Metadata'}
              </button>
              <button onClick={() => setShowCamera(false)} className="flex-1 py-5 bg-white/10 text-white font-bold text-xs uppercase tracking-widest rounded-2xl hover:bg-white/20 transition-all">Abort Scan</button>
           </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-16">
        <div className="lg:col-span-5 space-y-8">
          <section className="bg-white dark:bg-neutral-800 p-8 rounded-[2rem] border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-8">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-700 pb-6">
              <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Pantry Audit</h4>
              <div className="flex gap-3">
                 <button onClick={handleMicToggle} className={`p-3 rounded-lg transition-all ${isListening ? 'bg-paprika-600 text-white animate-pulse' : 'bg-neutral-50 dark:bg-neutral-900 text-neutral-400'}`}>
                    <Mic size={18} />
                 </button>
                 <button onClick={startCamera} className="p-3 bg-neutral-50 dark:bg-neutral-900 text-neutral-400 rounded-lg hover:bg-saffron-500 hover:text-white transition-all">
                    <Camera size={18} />
                 </button>
              </div>
            </div>

            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
              <div className="flex flex-wrap gap-2 mb-4">
                 {ingredients.length > 0 ? ingredients.map(ing => (
                    <button 
                      key={ing} 
                      onClick={() => toggleIngredient(ing)}
                      className="px-3 py-1.5 bg-saffron-50 dark:bg-saffron-900/20 text-saffron-600 text-[10px] font-bold uppercase tracking-wider rounded-lg flex items-center gap-2 border border-saffron-100 dark:border-saffron-900/50"
                    >
                      {ing} <Check size={12} />
                    </button>
                 )) : (
                   <p className="text-xs text-neutral-300 italic">Standby: Awaiting ingredient metadata...</p>
                 )}
              </div>

              {INGREDIENT_CATEGORIES.map(cat => (
                <div key={cat.name} className="border-b border-neutral-100 dark:border-neutral-700 last:border-0">
                  <button 
                    onClick={() => setExpandedCategory(expandedCategory === cat.name ? null : cat.name)}
                    className="w-full flex items-center justify-between py-4 text-sm font-bold text-neutral-700 dark:text-neutral-200 hover:text-saffron-500"
                  >
                    <span className="flex items-center gap-3">
                      <div className={`w-1 h-1 rounded-full ${expandedCategory === cat.name ? 'bg-saffron-500' : 'bg-neutral-300'}`} />
                      {cat.name}
                    </span>
                    {expandedCategory === cat.name ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  {expandedCategory === cat.name && (
                    <div className="grid grid-cols-2 gap-2 pb-5 pt-1 animate-fade-in">
                      {cat.items.map(item => (
                        <button
                          key={item}
                          onClick={() => toggleIngredient(item)}
                          className={`px-4 py-2 text-[10px] font-bold uppercase tracking-wider transition-all rounded-lg border ${ingredients.includes(item) ? 'bg-saffron-500 text-white border-saffron-500 shadow-lg shadow-saffron-500/10' : 'bg-neutral-50 dark:bg-neutral-900 text-neutral-400 border-neutral-100 dark:border-neutral-700'}`}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="pt-6 border-t border-neutral-100 dark:border-neutral-700 flex gap-3">
              <input 
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addCustomIngredient()}
                placeholder="Manual entry..."
                className="flex-1 bg-transparent border-b border-neutral-200 dark:border-neutral-700 py-3 text-sm font-bold placeholder:text-neutral-300 focus:outline-none focus:border-saffron-500"
              />
              <button onClick={addCustomIngredient} className="w-12 h-12 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-xl flex items-center justify-center hover:scale-105 transition-transform"><Plus size={20} /></button>
            </div>
          </section>

          <section className="bg-neutral-100/50 dark:bg-neutral-800/40 p-8 rounded-[2rem] border border-neutral-200 dark:border-neutral-800 space-y-10">
            <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest border-b border-neutral-200 dark:border-neutral-700 pb-4">Synthesis Constraints</h4>
            <div className="grid grid-cols-2 gap-8 text-left">
              <div className="space-y-2.5">
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block">Region Focus</label>
                <select 
                  value={prefs.cuisine} 
                  onChange={e => setPrefs(p => ({ ...p, cuisine: e.target.value }))} 
                  className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 px-3 py-2.5 text-xs font-bold text-neutral-800 dark:text-neutral-50 focus:outline-none focus:border-saffron-500 rounded-xl shadow-sm"
                >
                  {CUISINES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="space-y-2.5">
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block">Proficiency</label>
                <select 
                  value={prefs.skill} 
                  onChange={e => setPrefs(p => ({ ...p, skill: e.target.value as any }))} 
                  className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 px-3 py-2.5 text-xs font-bold text-neutral-800 dark:text-neutral-50 focus:outline-none focus:border-saffron-500 rounded-xl shadow-sm"
                >
                  {SKILL_LEVELS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <button 
              onClick={handleGenerate}
              disabled={isGenerating || ingredients.length === 0}
              className="w-full py-5 bg-saffron-500 text-white font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-4 rounded-2xl hover:bg-saffron-600 transition-all shadow-xl shadow-saffron-500/20 disabled:opacity-40 disabled:shadow-none"
            >
              {isGenerating ? <Loader2 size={20} className="animate-spin" /> : <Wand2 size={20} />}
              {isGenerating ? 'Synthesizing...' : 'Initialize Logic'}
            </button>
          </section>
        </div>

        <div className="lg:col-span-7">
          {isGenerating ? (
            <div className="min-h-[500px] flex flex-col items-center justify-center p-12 bg-white dark:bg-neutral-800 rounded-[2.5rem] border border-neutral-200 dark:border-neutral-800 shadow-sm animate-pulse">
               <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-900 rounded-2xl flex items-center justify-center text-saffron-500 mb-6">
                  <ChefHat size={32} className="animate-bounce" />
               </div>
              <h2 className="text-2xl font-serif font-black text-neutral-900 dark:text-neutral-50 uppercase italic">Mapping Vectors...</h2>
              <p className="mt-2 text-neutral-400 font-medium tracking-tight">Applying culinary logic to ingredient metadata.</p>
            </div>
          ) : generatedRecipe ? (
            <div className="space-y-10 animate-slide-up">
              <div className="relative h-[450px] rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white dark:border-neutral-800 group">
                <img src={generatedRecipe.imageUrl} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-transparent flex flex-col justify-end p-10">
                   <h1 className="text-4xl md:text-5xl font-serif font-black text-white italic leading-none drop-shadow-md">{generatedRecipe.title}</h1>
                </div>
                <button 
                  onClick={handleSave}
                  disabled={isSaved}
                  className="absolute top-6 right-6 px-5 py-3 bg-white text-saffron-500 rounded-xl shadow-xl hover:scale-105 transition-transform flex items-center gap-3 font-bold text-[10px] uppercase tracking-wider"
                >
                  {isSaved ? <><Check size={16} /> Archived</> : <><Save size={16} /> Archive Blueprint</>}
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                 <div className="space-y-6">
                    <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest border-b border-neutral-100 dark:border-neutral-700 pb-3">Metadata Inputs</h4>
                    <ul className="space-y-2">
                       {generatedRecipe.ingredients.map((ing, i) => (
                         <li key={i} className="flex justify-between items-center p-4 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-100 dark:border-neutral-700">
                            <span className="font-bold text-neutral-900 dark:text-neutral-50 text-sm">{ing.name}</span>
                            <span className="text-[10px] font-bold text-saffron-500 uppercase tracking-wider">{ing.amount} {ing.unit}</span>
                         </li>
                       ))}
                    </ul>
                 </div>
                 <div className="space-y-6">
                    <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest border-b border-neutral-100 dark:border-neutral-700 pb-3">Logic Execution</h4>
                    <div className="space-y-5">
                       {generatedRecipe.instructions.map((step, i) => (
                         <div key={i} className="flex gap-4">
                            <span className="shrink-0 w-6 h-6 rounded-lg bg-neutral-900 dark:bg-neutral-50 text-white dark:text-neutral-900 flex items-center justify-center text-[10px] font-black">{i+1}</span>
                            <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed font-medium">{step}</p>
                         </div>
                       ))}
                    </div>
                 </div>
              </div>
              <ChefChat recipe={generatedRecipe} />
            </div>
          ) : (
            <div className="min-h-[500px] flex flex-col items-center justify-center p-12 bg-neutral-50/50 dark:bg-neutral-800/20 rounded-[2.5rem] border-2 border-dashed border-neutral-200 dark:border-neutral-800">
               <div className="w-20 h-20 bg-white dark:bg-neutral-800 rounded-2xl flex items-center justify-center text-neutral-100 dark:text-neutral-800 mb-6 shadow-sm">
                  <ChefHat size={36} />
               </div>
               <h3 className="text-xl font-serif font-black text-neutral-500 dark:text-neutral-600 uppercase italic">Awaiting Input Protocol</h3>
               <p className="mt-4 text-neutral-400 font-medium text-center max-w-xs leading-relaxed">Initialize the Vision Audit or select components to start culinary synthesis.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Studio;
