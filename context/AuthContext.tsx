
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserPreferences, Recipe } from '../types';
import { ChefApiService } from '../services/ChefApiService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string) => Promise<void>;
  signup: (name: string, email: string) => Promise<void>;
  logout: () => Promise<void>;
  saveRecipe: (recipe: Recipe) => Promise<void>;
  // Fix: Added missing deleteRecipe to context type
  deleteRecipe: (id: string) => Promise<void>;
  savedRecipes: Recipe[];
  // Fix: Added missing accounts to context type
  accounts: User[];
  // Fix: Added missing switchAccount to context type
  switchAccount: (uid: string) => Promise<void>;
  // Fix: Added missing updatePreferences to context type
  updatePreferences: (prefs: Partial<UserPreferences>) => Promise<void>;
  // Fix: Added missing updateProfile to context type
  updateProfile: (profile: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  // Fix: Added accounts state to manage multiple user identities
  const [accounts, setAccounts] = useState<User[]>([]);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('chef_ai_token');
      const savedAccounts = localStorage.getItem('chef_ai_accounts');
      
      if (savedAccounts) {
        setAccounts(JSON.parse(savedAccounts));
      }

      if (token) {
        try {
          const res = await ChefApiService.getMe();
          if (res.status === 'success') {
            setUser(res.user);
            const favs = await ChefApiService.getFavorites();
            if (favs.status === 'success') setSavedRecipes(favs.favorites || []);
          } else {
            localStorage.removeItem('chef_ai_token');
          }
        } catch (e) {
          console.error("Auth failed", e);
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  // Sync accounts to local storage
  useEffect(() => {
    if (accounts.length > 0) {
      localStorage.setItem('chef_ai_accounts', JSON.stringify(accounts));
    }
  }, [accounts]);

  const login = async (email: string) => {
    const res = await ChefApiService.login(email);
    if (res.status === 'success') {
      setUser(res.user);
      localStorage.setItem('chef_ai_token', res.token);
      // Update accounts list
      setAccounts(prev => {
        const filtered = prev.filter(a => a.uid !== res.user.uid);
        return [...filtered, res.user];
      });
    } else {
      throw new Error(res.message);
    }
  };

  const signup = async (name: string, email: string) => {
    const res = await ChefApiService.register(name, email);
    if (res.status === 'success') {
      setUser(res.user);
      localStorage.setItem('chef_ai_token', res.token);
      // Update accounts list
      setAccounts(prev => {
        const filtered = prev.filter(a => a.uid !== res.user.uid);
        return [...filtered, res.user];
      });
    } else {
      throw new Error(res.message);
    }
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem('chef_ai_token');
  };

  // Fix: Implementation for switching between accounts
  const switchAccount = async (uid: string) => {
    const account = accounts.find(a => a.uid === uid);
    if (account) {
      setUser(account);
      // In a real app, you would swap tokens here.
      localStorage.setItem('chef_ai_token', btoa(JSON.stringify(account)));
      const favs = await ChefApiService.getFavorites();
      if (favs.status === 'success') setSavedRecipes(favs.favorites || []);
    }
  };

  const saveRecipe = async (recipe: Recipe) => {
    try {
      const res = await ChefApiService.saveFavorite(recipe);
      if (res.status === 'success') {
        setSavedRecipes(prev => [...prev, recipe]);
      }
    } catch (e) {
      console.error("Save failed", e);
    }
  };

  // Fix: Implementation for deleting recipes
  const deleteRecipe = async (id: string) => {
    try {
      // Logic would typically involve an API call here.
      setSavedRecipes(prev => prev.filter(r => r.id !== id));
    } catch (e) {
      console.error("Delete failed", e);
    }
  };

  // Fix: Implementation for updating user preferences
  const updatePreferences = async (prefs: Partial<UserPreferences>) => {
    if (user) {
      const newUser = { ...user, preferences: { ...user.preferences, ...prefs } };
      setUser(newUser);
      setAccounts(prev => prev.map(a => a.uid === newUser.uid ? newUser : a));
    }
  };

  // Fix: Implementation for updating user profile
  const updateProfile = async (profile: Partial<User>) => {
    if (user) {
      const newUser = { ...user, ...profile };
      setUser(newUser);
      setAccounts(prev => prev.map(a => a.uid === newUser.uid ? newUser : a));
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      signup, 
      logout, 
      saveRecipe, 
      deleteRecipe, 
      savedRecipes, 
      accounts, 
      switchAccount, 
      updatePreferences, 
      updateProfile 
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
