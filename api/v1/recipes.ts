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

  const { ingredients, diet, cuisine, action, prompt } = req.body;
  const apiKey = process.env.API_KEY;

  if (!apiKey || typeof apiKey !== 'string') {
    return res.status(500).json({ status: "error", message: "API Configuration Missing" });
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    if (action === 'image') {
      const imgPrompt = typeof prompt === 'string' ? prompt : 'Gourmet recipe plating';
      const imgResult = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: imgPrompt }] },
        config: { imageConfig: { aspectRatio: "16:9" } }
      });
      
      let base64Data = "";
      const candidates = imgResult.candidates;
      if (candidates && candidates.length > 0) {
        const contentParts = candidates[0].content?.parts;
        if (contentParts) {
          const imagePart = contentParts.find(p => p.inlineData);
          if (imagePart && imagePart.inlineData) {
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
        responseSchema: recipeSchema,
        thinkingConfig: { thinkingBudget: 16000 }
      }
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("Synthesis failed: The model returned an empty response.");
    }

    return res.status(200).json({
      status: "success",
      message: "Recipe generated successfully",
      recipe: JSON.parse(responseText)
    });
  } catch (error: any) {
    return res.status(500).json({ status: "error", message: error.message });
  }
}