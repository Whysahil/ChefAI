
import { GoogleGenAI, Type } from "@google/genai";
import { parseAIRecipe } from "../lib/schema";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const recipeJsonSchema = {
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
        }
      }
    },
    instructions: { type: Type.ARRAY, items: { type: Type.STRING } },
    tips: { type: Type.ARRAY, items: { type: Type.STRING } },
    nutrition: {
      type: Type.OBJECT,
      properties: {
        calories: { type: Type.NUMBER },
        protein: { type: Type.STRING },
        carbs: { type: Type.STRING },
        fat: { type: Type.STRING }
      }
    },
    imagePrompt: { type: Type.STRING }
  },
  required: ["title", "ingredients", "instructions", "imagePrompt"]
};

export const AIService = {
  async synthesizeRecipe(ingredients: string[], diet: string, cuisine: string) {
    const prompt = `Synthesize a gourmet recipe using: ${ingredients.join(', ')}. 
      Dietary constraint: ${diet}. Cuisine style: ${cuisine}. 
      Return strictly valid JSON.`;

    const res = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: recipeJsonSchema,
        thinkingConfig: { thinkingBudget: 16000 }
      }
    });

    const text = res.text;
    if (!text) throw new Error("AI synthesis returned empty buffer.");
    
    return parseAIRecipe(JSON.parse(text));
  },

  async generateImage(prompt: string) {
    const res = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: `High-end professional food photography, 8k, bokeh, appetizing, cinematic lighting: ${prompt}`,
      config: { imageConfig: { aspectRatio: "16:9" } }
    });

    const part = res.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
    return part?.inlineData?.data ? `data:image/png;base64,${part.inlineData.data}` : null;
  }
};
