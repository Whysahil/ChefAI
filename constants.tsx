
import React from 'react';
import { ChefHat, Utensils, Timer, BookOpen, Flame, Heart, Settings, Layout, Search, Star, Coffee, Sun, Moon, UtensilsCrossed, Zap, Thermometer, Globe } from 'lucide-react';

export const DIETS = [
  'None', 'Vegetarian', 'Vegan', 'Eggitarian', 'Non-vegetarian', 'Gluten-Free', 'Dairy-Free', 'Keto', 'Low-Carb', 'High-Protein', 'Diabetic-Friendly'
];

export const SKILL_LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

export const SPICE_LEVELS = ['Mild', 'Medium', 'Spicy'];

export const COOKING_PREFERENCES = [
  'Quick (under 20m)', 'Home-style', 'Restaurant-style', 'One-pot meal', 'Healthy / light'
];

export const CUISINES = [
  'North Indian', 'South Indian', 'Punjabi', 'Gujarati', 'Bengali', 'Maharashtrian',
  'Italian', 'Chinese', 'Japanese', 'Korean', 'Thai', 'Mexican', 'American', 'French', 'Spanish',
  'Greek', 'Turkish', 'Middle Eastern', 'Lebanese', 'Moroccan', 'Vietnamese'
];

export const MEAL_TYPES = [
  { name: 'Breakfast', icon: <Coffee size={16} /> },
  { name: 'Brunch', icon: <Sun size={16} /> },
  { name: 'Lunch', icon: <Utensils size={16} /> },
  { name: 'Evening Snack', icon: <UtensilsCrossed size={16} /> },
  { name: 'Dinner', icon: <Moon size={16} /> },
  { name: 'Late-night meal', icon: <Flame size={16} /> },
  { name: 'Kids meal', icon: <Heart size={16} /> },
  { name: 'Party / Occasion', icon: <Star size={16} /> }
];

export const INGREDIENT_CATEGORIES = [
  { name: 'Vegetables', items: ['onion', 'tomato', 'potato', 'carrot', 'spinach', 'bell pepper', 'mushroom', 'cauliflower', 'okra', 'brinjal'] },
  { name: 'Proteins', items: ['chicken', 'eggs', 'fish', 'shrimp', 'paneer', 'tofu', 'chana', 'dal', 'kidney beans'] },
  { name: 'Grains & Staples', items: ['rice', 'atta', 'maida', 'basmati', 'poha', 'bread', 'pasta', 'quinoa'] },
  { name: 'Dairy', items: ['milk', 'curd', 'ghee', 'butter', 'cheese', 'cream'] },
  { name: 'Spices & Herbs', items: ['salt', 'haldi', 'jeera', 'garlic', 'ginger', 'chili', 'dhaniya', 'kadipatta', 'basil', 'oregano'] },
  { name: 'Oils & Sauces', items: ['mustard oil', 'sunflower oil', 'olive oil', 'soy sauce', 'vinegar', 'ketchup'] }
];

export const NAVIGATION_ITEMS = [
  { name: 'Dashboard', path: '/', icon: <Layout size={20} /> },
  { name: 'Chef Studio', path: '/studio', icon: <ChefHat size={20} /> },
  { name: 'My Cookbook', path: '/cookbook', icon: <BookOpen size={20} /> },
  { name: 'Favorites', path: '/favorites', icon: <Star size={20} /> },
  { name: 'Settings', path: '/settings', icon: <Settings size={20} /> },
];

export const APP_NAME = "ChefAI";
