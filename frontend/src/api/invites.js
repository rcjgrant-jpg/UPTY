import { apiFetch } from "./client";

export function validateInvite(token) {
  return apiFetch(`/invite/${token}`);
}

export function acceptInvite(token) {
  return apiFetch(`/invite/${token}/accept`, {
    method: "POST",
  });
}