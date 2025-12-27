
import { z } from 'zod';

export const IngredientSchema = z.object({
  name: z.string().min(1),
  amount: z.string().default("to taste"),
  unit: z.string().default("units"),
});

export const NutritionSchema = z.object({
  calories: z.number().nonnegative().default(0),
  protein: z.string().default("0g"),
  carbs: z.string().default("0g"),
  fat: z.string().default("0g"),
});

export const RecipeSchema = z.object({
  title: z.string().min(1),
  description: z.string().default("AI-synthesized gourmet protocol."),
  cuisine: z.string().default("Fusion"),
  mealType: z.string().default("Main"),
  prepTime: z.string().default("15m"),
  cookTime: z.string().default("20m"),
  servings: z.number().positive().default(2),
  difficulty: z.enum(['Beginner', 'Intermediate', 'Advanced']).default('Intermediate'),
  ingredients: z.array(IngredientSchema).min(1),
  instructions: z.array(z.string().min(1)).min(1),
  tips: z.array(z.string()).default([]),
  nutrition: NutritionSchema.default({ calories: 0, protein: "0g", carbs: "0g", fat: "0g" }),
  imagePrompt: z.string().min(10),
  // Added dietaryNeeds to match Recipe interface in types.ts
  dietaryNeeds: z.array(z.string()).default([]),
});

export function parseAIRecipe(raw: unknown) {
  const result = RecipeSchema.safeParse(raw);
  if (!result.success) {
    throw new Error(`Data Integrity Breach: ${result.error.issues.map(i => i.message).join(', ')}`);
  }
  return result.data;
}
