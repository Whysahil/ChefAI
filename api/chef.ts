
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

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.API_KEY;
  const { action, payload } = req.body;

  if (action === 'health') {
    if (!apiKey || apiKey === 'undefined' || apiKey === '') {
      return res.status(200).json({ status: 'unconfigured' });
    }
    return res.status(200).json({ status: 'healthy' });
  }

  if (!apiKey) {
    return res.status(500).json({ error: 'API_KEY_MISSING' });
  }

  // Pre-Model Validation
  if (action === 'generate') {
    if (!payload.prompt || payload.prompt.includes('Ingredients available: .')) {
      return res.status(400).json({ 
        error: 'INSUFFICIENT_INPUT', 
        message: 'Synthesis requires at least one primary ingredient component.' 
      });
    }
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    switch (action) {
      case 'generate':
        const genResponse = await ai.models.generateContent({
          model: 'gemini-3-pro-preview',
          contents: [{ role: 'user', parts: [{ text: payload.prompt }] }],
          config: {
            responseMimeType: "application/json",
            responseSchema: recipeSchema,
            thinkingConfig: { thinkingBudget: 32768 }
          },
        });
        return res.status(200).json({ text: genResponse.text });

      case 'analyze':
        const visionResponse = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: [
            {
              parts: [
                { text: "Identify food ingredients in this image. Comma-separated list." },
                { inlineData: { mimeType: "image/jpeg", data: payload.image } }
              ]
            }
          ]
        });
        return res.status(200).json({ text: visionResponse.text });

      case 'image':
        const imgResponse = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: { parts: [{ text: payload.prompt }] },
          config: { imageConfig: { aspectRatio: "16:9" } }
        });
        const imagePart = imgResponse.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
        return res.status(200).json({ data: imagePart?.inlineData?.data || '' });

      default:
        return res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error: any) {
    if (error.message?.includes("Requested entity was not found")) {
        return res.status(404).json({ error: 'API_KEY_INVALID' });
    }
    return res.status(500).json({ error: 'SYNTHESIS_FAILED', message: error.message });
  }
}
