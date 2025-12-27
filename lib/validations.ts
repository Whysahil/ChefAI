
import { z } from 'zod';

export const IngredientSchema = z.object({
  name: z.string().min(1, "Ingredient name cannot be empty"),
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
  title: z.string().min(1, "Recipe title is required"),
  description: z.string().min(1, "Recipe description is required").default("A delicious AI-curated culinary masterpiece."),
  cuisine: z.string().min(1).default("Global Fusion"),
  mealType: z.string().min(1).default("Main Course"),
  prepTime: z.string().default("15 mins"),
  cookTime: z.string().default("30 mins"),
  servings: z.number().int().positive().default(2),
  difficulty: z.enum(['Beginner', 'Intermediate', 'Advanced']).default('Intermediate'),
  ingredients: z.array(IngredientSchema).min(1, "At least one ingredient is required"),
  instructions: z.array(z.string().min(1)).min(1, "Instructions are required"),
  tips: z.array(z.string()).default([]),
  substitutions: z.array(z.string()).default([]),
  servingSuggestions: z.string().default("Serve hot and enjoy!"),
  nutrition: NutritionSchema.default({
    calories: 0,
    protein: "0g",
    carbs: "0g",
    fat: "0g",
  }),
  imagePrompt: z.string().min(10, "Image prompt is too short for quality generation"),
});

export type ValidatedRecipe = z.infer<typeof RecipeSchema>;

/**
 * Normalizes and validates raw JSON from AI.
 * If validation fails, it throws a descriptive error to prevent corrupted data from entering the application state.
 */
export function validateAndNormalizeRecipe(rawData: unknown): ValidatedRecipe {
  // First, ensure we have an object
  if (typeof rawData !== 'object' || rawData === null) {
    throw new Error("AI response is not a valid object.");
  }

  const result = RecipeSchema.safeParse(rawData);
  
  if (!result.success) {
    const errorMessages = result.error.issues.map(e => {
      const path = e.path.join('.');
      return `${path ? path + ': ' : ''}${e.message}`;
    }).join(' | ');
    
    console.error("AI Data Validation Failed:", errorMessages);
    throw new Error(`Data Integrity Error: ${errorMessages}`);
  }
  
  return result.data;
}
