
import { Recipe } from "../types";

async function callChefApi(action: string, payload: any = {}) {
  const response = await fetch('/api/chef', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, payload })
  });

  const data = await response.json();
  if (!response.ok) {
    const error = new Error(data.message || 'Culinary API error') as any;
    error.status = data.status || 'error';
    error.error = data.error;
    throw error;
  }
  return data;
}

export async function checkServerHealth(): Promise<'healthy' | 'unconfigured'> {
  try {
    const result = await callChefApi('health');
    return result.status;
  } catch (err) {
    return 'unconfigured';
  }
}

export async function analyzeIngredients(base64Image: string): Promise<string[]> {
  const result = await callChefApi('analyze', { image: base64Image });
  return result.text ? result.text.split(',').map((s: string) => s.trim().toLowerCase()).filter((s: string) => s.length > 0) : [];
}

export async function generateRecipe(params: {
  ingredients?: string[],
  diet?: string,
  cuisine?: string,
  mealType?: string,
  skill?: string
}): Promise<Recipe> {
  const prompt = `Synthesize professional recipe. 
    DIET: ${params.diet || 'Standard'}. 
    SKILL: ${params.skill}. 
    INGREDIENTS: ${params.ingredients?.join(', ') || 'Pantry staples'}. 
    CUISINE: ${params.cuisine}. 
    MEAL: ${params.mealType}.`;

  const result = await callChefApi('generate', { 
    prompt, 
    ingredients: params.ingredients 
  });
  
  try {
    const recipeData = JSON.parse(result.text);
    return {
      ...recipeData,
      id: Math.random().toString(36).substring(2, 11),
      dietaryNeeds: params.diet ? [params.diet] : [],
      createdAt: Date.now()
    };
  } catch (parseError) {
    console.error("Schema Mismatch:", result.text);
    throw new Error("AI returned an invalid recipe format. Please try again.");
  }
}

export async function generateRecipeImage(prompt: string): Promise<string> {
  try {
    const result = await callChefApi('image', { prompt: `Professional food photography, cinematic lighting, ${prompt}` });
    return result.data ? `data:image/png;base64,${result.data}` : 'https://images.unsplash.com/photo-1495195134817-aeb325a55b65?auto=format&fit=crop&q=80&w=1200';
  } catch (err) {
    return 'https://images.unsplash.com/photo-1495195134817-aeb325a55b65?auto=format&fit=crop&q=80&w=1200';
  }
}

export function createChefChat(recipe: Recipe) {
  return {
    sendMessage: async (msg: { message: string }) => {
      const prompt = `Chat context: Recipe "${recipe.title}". Instructions: ${recipe.instructions.join('. ')}. User query: ${msg.message}. Respond concisely as a master chef.`;
      const result = await callChefApi('generate', { prompt, ingredients: recipe.ingredients.map(i => i.name) });
      return { text: result.text };
    }
  };
}
