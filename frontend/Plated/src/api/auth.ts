// src/api/auth.ts

import { apiRequest } from "./client";
import type { DevLoginResponse, User } from "./types";

// For local testing only – backend route: POST /dev/login
export function devLogin(): Promise<DevLoginResponse> {
  return apiRequest<DevLoginResponse>("/dev/login", {
    method: "POST",
    body: {}, // backend ignores body
  });
}

// GET /profile  (requires Authorization header)
export function getProfile(token: string): Promise<User> {
  return apiRequest<User>("/profile", { token });
}

// PUT /update  (update display_name / username / profile_pic)
export function updateProfile(
  token: string,
  payload: Partial<Pick<User, "display_name" | "username" | "profile_pic">>
): Promise<{ message: string }> {
  return apiRequest<{ message: string }>("/update", {
    method: "PUT",
    token,
    body: payload,
  });
}
