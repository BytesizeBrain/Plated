// src/api/recipes.ts

import { apiRequest } from "./client";
import type { Recipe } from "./types";

// GET /getRecipes
export function getRecipes(): Promise<Recipe[]> {
  return apiRequest<Recipe[]>("/getRecipes");
}

// POST /post
export function createRecipe(
  data: Partial<Recipe> & { title: string }
): Promise<Recipe[]> {
  // backend currently just forwards supabase response.data
  return apiRequest<Recipe[]>("/post", {
    method: "POST",
    body: data,
  });
}
