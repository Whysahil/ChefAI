
import { z } from 'zod';

export const IngredientSchema = z.object({
  name: z.string().min(1, "Ingredient name cannot be empty"),
  amount: z.string().default("to taste"),
  unit: z.string().default("units"),
});

export const RecipeSchema = z.object({
  title: z.string().min(1, "Recipe title is required"),
  description: z.string().default("A delicious AI-curated culinary masterpiece."),
  cuisine: z.string().default("Global Fusion"),
  mealType: z.string().default("Main Course"),
  prepTime: z.string().default("15 mins"),
  cookTime: z.string().default("30 mins"),
  servings: z.number().int().positive().default(2),
  difficulty: z.enum(['Beginner', 'Intermediate', 'Advanced']).default('Intermediate'),
  ingredients: z.array(IngredientSchema).min(1, "At least one ingredient is required"),
  instructions: z.array(z.string().min(1)).min(1, "Instructions are required"),
  tips: z.array(z.string()).default([]),
  substitutions: z.array(z.string()).default([]),
  servingSuggestions: z.string().default("Serve hot and enjoy!"),
  nutrition: z.object({
    calories: z.number().default(0),
    protein: z.string().default("0g"),
    carbs: z.string().default("0g"),
    fat: z.string().default("0g"),
  }).default({
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
 * If validation fails, it throws a descriptive error.
 */
export function validateAndNormalizeRecipe(rawData: unknown): ValidatedRecipe {
  const result = RecipeSchema.safeParse(rawData);
  if (!result.success) {
    // Fix: Changed .errors to .issues as ZodError uses issues property
    const errorMessages = result.error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
    console.error("Recipe Validation Failed:", errorMessages, rawData);
    throw new Error(`Invalid Recipe Schema: ${errorMessages}`);
  }
  return result.data;
}
