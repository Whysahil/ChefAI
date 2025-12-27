
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
    console.warn("ChefAI: API_KEY is missing from environment variables.");
  }
  return new GoogleGenAI({ apiKey: apiKey || '' });
};

export async function analyzeIngredients(base64Image: string): Promise<string[]> {
  const ai = getAIInstance();
  const prompt = "Identify all the food ingredients visible in this image. Return a simple comma-separated list of the names only.";
  
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
      ],
      config: {
        thinkingConfig: { thinkingBudget: 0 }
      }
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
      maxOutputTokens: 8192,
      thinkingConfig: { thinkingBudget: modelName.includes('pro') ? 4000 : 0 }
    },
  });

  const text = response.text;
  if (!text) throw new Error(`Empty response from model ${modelName}`);

  // Clean potentially markdown-wrapped JSON
  const cleanJson = text.replace(/^[^{]*({.*})[^}]*$/s, '$1').trim();
  const recipeData = JSON.parse(cleanJson);
  
  return {
    ...recipeData,
    id: Math.random().toString(36).substring(2, 11),
    dietaryNeeds: [], // Populated by caller if needed
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
  const prompt = `You are ChefAI, an elite culinary intelligence.
    TASK: Generate a professional recipe.
    
    USER PARAMETERS:
    - Pantry: ${params.ingredients?.join(', ') || 'Any available'}
    - Meal: ${params.mealType || 'Dinner'}
    - Diet: ${params.diet || 'None'}
    - Cuisine Focus: ${params.cuisine || 'International'}
    - Spice Level: ${params.spiceLevel || 'Medium'}
    - Style: ${params.cookingPreference || 'Home-style'}
    - Difficulty: ${params.skill || 'Intermediate'}
    
    REQUIREMENTS:
    - Use provided ingredients as the base.
    - Provide exact, actionable measurements.
    - instructions must be a numbered list of steps.
    - imagePrompt should describe a professional food photo.`;

  try {
    // Primary attempt with Pro model
    const recipe = await attemptRecipeGeneration('gemini-3-pro-preview', prompt);
    if (params.diet && params.diet !== 'None') recipe.dietaryNeeds = [params.diet];
    return recipe;
  } catch (err) {
    console.warn("ChefAI: Primary synthesis failed, attempting fallback...", err);
    try {
      // Fallback attempt with Flash model
      const recipe = await attemptRecipeGeneration('gemini-3-flash-preview', prompt);
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
        parts: [{ text: `High-end food photography of ${prompt}. Neutral tones, natural lighting, macro detail, 4k.` }]
      },
      config: {
        imageConfig: { aspectRatio: "16:9" }
      }
    });

    const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
    if (part?.inlineData?.data) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
    throw new Error("No image data in response");
  } catch (err) {
    console.warn("ChefAI: Visual synthesis failed, providing default asset.", err);
    return 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=1000';
  }
}

export function createChefChat(recipe: Recipe) {
  const ai = getAIInstance();
  const systemInstruction = `You are ChefAI assistant for the recipe: "${recipe.title}".
    Context: ${recipe.description}. Ingredients: ${recipe.ingredients.map(i => i.name).join(', ')}.
    Assist with technique, scaling, or substitutions. Be brief and professional.`;
    
  return ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: { systemInstruction }
  });
}
