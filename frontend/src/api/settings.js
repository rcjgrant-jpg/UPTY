import { apiFetch } from "./client";

export function updateEmail(email) {
  return apiFetch("/settings/email", {
    method: "PUT",
    body: { email },
  });
}

export function updatePassword(currentPassword, newPassword) {
  return apiFetch("/settings/password", {
    method: "PUT",
    body: {
      current_password: currentPassword,
      new_password: newPassword,
    },
  });
}