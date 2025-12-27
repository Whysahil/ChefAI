
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
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    return res.status(500).json({ status: "error", message: "AI Engine not configured." });
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    switch (action) {
      case 'generate': {
        const promptText = (payload && typeof payload.prompt === 'string') ? payload.prompt : 'Create a recipe.';
        
        const genResult = await ai.models.generateContent({
          model: 'gemini-3-pro-preview',
          contents: `SYSTEM: You are a Michelin Star Chef. 
TASK: Generate a professional recipe JSON based on the context provided.
RULES: 
1. Output ONLY a single valid JSON object.
2. Adhere strictly to the requested schema.
3. Ensure all ingredient amounts are specific.
4. Ensure instructions are clear and numbered.
CONTEXT: ${promptText}`,
          config: {
            responseMimeType: "application/json",
            responseSchema: nativeRecipeSchema,
            thinkingConfig: { thinkingBudget: 16000 }
          },
        });
        
        const rawText = genResult.text ?? "";
        if (!rawText) throw new Error("AI returned empty content.");

        let parsedJson;
        try {
          parsedJson = JSON.parse(rawText);
        } catch (e) {
          throw new Error("AI output could not be parsed as valid JSON.");
        }

        // Secondary Validation Layer (Zod)
        const validated = validateAndNormalizeRecipe(parsedJson);

        return res.status(200).json({ 
          status: "success", 
          text: JSON.stringify(validated) 
        });
      }

      case 'analyze': {
        const imagePayload = payload?.image;
        if (!imagePayload || typeof imagePayload !== 'string') {
          return res.status(400).json({ status: "error", message: "Image data required for analysis." });
        }
        
        const visionResult = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: {
            parts: [
              { text: "List every culinary ingredient you identify in this image. Format: ingredient1, ingredient2, ..." },
              { inlineData: { mimeType: "image/jpeg", data: imagePayload } }
            ]
          }
        });
        
        const text = visionResult.text ?? "";
        return res.status(200).json({ status: "success", text });
      }

      case 'image': {
        const promptText = (payload && typeof payload.prompt === 'string') ? payload.prompt : 'Gourmet plating';
        const imgResult = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: { parts: [{ text: promptText }] },
          config: { imageConfig: { aspectRatio: "16:9" } }
        });
        
        let base64Data = '';
        const candidates = imgResult.candidates;
        if (candidates && candidates.length > 0 && candidates[0].content?.parts) {
          const part = candidates[0].content.parts.find(p => p.inlineData?.data);
          if (part?.inlineData?.data) base64Data = part.inlineData.data;
        }
        
        if (!base64Data) throw new Error("Visual synthesis produced no image data.");
        return res.status(200).json({ status: "success", data: base64Data });
      }

      default:
        return res.status(400).json({ status: "error", message: "Unknown action protocol." });
    }
  } catch (error: any) {
    console.error("Chef API Protocol Fault:", error);
    return res.status(error.message?.includes('Data Integrity') ? 422 : 500).json({ 
      status: "error", 
      message: error.message || "Synthesis interrupted." 
    });
  }
}
