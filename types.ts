
export interface Ingredient {
  name: string;
  amount: string;
  unit: string;
}

export interface Nutrition {
  calories: number;
  protein: string;
  carbs: string;
  fat: string;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  cuisine: string;
  mealType: string;
  prepTime: string;
  cookTime: string;
  servings: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  ingredients: Ingredient[];
  instructions: string[];
  tips: string[];
  nutrition: Nutrition;
  imagePrompt: string;
  imageUrl?: string;
  createdAt: number;
  // Added dietaryNeeds to match usage in Studio and geminiService
  dietaryNeeds: string[];
}

// Added UserPreferences to resolve AuthContext errors and support settings
export interface UserPreferences {
  diet: string;
  skillLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  favoriteCuisines: string[];
  allergies: string[];
  defaultServings: number;
}

// Added User interface to resolve AuthContext errors and unify auth state
export interface User {
  uid: string;
  displayName: string;
  email: string;
  preferences: UserPreferences;
}

export type ViewState = 'studio' | 'cookbook';
