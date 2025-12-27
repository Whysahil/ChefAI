
import { GoogleGenAI, Type } from "@google/genai";
import { Recipe } from "../types";

const recipeSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    description: { type: Type.STRING },
    cuisine: { type: Type.STRING },
    mealType: { type: Type.STRING },
    prepTime: { type: Type.STRING },
    cookTime: { type: Type.STRING },
    servings: { type: Type.NUMBER },
    difficulty: { type: Type.STRING },
    ingredients: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          amount: { type: Type.STRING },
          unit: { type: Type.STRING }
        },
        required: ["name", "amount", "unit"]
      }
    },
    instructions: {
      type: Type.ARRAY,
      items: { type: Type.STRING }
    },
    tips: {
      type: Type.ARRAY,
      items: { type: Type.STRING }
    },
    nutrition: {
      type: Type.OBJECT,
      properties: {
        calories: { type: Type.NUMBER },
        protein: { type: Type.STRING },
        carbs: { type: Type.STRING },
        fat: { type: Type.STRING }
      },
      required: ["calories", "protein", "carbs", "fat"]
    },
    servingSuggestions: { type: Type.STRING },
    substitutions: {
      type: Type.ARRAY,
      items: { type: Type.STRING }
    },
    imagePrompt: { type: Type.STRING }
  },
  required: [
    "title", "description", "mealType", "prepTime", "cookTime", 
    "ingredients", "instructions", "nutrition", "imagePrompt", 
    "servingSuggestions", "servings", "difficulty"
  ]
};

/**
 * Crucial: Always returns a new instance to pick up the most current API key
 * from the environment dialog.
 */
const getAIInstance = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey || apiKey === 'undefined') {
    throw new Error("API Key selection missing. Please select a key in the system dialog.");
  }
  return new GoogleGenAI({ apiKey });
};

export async function analyzeIngredients(base64Image: string): Promise<string[]> {
  const ai = getAIInstance();
  const prompt = "Identify food ingredients in this image. Return a comma-separated list of names.";
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        {
          parts: [
            { text: prompt },
            { inlineData: { mimeType: "image/jpeg", data: base64Image } }
          ]
        }
      ]
    });
    
    const text = response.text;
    if (!text) return [];
    return text.split(',').map(s => s.trim().toLowerCase()).filter(s => s.length > 0);
  } catch (err) {
    console.error("ChefAI Vision Analysis Failure:", err);
    return [];
  }
}

async function attemptRecipeGeneration(modelName: string, prompt: string): Promise<Recipe> {
  const ai = getAIInstance();
  
  const response = await ai.models.generateContent({
    model: modelName,
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    config: {
      responseMimeType: "application/json",
      responseSchema: recipeSchema,
      maxOutputTokens: 10000,
      // Disable thinking for Flash to avoid key capability errors, only use for Pro
      thinkingConfig: { thinkingBudget: modelName.includes('pro') ? 4000 : 0 }
    },
  });

  const text = response.text;
  if (!text) throw new Error("Empty response from AI engine.");

  const cleanJson = text.replace(/^[^{]*({.*})[^}]*$/s, '$1').trim();
  const recipeData = JSON.parse(cleanJson);
  
  return {
    ...recipeData,
    id: Math.random().toString(36).substring(2, 11),
    dietaryNeeds: [],
    createdAt: Date.now()
  };
}

export async function generateRecipe(params: {
  ingredients?: string[],
  diet?: string,
  cuisine?: string,
  mealType?: string,
  skill?: string,
  spiceLevel?: string,
  cookingPreference?: string
}): Promise<Recipe> {
  const prompt = `Synthesize a professional recipe based on these parameters:
    Pantry: ${params.ingredients?.join(', ') || 'General'}
    Cuisine: ${params.cuisine}
    Meal: ${params.mealType}
    Dietary Constraint: ${params.diet}
    Experience Level: ${params.skill}
    Ensure complex nutritional accuracy.`;

  try {
    const recipe = await attemptRecipeGeneration('gemini-3-flash-preview', prompt);
    if (params.diet && params.diet !== 'None') recipe.dietaryNeeds = [params.diet];
    return recipe;
  } catch (err) {
    console.warn("ChefAI: Primary synthesis failed, attempting alternative route.", err);
    try {
      // Pro fallback for more complex instructions
      const recipe = await attemptRecipeGeneration('gemini-3-pro-preview', prompt);
      if (params.diet && params.diet !== 'None') recipe.dietaryNeeds = [params.diet];
      return recipe;
    } catch (fallbackErr) {
      console.error("ChefAI: All synthesis pathways exhausted.", fallbackErr);
      throw fallbackErr;
    }
  }
}

export async function generateRecipeImage(prompt: string): Promise<string> {
  const ai = getAIInstance();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: `Gourmet food photography: ${prompt}. Cinematic lighting.` }]
      },
      config: {
        imageConfig: { aspectRatio: "16:9" }
      }
    });

    const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
    if (part?.inlineData?.data) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
    throw new Error("No visual synthesis.");
  } catch (err) {
    return 'https://images.unsplash.com/photo-1495195134817-aeb325a55b65?auto=format&fit=crop&q=80&w=1200';
  }
}

export function createChefChat(recipe: Recipe) {
  const ai = getAIInstance();
  const systemInstruction = `You are a ChefAI assistant for "${recipe.title}". Provide brief, technical culinary advice.`;
  return ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: { systemInstruction }
  });
}
