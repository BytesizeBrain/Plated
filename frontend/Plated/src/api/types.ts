// src/api/types.ts

export interface User {
  id: string;
  email: string;
  username: string;
  display_name: string;
  profile_pic: string;
  followers_count?: number;
  following_count?: number;
}

export interface ConnectionUser {
  username: string;
  display_name: string;
  profile_pic: string;
}

export interface ConnectionsResponse {
  followers: ConnectionUser[];
  following: ConnectionUser[];
}

export interface FeedUser {
  id: string;
  username: string;
  profile_pic?: string | null;
}

export interface FeedPost {
  id: string;
  image_url: string;
  caption: string;
  created_at: string;
  user: FeedUser;
}

export interface FeedResponse {
  page: number;
  per_page: number;
  feed: FeedPost[];
}

export interface Recipe {
  id: number;
  title: string;
  description?: string | null;
  image_url?: string | null;
}

export interface DevLoginResponse {
  token: string;
  [key: string]: unknown;
}
