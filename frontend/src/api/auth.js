import { apiFetch } from "./client";

export function getCsrfCookie() {
  return apiFetch("/auth/csrf");
}

export function login(email, password) {
  return apiFetch("/auth/login", {
    method: "POST",
    body: { email, password },
  });
}

export function register(email, password, team_name) {
  return apiFetch("/auth/register", {
    method: "POST",
    body: { email, password, team_name },
  });
}

export function logout() {
  return apiFetch("/auth/logout", {
    method: "POST",
  });
}

export function me() {
  return apiFetch("/auth/me");
}