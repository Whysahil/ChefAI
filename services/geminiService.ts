
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

const getAIInstance = () => {
  const apiKey = process.env.API_KEY;
  return new GoogleGenAI({ apiKey: apiKey || '' });
};

export async function analyzeIngredients(base64Image: string): Promise<string[]> {
  try {
    const ai = getAIInstance();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        {
          parts: [
            { text: "List food ingredients visible in this image. Return a comma-separated list." },
            { inlineData: { mimeType: "image/jpeg", data: base64Image } }
          ]
        }
      ],
      config: { thinkingConfig: { thinkingBudget: 0 } }
    });
    
    const text = response.text;
    if (!text) return [];
    return text.split(',').map(s => s.trim().toLowerCase()).filter(s => s.length > 0);
  } catch (err) {
    console.error("ChefAI Vision Failure:", err);
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
      thinkingConfig: { thinkingBudget: modelName.includes('pro') ? 2000 : 0 }
    },
  });

  const text = response.text;
  if (!text) throw new Error("Empty response from AI service.");

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
  const prompt = `Synthesize a professional recipe. 
    Ingredients: ${params.ingredients?.join(', ') || 'Pantry basics'}
    Style: ${params.cuisine}
    Diet: ${params.diet}`;

  try {
    return await attemptRecipeGeneration('gemini-3-flash-preview', prompt);
  } catch (err) {
    console.warn("Retrying with high-precision model...");
    return await attemptRecipeGeneration('gemini-3-pro-preview', prompt);
  }
}

export async function generateRecipeImage(prompt: string): Promise<string> {
  try {
    const ai = getAIInstance();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: `Professional food photography: ${prompt}` }]
      },
      config: { imageConfig: { aspectRatio: "16:9" } }
    });

    const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
    return part?.inlineData?.data ? `data:image/png;base64,${part.inlineData.data}` : '';
  } catch (err) {
    return 'https://images.unsplash.com/photo-1495195134817-aeb325a55b65?auto=format&fit=crop&q=80&w=1200';
  }
}

export function createChefChat(recipe: Recipe) {
  const ai = getAIInstance();
  return ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: { systemInstruction: `Expert culinary assistant for "${recipe.title}".` }
  });
}
