
import { GoogleGenAI, Type } from "@google/genai";
import { validateAndNormalizeRecipe } from "../lib/validations";

const nativeRecipeSchema = {
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
  
  // Use process.env.API_KEY directly as required by guidelines
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

  if (action === 'health') {
    return res.status(200).json({ status: 'healthy' });
  }

  try {
    switch (action) {
      case 'generate': {
        const promptText = (payload && typeof payload.prompt === 'string') ? payload.prompt : 'Create a recipe.';
        // Simplified contents for text-only prompt
        const genResult = await ai.models.generateContent({
          model: 'gemini-3-pro-preview',
          contents: `Act as a Michelin star chef. Create a unique recipe. Output ONLY valid JSON matching the schema. CONTEXT: ${promptText}`,
          config: {
            responseMimeType: "application/json",
            responseSchema: nativeRecipeSchema,
            thinkingConfig: { thinkingBudget: 16000 }
          },
        });
        
        const text: string = genResult.text ?? "";
        if (!text) {
          throw new Error("The synthesis engine returned an empty text response.");
        }

        const rawJson = JSON.parse(text);
        const validated = validateAndNormalizeRecipe(rawJson);

        return res.status(200).json({ status: "success", text: JSON.stringify(validated) });
      }

      case 'analyze': {
        const imagePayload = payload?.image;
        if (!imagePayload || typeof imagePayload !== 'string') {
          return res.status(400).json({ status: "error", message: "Image data is required." });
        }
        // Correct multimodal content structure per guidelines
        const visionResult = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: {
            parts: [
              { text: "Identify all culinary ingredients in this image. List them clearly, separated by commas." },
              { inlineData: { mimeType: "image/jpeg", data: imagePayload } }
            ]
          }
        });
        const text: string = visionResult.text ?? "";
        if (!text) {
          throw new Error("Vision analysis failed.");
        }
        return res.status(200).json({ status: "success", text });
      }

      case 'image': {
        const promptText = (payload && typeof payload.prompt === 'string') ? payload.prompt : 'Gourmet plating';
        const imgResult = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: { parts: [{ text: promptText }] },
          config: { imageConfig: { aspectRatio: "16:9" } }
        });
        
        let base64Data: string = '';
        const candidates = imgResult.candidates;
        if (candidates && candidates.length > 0) {
          const content = candidates[0].content;
          if (content && content.parts) {
            for (const part of content.parts) {
              if (part.inlineData && part.inlineData.data) {
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
    console.error("Chef API Error:", error);
    return res.status(500).json({ 
      status: "error", 
      message: error.message || "Synthesis error during Chef AI operation." 
    });
  }
}
