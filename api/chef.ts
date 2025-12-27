
import { GoogleGenAI, Type } from "@google/genai";

// Expanded "Core" ingredients for robust validation
const CORE_INGREDIENTS = [
  'chicken', 'eggs', 'fish', 'shrimp', 'mutton', 'pork', 'beef', 'lamb',
  'paneer', 'tofu', 'chana', 'dal', 'kidney beans', 'lentils', 'soya',
  'onion', 'tomato', 'potato', 'carrot', 'spinach', 'bell pepper', 'mushroom', 
  'cauliflower', 'okra', 'brinjal', 'broccoli', 'cabbage', 'peas', 'corn',
  'rice', 'atta', 'maida', 'basmati', 'poha', 'bread', 'pasta', 'quinoa', 'oats', 'flour'
];

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

async function executeWithFailover(task: (ai: any) => Promise<any>) {
  const keys = [
    process.env.API_KEY,
    process.env.API_KEY_SECONDARY,
  ].filter(Boolean);

  if (keys.length === 0) throw new Error('API_KEYS_EXHAUSTED');

  let lastError: any = null;
  for (let i = 0; i < keys.length; i++) {
    try {
      const ai = new GoogleGenAI({ apiKey: keys[i] as string });
      return await task(ai);
    } catch (error: any) {
      lastError = error;
      const isRecoverable = 
        error.message?.includes("429") || 
        error.message?.includes("503") || 
        error.message?.includes("401") || 
        error.message?.includes("not found") || 
        error.message?.includes("quota");

      if (!isRecoverable) break;
    }
  }
  throw lastError;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { action, payload } = req.body;

  if (action === 'health') {
    const hasAnyKey = !!(process.env.API_KEY || process.env.API_KEY_SECONDARY);
    return res.status(200).json({ status: hasAnyKey ? 'healthy' : 'unconfigured' });
  }

  try {
    switch (action) {
      case 'generate':
        const genResult = await executeWithFailover(async (ai) => {
          return await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: [{ 
              role: 'user', 
              parts: [{ text: `Act as a Michelin star chef with deep knowledge of global and regional cuisines. Create a unique recipe based on the following context. Ensure the JSON strictly follows the schema provided. PROMPT: ${payload.prompt}` }] 
            }],
            config: {
              responseMimeType: "application/json",
              responseSchema: recipeSchema,
              thinkingConfig: { thinkingBudget: 16000 }
            },
          });
        });
        
        if (!genResult.text) throw new Error("EMPTY_AI_RESPONSE");
        return res.status(200).json({ status: "success", text: genResult.text });

      case 'analyze':
        const visionResult = await executeWithFailover(async (ai) => {
          return await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: [{
              parts: [
                { text: "Identify food items in this image. List them clearly, separated by commas." },
                { inlineData: { mimeType: "image/jpeg", data: payload.image } }
              ]
            }]
          });
        });
        return res.status(200).json({ status: "success", text: visionResult.text });

      case 'image':
        const imgResult = await executeWithFailover(async (ai) => {
          return await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [{ text: payload.prompt }] },
            config: { imageConfig: { aspectRatio: "16:9" } }
          });
        });
        const imagePart = imgResult.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData);
        return res.status(200).json({ status: "success", data: imagePart?.inlineData?.data || '' });

      default:
        return res.status(400).json({ status: "error", error: 'INVALID_ACTION' });
    }
  } catch (error: any) {
    console.error("API Layer Error:", error);
    return res.status(500).json({ 
      status: "error", 
      error: 'SYNTHESIS_FAILED', 
      message: error.message || "Failed to generate culinary protocol." 
    });
  }
}
