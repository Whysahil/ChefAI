
import React, { useState, useEffect, useRef } from 'react';
import { Send, ChefHat, X, MessageSquare, Sparkles } from 'lucide-react';
import { Recipe } from '../types';
import { createChefChat } from '../services/geminiService';

interface ChefChatProps {
  recipe: Recipe;
  onClose?: () => void;
}

const ChefChat: React.FC<ChefChatProps> = ({ recipe, onClose }) => {
  const [messages, setMessages] = useState<{role: 'user' | 'chef', text: string}[]>([
    { role: 'chef', text: `Synthesis complete for "${recipe.title}". I am here to help with refinements or substitutions.` }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const chatRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatRef.current = createChefChat(recipe);
  }, [recipe]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);
    try {
      const result = await chatRef.current.sendMessage({ message: userMsg });
      setMessages(prev => [...prev, { role: 'chef', text: result.text }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'chef', text: "Synthesis interrupted. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-12 right-12 w-20 h-20 bg-saffron-500 text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-curry-900 transition-all duration-700 z-50 group border-4 border-white dark:border-charcoal-800"
      >
        <MessageSquare size={28} className="group-hover:scale-110 transition-transform duration-500" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-12 right-12 w-[440px] h-[650px] bg-paper-50 dark:bg-charcoal-900 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] flex flex-col border border-paper-100 dark:border-white/5 z-50 rounded-[3rem] overflow-hidden animate-slide-up">
      <div className="px-10 py-8 bg-saffron-500 text-white flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <Sparkles size={18} />
          </div>
          <div>
            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] leading-none">Culinary Intelligence</h3>
            <p className="text-[9px] font-bold text-white/70 uppercase mt-1">ChefAI assistant</p>
          </div>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-white/70 hover:text-white transition-colors">
          <X size={20} />
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 p-10 overflow-y-auto space-y-12 recipe-scroll bg-white dark:bg-charcoal-900">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`
              max-w-[85%] text-base leading-[1.7]
              ${msg.role === 'user' 
                ? 'font-bold text-curry-900 dark:text-white text-right' 
                : 'font-medium text-slate-500 italic'}
            `}>
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="text-[10px] font-black uppercase tracking-[0.4em] text-saffron-500 animate-pulse">
              Synthesizing Response...
            </div>
          </div>
        )}
      </div>

      <div className="p-10 border-t border-paper-100 dark:border-white/5 flex gap-6 bg-paper-50 dark:bg-charcoal-900">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Refine parameters..."
          className="flex-1 bg-transparent border-b border-paper-100 dark:border-white/10 py-3 text-base font-serif font-black italic text-curry-900 dark:text-white placeholder:text-slate-300 focus:outline-none focus:border-saffron-500 transition-colors"
        />
        <button 
          onClick={handleSend}
          disabled={!input.trim() || isLoading}
          className="text-saffron-500 disabled:opacity-30 hover:scale-120 transition-transform p-2 bg-white dark:bg-charcoal-800 rounded-full shadow-sm"
        >
          <Send size={22} />
        </button>
      </div>
    </div>
  );
};

export default ChefChat;
