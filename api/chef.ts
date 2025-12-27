
import { GoogleGenAI, Type } from "@google/genai";

// 1. Definition of "Core" ingredients for validation logic
const CORE_INGREDIENTS = [
  'chicken', 'eggs', 'fish', 'shrimp', 'paneer', 'tofu', 'chana', 'dal', 'kidney beans',
  'onion', 'tomato', 'potato', 'carrot', 'spinach', 'bell pepper', 'mushroom', 'cauliflower', 'okra', 'brinjal',
  'rice', 'atta', 'maida', 'basmati', 'poha', 'bread', 'pasta', 'quinoa'
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
    "servings", "difficulty"
  ]
};

/**
 * Executes an AI task with automatic failover across multiple keys.
 * This is hidden from the client to prevent credential exposure.
 */
async function executeWithFailover(task: (ai: any) => Promise<any>) {
  const keys = [
    process.env.API_KEY,
    process.env.API_KEY_SECONDARY,
    // Add more fallbacks as environment variables here
  ].filter(Boolean);

  if (keys.length === 0) {
    throw new Error('API_KEYS_EXHAUSTED');
  }

  let lastError: any = null;

  for (let i = 0; i < keys.length; i++) {
    try {
      const ai = new GoogleGenAI({ apiKey: keys[i] as string });
      return await task(ai);
    } catch (error: any) {
      console.warn(`Provider ${i} failed, attempting failover...`, error.message);
      lastError = error;

      // Only failover for recoverable errors
      const isRecoverable = 
        error.message?.includes("429") || // Rate Limit
        error.message?.includes("503") || // Service Unavailable
        error.message?.includes("401") || // Invalid Key
        error.message?.includes("not found") || // Model/Entity missing
        error.message?.includes("quota");   // Quota exceeded

      if (!isRecoverable) break; // Don't retry for safety violations or bad schemas
    }
  }

  throw lastError;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { action, payload } = req.body;

  // 1. Availability check: Return healthy if at least one key exists
  if (action === 'health') {
    const hasAnyKey = !!(process.env.API_KEY || process.env.API_KEY_SECONDARY);
    return res.status(200).json({ 
      status: hasAnyKey ? 'healthy' : 'unconfigured' 
    });
  }

  try {
    switch (action) {
      case 'generate':
        // Validation Layer (No AI cost)
        const userIngredients = payload.ingredients || [];
        const hasCore = userIngredients.some((ing: string) => 
          CORE_INGREDIENTS.includes(ing.toLowerCase())
        );

        if (userIngredients.length === 0) {
          return res.status(400).json({
            status: "invalid_input",
            message: "Input matrix is empty."
          });
        }

        if (!hasCore && userIngredients.length < 3) {
          return res.status(400).json({
            status: "invalid_input",
            message: "Missing main ingredient (Protein/Veg/Grain)."
          });
        }

        const genResult = await executeWithFailover(async (ai) => {
          return await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: [{ role: 'user', parts: [{ text: payload.prompt }] }],
            config: {
              responseMimeType: "application/json",
              responseSchema: recipeSchema,
              thinkingConfig: { thinkingBudget: 16000 }
            },
          });
        });
        return res.status(200).json({ status: "success", text: genResult.text });

      case 'analyze':
        const visionResult = await executeWithFailover(async (ai) => {
          return await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: [
              {
                parts: [
                  { text: "Identify food items in this image. Return a comma-separated list." },
                  { inlineData: { mimeType: "image/jpeg", data: payload.image } }
                ]
              }
            ]
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
    console.error("Chef Resilience Engine Error:", error);

    if (error.message === 'API_KEYS_EXHAUSTED') {
      return res.status(503).json({ 
        status: "error", 
        error: 'SERVICE_UNAVAILABLE', 
        message: "Culinary intelligence nodes are currently unconfigured." 
      });
    }

    // Generic error fallback for client safety
    return res.status(500).json({ 
      status: "error", 
      error: 'SYNTHESIS_FAILED', 
      message: "The intelligence core is currently congested. Auto-failover initiated but pending resolution."
    });
  }
}
