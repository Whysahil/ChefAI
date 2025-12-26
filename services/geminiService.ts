
import { GoogleGenAI, Type } from "@google/genai";
import { Recipe } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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
      }
    },
    servingSuggestions: { type: Type.STRING },
    substitutions: {
      type: Type.ARRAY,
      items: { type: Type.STRING }
    },
    imagePrompt: { type: Type.STRING }
  },
  required: ["title", "description", "mealType", "prepTime", "cookTime", "ingredients", "instructions", "nutrition", "imagePrompt", "servingSuggestions"]
};

export async function generateRecipe(params: {
  ingredients?: string[],
  diet?: string,
  cuisine?: string,
  mealType?: string,
  skill?: string,
  spiceLevel?: string,
  cookingPreference?: string
}): Promise<Recipe> {
  const prompt = `You are ChefAI, an intelligent recipe companion. 
    Generate a high-quality, practical recipe based on:
    Available Ingredients: ${params.ingredients?.join(', ') || 'Any'}
    Meal Type: ${params.mealType || 'Dinner'}
    Dietary Preferences: ${params.diet || 'None'}
    Cuisine/Country: ${params.cuisine || 'International'}
    Spice Level: ${params.spiceLevel || 'Medium'}
    Cooking Style: ${params.cookingPreference || 'Home-style'}
    Skill Level: ${params.skill || 'Intermediate'}
    
    Guidelines:
    - Use ONLY selected ingredients + basic kitchen staples (water, oil, salt, etc).
    - Provide clear, numbered, beginner-friendly instructions.
    - Focus on home-friendly practical cooking.
    - Include specific serving suggestions and optional substitutions.
    - No long explanations or fluff.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: recipeSchema,
    },
  });

  const text = response.text;
  if (!text) throw new Error("No response from AI");
  const recipeData = JSON.parse(text.trim());
  
  return {
    ...recipeData,
    id: Math.random().toString(36).substr(2, 9),
    dietaryNeeds: params.diet ? [params.diet] : [],
    createdAt: Date.now()
  };
}

export async function parseFiltersWithAI(text: string): Promise<any> {
  const prompt = `Parse this request into keys: cuisine, diet, mealType, skill, spiceLevel, cookingPreference.
  User: "${text}"
  Return ONLY JSON.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          cuisine: { type: Type.STRING },
          diet: { type: Type.STRING },
          mealType: { type: Type.STRING },
          skill: { type: Type.STRING },
          spiceLevel: { type: Type.STRING },
          cookingPreference: { type: Type.STRING }
        }
      }
    }
  });

  const parsedText = response.text;
  if (!parsedText) return null;
  return JSON.parse(parsedText.trim());
}

export async function generateRecipeImage(prompt: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: `A professional food photography shot of ${prompt}. Gourmet, minimalist, soft light, 4k.` }]
      },
      config: {
        imageConfig: { aspectRatio: "16:9" }
      }
    });

    const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
    if (part?.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
    return 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=1000';
  } catch (err) {
    return 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=1000';
  }
}

export function createChefChat(recipe: Recipe) {
  const systemInstruction = `You are ChefAI, an intelligent recipe companion. 
    A user is cooking: "${recipe.title}". 
    Help with substitutions, refinements, or scaling.
    Be clean, structured, and practical.`;
    
  return ai.chats.create({
    model: 'gemini-3-pro-preview',
    config: { systemInstruction }
  });
}
