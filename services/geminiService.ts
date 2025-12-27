
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
 * Robust AI Instance factory.
 * Adheres to @google/genai guidelines while providing runtime validation.
 */
const getAIInstance = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey || apiKey === 'undefined' || apiKey === '') {
    throw new Error("API_KEY_MISSING");
  }
  return new GoogleGenAI({ apiKey });
};

export async function analyzeIngredients(base64Image: string): Promise<string[]> {
  try {
    const ai = getAIInstance();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        {
          parts: [
            { text: "Identify the food ingredients in this image. Provide a comma-separated list." },
            { inlineData: { mimeType: "image/jpeg", data: base64Image } }
          ]
        }
      ],
      config: { thinkingConfig: { thinkingBudget: 0 } }
    });
    
    const text = response.text;
    if (!text) return [];
    return text.split(',').map(s => s.trim().toLowerCase()).filter(s => s.length > 0);
  } catch (err: any) {
    console.error("ChefAI Vision Error:", err);
    throw err;
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
      // Disable thinking for Flash to avoid capacity errors on base keys
      thinkingConfig: { thinkingBudget: modelName.includes('pro') ? 2000 : 0 }
    },
  });

  const text = response.text;
  if (!text) throw new Error("Synthesis failed to produce content.");

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
  const prompt = `Synthesize a professional recipe for a ${params.skill} level cook.
    Ingredients provided: ${params.ingredients?.join(', ') || 'General pantry staples'}.
    Cuisine target: ${params.cuisine}.
    Dietary preferences: ${params.diet}.`;

  try {
    return await attemptRecipeGeneration('gemini-3-flash-preview', prompt);
  } catch (err: any) {
    if (err.message === "API_KEY_MISSING") throw err;
    console.warn("ChefAI: Switching to high-precision reasoning fallback...");
    return await attemptRecipeGeneration('gemini-3-pro-preview', prompt);
  }
}

export async function generateRecipeImage(prompt: string): Promise<string> {
  try {
    const ai = getAIInstance();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: `Professional gourmet food photography of ${prompt}. Cinematic lighting, macro detail.` }]
      },
      config: { imageConfig: { aspectRatio: "16:9" } }
    });

    const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
    return part?.inlineData?.data ? `data:image/png;base64,${part.inlineData.data}` : '';
  } catch (err) {
    console.warn("ChefAI: Visual synthesis omitted due to key restrictions.");
    return 'https://images.unsplash.com/photo-1495195134817-aeb325a55b65?auto=format&fit=crop&q=80&w=1200';
  }
}

export function createChefChat(recipe: Recipe) {
  const ai = getAIInstance();
  return ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: { systemInstruction: `You are the ChefAI assistant for "${recipe.title}". Provide expert culinary guidance.` }
  });
}
