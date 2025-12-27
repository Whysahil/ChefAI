
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
 * Always creates a fresh instance to use the latest API key injected into the environment.
 */
const getAIInstance = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey || apiKey === 'undefined' || apiKey === '') {
    throw new Error("API_KEY_MISSING: Please select a valid API key from the system dialog.");
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
            { text: "List every food ingredient visible in this image. Return a simple comma-separated list of names only." },
            { inlineData: { mimeType: "image/jpeg", data: base64Image } }
          ]
        }
      ],
      config: {
        thinkingConfig: { thinkingBudget: 0 } // Disable thinking for vision for max speed/compat
      }
    });
    
    const text = response.text;
    if (!text) return [];
    return text.split(',').map(s => s.trim().toLowerCase()).filter(s => s.length > 0);
  } catch (err) {
    console.error("ChefAI Vision Analysis Failure:", err);
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
      // Flash model works best with 0 thinking budget for standard compatibility
      thinkingConfig: { thinkingBudget: modelName.includes('pro') ? 2000 : 0 }
    },
  });

  const text = response.text;
  if (!text) throw new Error("The synthesis engine returned an empty response.");

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
  const prompt = `Act as an elite Master Chef. Synthesize a professional, accurate recipe.
    - INGREDIENTS TO USE: ${params.ingredients?.join(', ') || 'Standard pantry'}
    - CUISINE STYLE: ${params.cuisine}
    - MEAL CATEGORY: ${params.mealType}
    - DIETARY NEEDS: ${params.diet}
    - DIFFICULTY: ${params.skill}
    - VIBE: ${params.cookingPreference}
    - SPICE: ${params.spiceLevel}
    
    Ensure nutritional values are calculated accurately for the servings specified.`;

  try {
    // Primary attempt with Flash (faster, high reliability)
    return await attemptRecipeGeneration('gemini-3-flash-preview', prompt);
  } catch (err) {
    console.warn("ChefAI: Primary synthesis interrupted. Attempting high-precision fallback...", err);
    try {
      // Pro fallback for more complex reasoning if the first one failed
      return await attemptRecipeGeneration('gemini-3-pro-preview', prompt);
    } catch (fallbackErr) {
      console.error("ChefAI: Final synthesis failure.", fallbackErr);
      throw fallbackErr;
    }
  }
}

export async function generateRecipeImage(prompt: string): Promise<string> {
  try {
    const ai = getAIInstance();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: `Professional food photography of ${prompt}. Macro detail, cinematic natural lighting, 4k.` }]
      },
      config: {
        imageConfig: { aspectRatio: "16:9" }
      }
    });

    const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
    if (part?.inlineData?.data) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
    throw new Error("No visual data found.");
  } catch (err) {
    console.warn("ChefAI: Visual synthesis skipped.", err);
    return 'https://images.unsplash.com/photo-1495195134817-aeb325a55b65?auto=format&fit=crop&q=80&w=1200';
  }
}

export function createChefChat(recipe: Recipe) {
  const ai = getAIInstance();
  const systemInstruction = `You are a professional culinary assistant for "${recipe.title}". Provide brief, technical expert advice on techniques or substitutions.`;
  return ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: { systemInstruction }
  });
}
