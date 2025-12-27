
import { Recipe } from "../types";

const BASE_URL = '/api/v1';

const getHeaders = () => {
  const token = localStorage.getItem('chef_ai_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

async function handleResponse(res: Response) {
  const contentType = res.headers.get('content-type');
  
  if (contentType && contentType.includes('application/json')) {
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || data.error || 'Culinary synthesis protocol failure.');
    }
    return data;
  } else {
    // If response is not JSON, it's likely a server error page or plain text
    const text = await res.text();
    if (!res.ok) {
      // Extract a cleaner message if it looks like a standard server error
      if (text.includes('A server error occurred')) {
        throw new Error("The synthesis engine encountered an internal fault. Please try again in a moment.");
      }
      throw new Error(text || `Server responded with status ${res.status}`);
    }
    return text;
  }
}

export const ChefApiService = {
  async login(email: string) {
    const res = await fetch(`${BASE_URL}/auth`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ action: 'login', email })
    });
    return handleResponse(res);
  },

  async register(username: string, email: string) {
    const res = await fetch(`${BASE_URL}/auth`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ action: 'register', username, email })
    });
    return handleResponse(res);
  },

  async getMe() {
    const res = await fetch(`${BASE_URL}/auth`, { headers: getHeaders() });
    return handleResponse(res);
  },

  async generateRecipe(params: { ingredients: string[], diet: string, cuisine: string }) {
    const res = await fetch(`${BASE_URL}/recipes`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ ...params, action: 'generate' })
    });
    const data = await handleResponse(res);
    
    if (data.status === 'success' && data.recipe) {
      return {
        ...data,
        recipe: {
          ...data.recipe,
          id: data.recipe.id || Math.random().toString(36).substring(2, 11),
          createdAt: Date.now()
        }
      };
    }
    return data;
  },

  async generateImage(prompt: string) {
    const res = await fetch(`${BASE_URL}/recipes`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ action: 'image', prompt })
    });
    return handleResponse(res);
  },

  async getFavorites() {
    const res = await fetch(`${BASE_URL}/favorites`, { headers: getHeaders() });
    return handleResponse(res);
  },

  async saveFavorite(recipe: Recipe) {
    const res = await fetch(`${BASE_URL}/favorites`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ recipe })
    });
    return handleResponse(res);
  }
};
