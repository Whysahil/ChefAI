
import { Recipe } from "../types";

async function callChefApi(action: string, payload: any) {
  const response = await fetch('/api/chef', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, payload })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'API_ERROR');
  }
  return data;
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
  const prompt = `Synthesize a professional recipe for a ${params.skill} level cook. 
    Ingredients: ${params.ingredients?.join(', ') || 'General pantry staples'}. 
    Cuisine: ${params.cuisine}. 
    Diet: ${params.diet}.`;

  const result = await callChefApi('generate', { prompt });
  const recipeData = JSON.parse(result.text);
  
  return {
    ...recipeData,
    id: Math.random().toString(36).substring(2, 11),
    dietaryNeeds: [],
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

// Note: createChefChat for real-time streaming would require an Edge Function with WebSockets, 
// for this implementation we will handle simple chat via the same synthesis endpoint if needed.
export function createChefChat(recipe: Recipe) {
  // Placeholder implementation for chat via API proxy
  return {
    sendMessage: async (msg: { message: string }) => {
      const prompt = `Assistant for "${recipe.title}". User asks: ${msg.message}`;
      const result = await callChefApi('generate', { prompt }); // Simplified for demo
      return { text: result.text };
    }
  };
}
