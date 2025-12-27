
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
  if (!apiKey) {
    throw new Error("API Key is missing. Please ensure your environment is configured correctly.");
  }
  return new GoogleGenAI({ apiKey });
};

export async function analyzeIngredients(base64Image: string): Promise<string[]> {
  const ai = getAIInstance();
  const prompt = "List every food ingredient visible in this image. Return as a comma-separated list of names only.";
  
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
  
  // Calibrated for stability and reasoning
  const response = await ai.models.generateContent({
    model: modelName,
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    config: {
      responseMimeType: "application/json",
      responseSchema: recipeSchema,
      maxOutputTokens: 12000, // Ample space for reasoning + JSON
      thinkingConfig: { thinkingBudget: 2000 } // Modest reasoning budget for reliability
    },
  });

  const text = response.text;
  if (!text) throw new Error("The synthesis engine returned an empty response.");

  // Clean JSON string just in case markdown wrappers are present
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
  const prompt = `Generate a professional, high-quality culinary recipe based on these parameters:
    - PANTRY: ${params.ingredients?.join(', ') || 'General pantry staples'}
    - CUISINE: ${params.cuisine || 'International Fusion'}
    - MEAL TYPE: ${params.mealType || 'Main Course'}
    - DIET: ${params.diet || 'None'}
    - SPICE: ${params.spiceLevel || 'Medium'}
    - STYLE: ${params.cookingPreference || 'Gourmet'}
    - SKILL: ${params.skill || 'Intermediate'}
    
    Ensure the recipe is creative, uses the provided ingredients effectively, and includes nutritional estimates.`;

  try {
    // We use gemini-3-flash-preview as the primary for higher uptime and speed
    const recipe = await attemptRecipeGeneration('gemini-3-flash-preview', prompt);
    if (params.diet && params.diet !== 'None') {
      recipe.dietaryNeeds = [params.diet];
    }
    return recipe;
  } catch (err) {
    console.warn("Primary synthesis pathway failed. Retrying with alternative logic...", err);
    // Secondary attempt with Pro model if Flash fails (rare, but good for redundancy)
    try {
      const recipe = await attemptRecipeGeneration('gemini-3-pro-preview', prompt);
      if (params.diet && params.diet !== 'None') recipe.dietaryNeeds = [params.diet];
      return recipe;
    } catch (fallbackErr) {
      console.error("All ChefAI synthesis pathways exhausted.", fallbackErr);
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
        parts: [{ text: `Professional studio food photography of ${prompt}. Natural side lighting, shallow depth of field, high resolution, neutralized tones.` }]
      },
      config: {
        imageConfig: { aspectRatio: "16:9" }
      }
    });

    const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
    if (part?.inlineData?.data) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
    throw new Error("No visual data generated.");
  } catch (err) {
    console.warn("Visual synthesis failed. Using placeholder asset.", err);
    return 'https://images.unsplash.com/photo-1495195134817-aeb325a55b65?auto=format&fit=crop&q=80&w=1200';
  }
}

export function createChefChat(recipe: Recipe) {
  const ai = getAIInstance();
  const systemInstruction = `You are a professional culinary consultant assisting with the recipe: "${recipe.title}". 
    Reference these ingredients: ${recipe.ingredients.map(i => i.name).join(', ')}. 
    Provide concise, expert advice on substitutions, techniques, and troubleshooting.`;
    
  return ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: { systemInstruction }
  });
}
