
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
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Network request failed');
  }
  return data;
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
      body: JSON.stringify(params)
    });
    return handleResponse(res);
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
