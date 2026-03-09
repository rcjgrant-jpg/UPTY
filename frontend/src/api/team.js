import { apiFetch } from "./client";

export function getTeam() {
  return apiFetch("/team");
}

export function createInvite() {
  return apiFetch("/team/invite", {
    method: "POST",
  });
}