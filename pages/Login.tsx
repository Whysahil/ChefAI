
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ChefHat, ArrowRight, User as UserIcon, LogIn, Sparkles, ShieldCheck } from 'lucide-react';
import { APP_NAME } from '../constants';

const Login: React.FC = () => {
  const { login, signup, accounts, switchAccount } = useAuth();
  const [isLogin, setIsLogin] = useState(accounts.length > 0);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (isLogin) {
        await login(email);
      } else {
        await signup(name, email);
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-paper-50 dark:bg-charcoal-900">
      {/* Visual Side */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-charcoal-900">
        <img 
          src="https://images.unsplash.com/photo-1505253758473-96b7015fcd40?auto=format&fit=crop&q=80&w=1200" 
          className="absolute inset-0 w-full h-full object-cover opacity-60"
          alt="Culinary background"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900 via-transparent" />
        <div className="relative z-10 p-20 flex flex-col justify-end">
          <div className="w-16 h-16 bg-saffron-500 rounded-full flex items-center justify-center text-white mb-8 shadow-2xl">
            <ChefHat size={32} />
          </div>
          <h1 className="text-7xl font-serif font-black text-white italic leading-none mb-6">ChefAI</h1>
          <p className="text-2xl text-slate-300 font-medium max-w-md">Your personal AI-powered cookbook. Traditional roots, intelligent future.</p>
        </div>
        <img src="https://cdn.pixabay.com/photo/2017/09/01/21/53/mandala-2705640_1280.png" className="absolute -top-20 -right-20 w-[600px] opacity-10 rotate-12" alt="" />
      </div>

      {/* Form Side */}
      <div className="flex-1 flex flex-col justify-center px-8 md:px-20 lg:px-32 py-20 animate-fade-in">
        <div className="max-w-md w-full mx-auto space-y-12">
          <div className="lg:hidden flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-saffron-500 rounded-full flex items-center justify-center text-white">
              <ChefHat size={20} />
            </div>
            <span className="font-serif italic text-2xl font-black text-curry-900 dark:text-saffron-500">{APP_NAME}</span>
          </div>

          <div className="space-y-4">
             <div className="inline-flex items-center gap-2 text-saffron-600 font-bold text-[10px] tracking-[0.3em] uppercase bg-saffron-50 px-4 py-1.5 rounded-full">
              <ShieldCheck size={14} /> Intelligence Portal
            </div>
            <h2 className="text-4xl font-serif font-black text-curry-900 dark:text-white uppercase italic">{isLogin ? 'Welcome Back' : 'Create Identity'}</h2>
            <p className="text-slate-400 font-medium">Access your personal culinary archive and synthesis engine.</p>
          </div>

          {accounts.length > 0 && isLogin && (
            <div className="space-y-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Accounts</p>
              <div className="flex flex-wrap gap-4">
                {accounts.map(acc => (
                  <button 
                    key={acc.uid} 
                    onClick={() => switchAccount(acc.uid)}
                    className="flex items-center gap-3 p-3 bg-white dark:bg-charcoal-800 rounded-2xl border border-paper-100 dark:border-white/5 hover:border-saffron-500 transition-all group"
                  >
                    <div className="w-8 h-8 rounded-full bg-saffron-100 text-saffron-600 flex items-center justify-center text-xs font-bold">
                      {acc.displayName[0]}
                    </div>
                    <span className="text-sm font-bold text-curry-900 dark:text-white">{acc.displayName}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-6">
              {!isLogin && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Full Name</label>
                  <input 
                    type="text" 
                    required 
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full bg-transparent border-b-2 border-paper-100 dark:border-white/10 py-4 text-lg font-serif italic font-bold placeholder:text-slate-200 focus:outline-none focus:border-saffron-500 transition-colors"
                  />
                </div>
              )}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Email Protocol</label>
                <input 
                  type="email" 
                  required 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@nexus.com"
                  className="w-full bg-transparent border-b-2 border-paper-100 dark:border-white/10 py-4 text-lg font-serif italic font-bold placeholder:text-slate-200 focus:outline-none focus:border-saffron-500 transition-colors"
                />
              </div>
            </div>

            {error && <p className="text-paprika-600 text-xs font-bold tracking-tight">{error}</p>}

            <button 
              type="submit"
              className="w-full py-6 bg-saffron-500 text-white font-black text-xs uppercase tracking-[0.4em] flex items-center justify-center gap-5 rounded-[2rem] hover:bg-saffron-600 transition-all shadow-2xl shadow-saffron-500/30"
            >
              {isLogin ? 'Initialize Session' : 'Register Identity'} <ArrowRight size={18} />
            </button>
          </form>

          <div className="pt-8 border-t border-paper-100 dark:border-white/5 text-center">
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-[11px] font-black text-slate-400 uppercase tracking-widest hover:text-saffron-500 transition-colors"
            >
              {isLogin ? "Need a new identity? Sign Up" : "Already registered? Sign In"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
