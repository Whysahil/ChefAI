
export interface Ingredient {
  name: string;
  amount: string;
  unit: string;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  cuisine: string;
  mealType: string;
  dietaryNeeds: string[];
  prepTime: string;
  cookTime: string;
  servings: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  ingredients: Ingredient[];
  instructions: string[];
  tips: string[];
  nutrition: {
    calories: number;
    protein: string;
    carbs: string;
    fat: string;
  };
  servingSuggestions: string;
  substitutions: string[];
  imagePrompt: string;
  imageUrl?: string;
  createdAt: number;
}

export interface UserPreferences {
  diet: string;
  skillLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  defaultServings: number;
  favoriteCuisines: string[];
  allergies: string[];
}

export interface User {
  uid: string;
  email: string;
  displayName: string;
  preferences: UserPreferences;
  savedRecipes: string[];
  theme: 'light' | 'dark';
}
