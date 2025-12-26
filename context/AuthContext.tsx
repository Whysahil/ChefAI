
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserPreferences } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  updatePreferences: (prefs: Partial<UserPreferences>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const MOCK_USER: User = {
  uid: '12345',
  email: 'chef@example.com',
  displayName: 'Gourmet Chef',
  theme: 'light',
  savedRecipes: [],
  preferences: {
    diet: 'None',
    skillLevel: 'Intermediate',
    defaultServings: 2,
    favoriteCuisines: ['Italian', 'Mexican'],
    allergies: []
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate checking session
    const savedUser = localStorage.getItem('user_session');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string) => {
    const newUser = { ...MOCK_USER, email };
    setUser(newUser);
    localStorage.setItem('user_session', JSON.stringify(newUser));
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem('user_session');
  };

  const updatePreferences = (prefs: Partial<UserPreferences>) => {
    if (user) {
      const updatedUser = {
        ...user,
        preferences: { ...user.preferences, ...prefs }
      };
      setUser(updatedUser);
      localStorage.setItem('user_session', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updatePreferences }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
