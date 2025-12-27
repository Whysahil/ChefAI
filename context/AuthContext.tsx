
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserPreferences, Recipe } from '../types';

interface AuthContextType {
  user: User | null;
  accounts: User[];
  loading: boolean;
  login: (email: string) => Promise<void>;
  signup: (name: string, email: string) => Promise<void>;
  logout: () => Promise<void>;
  switchAccount: (uid: string) => void;
  updatePreferences: (prefs: Partial<UserPreferences>) => void;
  updateProfile: (data: { displayName?: string; theme?: 'light' | 'dark' }) => void;
  saveRecipe: (recipe: Recipe) => void;
  deleteRecipe: (id: string) => void;
  savedRecipes: Recipe[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'chef_ai_accounts';
const SESSION_KEY = 'chef_ai_current_uid';
const RECIPE_KEY = 'chef_ai_saved_recipes';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accounts, setAccounts] = useState<User[]>([]);
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedAccounts = localStorage.getItem(STORAGE_KEY);
    const currentUid = localStorage.getItem(SESSION_KEY);
    const storedRecipes = localStorage.getItem(RECIPE_KEY);

    if (storedAccounts) {
      const parsedAccounts = JSON.parse(storedAccounts);
      setAccounts(parsedAccounts);
      if (currentUid) {
        const currentUser = parsedAccounts.find((u: User) => u.uid === currentUid);
        if (currentUser) setUser(currentUser);
      }
    }
    if (storedRecipes) {
      setSavedRecipes(JSON.parse(storedRecipes));
    }
    setLoading(false);
  }, []);

  const login = async (email: string) => {
    const existing = accounts.find(a => a.email === email);
    if (existing) {
      setUser(existing);
      localStorage.setItem(SESSION_KEY, existing.uid);
    } else {
      throw new Error("Account not found");
    }
  };

  const signup = async (name: string, email: string) => {
    const newUser: User = {
      uid: Math.random().toString(36).substr(2, 9),
      email,
      displayName: name,
      theme: 'light',
      savedRecipes: [],
      preferences: {
        diet: 'None',
        skillLevel: 'Intermediate',
        defaultServings: 2,
        favoriteCuisines: [],
        allergies: []
      }
    };
    const updated = [...accounts, newUser];
    setAccounts(updated);
    setUser(newUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    localStorage.setItem(SESSION_KEY, newUser.uid);
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem(SESSION_KEY);
  };

  const switchAccount = (uid: string) => {
    const target = accounts.find(a => a.uid === uid);
    if (target) {
      setUser(target);
      localStorage.setItem(SESSION_KEY, target.uid);
    }
  };

  const updatePreferences = (prefs: Partial<UserPreferences>) => {
    if (user) {
      const updatedUser = { ...user, preferences: { ...user.preferences, ...prefs } };
      const updatedAccounts = accounts.map(a => a.uid === user.uid ? updatedUser : a);
      setUser(updatedUser);
      setAccounts(updatedAccounts);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedAccounts));
    }
  };

  const updateProfile = (data: { displayName?: string; theme?: 'light' | 'dark' }) => {
    if (user) {
      const updatedUser = { ...user, ...data };
      const updatedAccounts = accounts.map(a => a.uid === user.uid ? updatedUser : a);
      setUser(updatedUser);
      setAccounts(updatedAccounts);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedAccounts));
    }
  };

  const saveRecipe = (recipe: Recipe) => {
    const updated = [...savedRecipes, recipe];
    setSavedRecipes(updated);
    localStorage.setItem(RECIPE_KEY, JSON.stringify(updated));
  };

  const deleteRecipe = (id: string) => {
    const updated = savedRecipes.filter(r => r.id !== id);
    setSavedRecipes(updated);
    localStorage.setItem(RECIPE_KEY, JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider value={{ 
      user, accounts, loading, login, signup, logout, 
      switchAccount, updatePreferences, updateProfile, saveRecipe, deleteRecipe, savedRecipes 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
