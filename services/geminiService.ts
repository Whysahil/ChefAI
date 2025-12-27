
import { Recipe } from "../types";

async function callChefApi(action: string, payload: any = {}) {
  const response = await fetch('/api/chef', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, payload })
  });

  const data = await response.json();
  if (!response.ok) {
    const error = new Error(data.message || 'API_ERROR') as any;
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
  const prompt = `Synthesize a professional recipe. 
    MANDATORY DIETARY CONSTRAINT: ${params.diet || 'None'}. 
    USER SKILL: ${params.skill} level cook. 
    Ingredients available: ${params.ingredients?.join(', ') || 'General pantry staples'}. 
    Preferred Cuisine: ${params.cuisine}. 
    Meal Context: ${params.mealType}.
    Ensure the recipe strictly follows the ${params.diet} dietary requirements.`;

  const result = await callChefApi('generate', { 
    prompt, 
    ingredients: params.ingredients 
  });
  
  const recipeData = JSON.parse(result.text);
  
  return {
    ...recipeData,
    id: Math.random().toString(36).substring(2, 11),
    dietaryNeeds: params.diet ? [params.diet] : [],
    createdAt: Date.now()
  };
}

export async function generateRecipeImage(prompt: string): Promise<string> {
  try {
    const result = await callChefApi('image', { prompt: `Professional food photography of ${prompt}.` });
    return result.data ? `data:image/png;base64,${result.data}` : 'https://images.unsplash.com/photo-1495195134817-aeb325a55b65?auto=format&fit=crop&q=80&w=1200';
  } catch (err) {
    return 'https://images.unsplash.com/photo-1495195134817-aeb325a55b65?auto=format&fit=crop&q=80&w=1200';
  }
}

export function createChefChat(recipe: Recipe) {
  return {
    sendMessage: async (msg: { message: string }) => {
      const prompt = `Assistant for "${recipe.title}". User asks: ${msg.message}`;
      const result = await callChefApi('generate', { prompt });
      return { text: result.text };
    }
  };
}
