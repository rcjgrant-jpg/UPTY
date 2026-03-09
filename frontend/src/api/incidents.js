import { apiFetch } from "./client";

export function listIncidents() {
  return apiFetch("/incidents");
}

export function resolveIncident(id) {
  return apiFetch(`/incidents/${id}/resolve`, {
    method: "POST",
  });
}