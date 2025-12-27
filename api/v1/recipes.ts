
import { GoogleGenAI, Type } from "@google/genai";
import { validateAndNormalizeRecipe } from "../../lib/validations";

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

  const { ingredients, diet, cuisine, action, prompt } = req.body;
  
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

  try {
    if (action === 'image') {
      const imgPrompt = typeof prompt === 'string' ? prompt : 'Gourmet plating';
      const imgResult = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: imgPrompt }] },
        config: { imageConfig: { aspectRatio: "16:9" } }
      });
      
      let base64Data: string = "";
      const candidates = imgResult.candidates;
      if (candidates && candidates.length > 0) {
        const content = candidates[0].content;
        if (content && content.parts) {
          const imagePart = content.parts.find(p => !!p.inlineData);
          if (imagePart && imagePart.inlineData && imagePart.inlineData.data) {
            base64Data = imagePart.inlineData.data;
          }
        }
      }
      return res.status(200).json({ status: "success", data: base64Data });
    }

    const ingredientsList = Array.isArray(ingredients) ? ingredients.join(', ') : 'common pantry staples';
    const cuisineStyle = typeof cuisine === 'string' ? cuisine : 'Standard';
    const dietPreference = typeof diet === 'string' ? diet : 'None';

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Create a professional recipe using: ${ingredientsList}. Style: ${cuisineStyle}. Diet: ${dietPreference}.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: nativeRecipeSchema,
        thinkingConfig: { thinkingBudget: 16000 }
      }
    });

    const responseText: string = response.text ?? "";
    if (!responseText) {
      throw new Error("AI returned empty data stream.");
    }

    // LAYER 2: Validation & Normalization
    let validatedRecipe;
    try {
      const rawRecipe = JSON.parse(responseText);
      validatedRecipe = validateAndNormalizeRecipe(rawRecipe);
    } catch (validationErr: any) {
      // Reject invalid AI output with 422
      return res.status(422).json({
        status: "ai_error",
        message: validationErr.message || "AI returned incomplete or malformed recipe data."
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Recipe synthesized and validated.",
      recipe: validatedRecipe
    });
  } catch (error: any) {
    console.error("Backend API Error:", error);
    return res.status(500).json({ 
      status: "error", 
      message: error.message || "An unexpected error occurred during synthesis." 
    });
  }
}
