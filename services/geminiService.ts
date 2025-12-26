
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

export async function analyzeIngredients(base64Image: string): Promise<string[]> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
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
      ]
    });
    
    const text = response.text;
    if (!text) return [];
    return text.split(',').map(s => s.trim().toLowerCase()).filter(s => s.length > 0);
  } catch (err) {
    console.error("Visual Analysis Failure:", err);
    return [];
  }
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
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const prompt = `You are ChefAI, an elite culinary intelligence specializing in authentic and fusion cuisine.
    TASK: Generate a precise, professional recipe based on the user's input.
    
    USER PARAMETERS:
    - Pantry: ${params.ingredients?.join(', ') || 'Any'}
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
    - imagePrompt should be a high-quality description for a professional food photoshoot.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: recipeSchema,
      },
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from AI");

    const recipeData = JSON.parse(text.trim());
    
    return {
      ...recipeData,
      id: Math.random().toString(36).substring(2, 11),
      dietaryNeeds: params.diet && params.diet !== 'None' ? [params.diet] : [],
      createdAt: Date.now()
    };
  } catch (err: any) {
    console.error("ChefAI Engine Synthesis Failure:", err);
    throw err;
  }
}

export async function parseFiltersWithAI(text: string): Promise<any> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  const prompt = `Parse the following natural language cooking request into parameters:
  " ${text} "
  Return JSON with keys: cuisine, diet, mealType, skill, spiceLevel, cookingPreference.`;

  try {
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
    return parsedText ? JSON.parse(parsedText.trim()) : null;
  } catch (err) {
    console.error("Filter parsing failure:", err);
    return null;
  }
}

export async function generateRecipeImage(prompt: string): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: `Professional food photography of ${prompt}. Gourmet plating, shallow depth of field, warm natural lighting, 4k resolution.` }]
      },
      config: {
        imageConfig: { aspectRatio: "16:9" }
      }
    });

    const candidate = response.candidates?.[0];
    const part = candidate?.content?.parts?.find(p => p.inlineData);

    if (part?.inlineData?.data) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
    return 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=1000';
  } catch (err) {
    console.warn("Visual synthesis failed, using library default:", err);
    return 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=1000';
  }
}

export function createChefChat(recipe: Recipe) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  const systemInstruction = `You are ChefAI assistant. You are helping the user with the recipe: "${recipe.title}".
    Details: ${recipe.description}. Ingredients: ${recipe.ingredients.map(i => i.name).join(', ')}.
    Answer questions about substitutions, scaling, or technique. Be professional and concise.`;
    
  return ai.chats.create({
    model: 'gemini-3-pro-preview',
    config: { systemInstruction }
  });
}
