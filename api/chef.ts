
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

  if (!apiKey) {
    return res.status(500).json({ 
      status: "error", 
      error: 'API_KEY_MISSING', 
      message: "The primary REST API key is not configured in the environment." 
    });
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    switch (action) {
      case 'generate':
        const genResult = await ai.models.generateContent({
          model: 'gemini-3-pro-preview',
          contents: [{ 
            role: 'user', 
            parts: [{ text: `Act as a Michelin star chef. Create a unique, high-quality recipe. Output ONLY valid JSON matching the schema. CONTEXT: ${payload.prompt}` }] 
          }],
          config: {
            responseMimeType: "application/json",
            responseSchema: recipeSchema,
            thinkingConfig: { thinkingBudget: 16000 }
          },
        });
        
        const responseText = genResult.text;
        if (typeof responseText !== 'string') {
          throw new Error("The synthesis engine returned an empty or invalid text response.");
        }
        return res.status(200).json({ status: "success", text: responseText });

      case 'analyze':
        const visionResult = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: [{
            parts: [
              { text: "Identify all culinary ingredients in this image. List them clearly, separated by commas." },
              { inlineData: { mimeType: "image/jpeg", data: payload.image } }
            ]
          }]
        });
        const visionText = visionResult.text;
        if (typeof visionText !== 'string') {
          throw new Error("Vision analysis failed to return a textual description.");
        }
        return res.status(200).json({ status: "success", text: visionText });

      case 'image':
        const imgResult = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: { parts: [{ text: payload.prompt }] },
          config: { imageConfig: { aspectRatio: "16:9" } }
        });
        
        let base64Data = '';
        const candidates = imgResult.candidates;
        if (candidates && candidates.length > 0) {
          const parts = candidates[0].content?.parts;
          if (parts) {
            for (const part of parts) {
              if (part.inlineData) {
                base64Data = part.inlineData.data;
                break;
              }
            }
          }
        }
        return res.status(200).json({ status: "success", data: base64Data });

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
