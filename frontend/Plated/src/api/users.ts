// src/api/users.ts

import { apiRequest } from "./client";
import type { ConnectionsResponse } from "./types";

export function getConnections(
  token: string
): Promise<ConnectionsResponse> {
  return apiRequest<ConnectionsResponse>("/connections", { token });
}

// GET /check_username?username=alice
export function checkUsername(
  username: string
): Promise<{ exists: boolean }> {
  const params = new URLSearchParams({ username });
  return apiRequest<{ exists: boolean }>(
    `/check_username?${params.toString()}`
  );
}

// --- Follow requests ---

export function sendFollowRequest(
  token: string,
  targetUsername: string
): Promise<{ message: string }> {
  return apiRequest<{ message: string }>("/follow-request", {
    method: "POST",
    token,
    body: { target_username: targetUsername },
  });
}

export function getReceivedFollowRequests(
  token: string
): Promise<
  { username: string; display_name: string; profile_pic: string }[]
> {
  return apiRequest(
    "/follow-requests/received",
    { token }
  );
}

export function getSentFollowRequests(
  token: string
): Promise<
  { username: string; display_name: string; profile_pic: string }[]
> {
  return apiRequest(
    "/follow-requests/sent",
    { token }
  );
}

export function acceptFollowRequest(
  token: string,
  requesterUsername: string
): Promise<{ message: string }> {
  return apiRequest<{ message: string }>("/follow-request/accept", {
    method: "POST",
    token,
    body: { requester_username: requesterUsername },
  });
}

export function rejectFollowRequest(
  token: string,
  requesterUsername: string
): Promise<{ message: string }> {
  return apiRequest<{ message: string }>("/follow-request/reject", {
    method: "POST",
    token,
    body: { requester_username: requesterUsername },
  });
}

export function cancelFollowRequest(
  token: string,
  targetUsername: string
): Promise<{ message: string }> {
  return apiRequest<{ message: string }>("/follow-request/cancel", {
    method: "POST",
    token,
    body: { target_username: targetUsername },
  });
}
