
import { GoogleGenAI, Type } from "@google/genai";

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
    imagePrompt: { type: Type.STRING },
    tips: { type: Type.ARRAY, items: { type: Type.STRING } },
    substitutions: { type: Type.ARRAY, items: { type: Type.STRING } },
    servingSuggestions: { type: Type.STRING }
  },
  required: ["title", "description", "ingredients", "instructions", "nutrition", "imagePrompt"]
};

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ status: "error", message: "Method not allowed" });

  const { ingredients, diet, cuisine, action } = req.body;
  const apiKey = process.env.API_KEY;

  if (!apiKey) return res.status(500).json({ status: "error", message: "API Configuration Missing" });

  const ai = new GoogleGenAI({ apiKey });

  try {
    if (action === 'image') {
      const imgResult = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: req.body.prompt }] },
        config: { imageConfig: { aspectRatio: "16:9" } }
      });
      
      const candidates = imgResult.candidates;
      const data = candidates?.[0]?.content?.parts?.find(p => p.inlineData)?.inlineData?.data;
      return res.status(200).json({ status: "success", data });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Create a professional recipe using: ${ingredients.join(', ')}. Style: ${cuisine}. Diet: ${diet}.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: recipeSchema,
        thinkingConfig: { thinkingBudget: 16000 }
      }
    });

    const responseText = response.text;
    if (!responseText) throw new Error("Synthesis failed: Empty response text.");

    return res.status(200).json({
      status: "success",
      message: "Recipe generated successfully",
      recipe: JSON.parse(responseText)
    });
  } catch (error: any) {
    return res.status(500).json({ status: "error", message: error.message });
  }
}
