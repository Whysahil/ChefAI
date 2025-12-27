
import { z } from 'zod';

export const IngredientSchema = z.object({
  name: z.string().trim().min(1, "Ingredient name cannot be empty"),
  amount: z.string().trim().default("to taste"),
  unit: z.string().trim().default("units"),
});

export const NutritionSchema = z.object({
  calories: z.number().nonnegative().default(0),
  protein: z.string().trim().default("0g"),
  carbs: z.string().trim().default("0g"),
  fat: z.string().trim().default("0g"),
});

export const RecipeSchema = z.object({
  title: z.string().trim().min(1, "Recipe title is required"),
  description: z.string().trim().min(1, "Recipe description is required").default("A professional AI-curated culinary protocol."),
  cuisine: z.string().trim().min(1).default("Global Fusion"),
  mealType: z.string().trim().min(1).default("Main Course"),
  prepTime: z.string().trim().default("15 mins"),
  cookTime: z.string().trim().default("30 mins"),
  servings: z.number().int().positive().default(2),
  difficulty: z.enum(['Beginner', 'Intermediate', 'Advanced']).default('Intermediate'),
  ingredients: z.array(IngredientSchema).min(1, "The recipe must contain at least one ingredient"),
  instructions: z.array(z.string().trim().min(1)).min(1, "Detailed execution steps are required"),
  tips: z.array(z.string().trim()).default([]),
  substitutions: z.array(z.string().trim()).default([]),
  servingSuggestions: z.string().trim().default("Serve immediately while hot."),
  nutrition: NutritionSchema.default({
    calories: 0,
    protein: "0g",
    carbs: "0g",
    fat: "0g",
  }),
  imagePrompt: z.string().trim().min(10, "A descriptive image prompt is required for visual synthesis"),
});

export type ValidatedRecipe = z.infer<typeof RecipeSchema>;

/**
 * Normalizes and validates raw JSON from AI using a 3-layer approach:
 * 1. Object structure check
 * 2. Zod Schema Validation (safeParse)
 * 3. Default Normalization
 * 
 * Throws a specific "Data Integrity" error if validation fails.
 */
export function validateAndNormalizeRecipe(rawData: unknown): ValidatedRecipe {
  if (typeof rawData !== 'object' || rawData === null) {
    throw new Error("Data Integrity Error: AI output is not a valid object.");
  }

  const result = RecipeSchema.safeParse(rawData);
  
  if (!result.success) {
    const errorDetails = result.error.issues.map(e => {
      const field = e.path.join('.') || 'root';
      return `${field}: ${e.message}`;
    }).join('; ');
    
    console.error("AI Response Validation Failed:", errorDetails);
    throw new Error(`Data Integrity Error: ${errorDetails}`);
  }
  
  // Zod's .data property contains the normalized object with defaults applied
  return result.data;
}
