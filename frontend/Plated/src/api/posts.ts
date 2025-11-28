// src/api/posts.ts

import { apiRequest } from "./client";
import type { FeedResponse } from "./types";

// GET /feed?page=1&per_page=10
export function getFeed(
  page = 1,
  perPage = 10
): Promise<FeedResponse> {
  const params = new URLSearchParams({
    page: String(page),
    per_page: String(perPage),
  });
  return apiRequest<FeedResponse>(`/feed?${params.toString()}`);
}

// POST /posts  (JSON – simple test endpoint)
export function createPostJson(payload: {
  user_id: string;
  image_url: string;
  caption?: string;
}) {
  return apiRequest("/posts", {
    method: "POST",
    body: payload,
  });
}

// POST /create_post  (multipart form-data with image)
export async function createPostWithImage(args: {
  file: File;
  userId: string;
  caption?: string;
}) {
  const form = new FormData();
  form.append("image", args.file);
  form.append("user_id", args.userId);
  if (args.caption) form.append("caption", args.caption);

  return apiRequest("/create_post", {
    method: "POST",
    body: form,
  });
}

// GET /posts/user/:user_id
export function getUserPosts(userId: string) {
  return apiRequest(`/posts/user/${encodeURIComponent(userId)}`);
}

// GET /posts/:post_id
export function getPost(postId: string) {
  return apiRequest(`/posts/${encodeURIComponent(postId)}`);
}

// DELETE /posts/:post_id
export function deletePost(postId: string) {
  return apiRequest<{ Message: string }>(
    `/posts/${encodeURIComponent(postId)}`,
    { method: "DELETE" }
  );
}
