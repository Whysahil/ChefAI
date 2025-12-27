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
    substitutions: {
      type: Type.ARRAY,
      items: { type: Type.STRING }
    },
    servingSuggestions: { type: Type.STRING },
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
    imagePrompt: { type: Type.STRING }
  },
  required: [
    "title", "description", "mealType", "prepTime", "cookTime", 
    "ingredients", "instructions", "nutrition", "imagePrompt", 
    "servings", "difficulty", "tips", "substitutions", "servingSuggestions"
  ]
};

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { action, payload } = req.body;
  const apiKey = process.env.API_KEY;

  if (action === 'health') {
    return res.status(200).json({ status: apiKey ? 'healthy' : 'unconfigured' });
  }

  if (!apiKey || typeof apiKey !== 'string') {
    return res.status(500).json({ 
      status: "error", 
      error: 'API_KEY_MISSING', 
      message: "The primary REST API key is not configured in the environment." 
    });
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    switch (action) {
      case 'generate': {
        const promptText = typeof payload?.prompt === 'string' ? payload.prompt : 'Create a masterpiece recipe.';
        const genResult = await ai.models.generateContent({
          model: 'gemini-3-pro-preview',
          contents: [{ 
            role: 'user', 
            parts: [{ text: `Act as a Michelin star chef. Create a unique, high-quality recipe. Output ONLY valid JSON matching the schema. CONTEXT: ${promptText}` }] 
          }],
          config: {
            responseMimeType: "application/json",
            responseSchema: recipeSchema,
            thinkingConfig: { thinkingBudget: 16000 }
          },
        });
        
        const text = genResult.text;
        if (!text) {
          throw new Error("The synthesis engine returned an empty text response.");
        }
        return res.status(200).json({ status: "success", text });
      }

      case 'analyze': {
        const imagePayload = payload?.image;
        if (!imagePayload || typeof imagePayload !== 'string') {
          return res.status(400).json({ status: "error", message: "Image data is required for analysis." });
        }
        const visionResult = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: [{
            parts: [
              { text: "Identify all culinary ingredients in this image. List them clearly, separated by commas." },
              { inlineData: { mimeType: "image/jpeg", data: imagePayload } }
            ]
          }]
        });
        const text = visionResult.text;
        if (!text) {
          throw new Error("Vision analysis failed to return a textual description.");
        }
        return res.status(200).json({ status: "success", text });
      }

      case 'image': {
        const promptText = typeof payload?.prompt === 'string' ? payload.prompt : 'Gourmet food plating';
        const imgResult = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: { parts: [{ text: promptText }] },
          config: { imageConfig: { aspectRatio: "16:9" } }
        });
        
        let base64Data = '';
        const candidates = imgResult.candidates;
        if (candidates && candidates.length > 0) {
          const contentParts = candidates[0].content?.parts;
          if (contentParts) {
            for (const part of contentParts) {
              if (part.inlineData) {
                base64Data = part.inlineData.data;
                break;
              }
            }
          }
        }
        return res.status(200).json({ status: "success", data: base64Data });
      }

      default:
        return res.status(400).json({ status: "error", error: 'INVALID_ACTION' });
    }
  } catch (error: any) {
    console.error("Critical AI Error:", error);
    return res.status(500).json({ 
      status: "error", 
      error: 'SYNTHESIS_FAILED', 
      message: error.message || "An unexpected error occurred during synthesis." 
    });
  }
}