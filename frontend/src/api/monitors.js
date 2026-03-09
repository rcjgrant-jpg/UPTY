import { apiFetch } from "./client";

export function listMonitors() {
  return apiFetch("/monitors");
}

export function getMonitor(id) {
  return apiFetch(`/monitors/${id}`);
}

export function createMonitor(body) {
  return apiFetch("/monitors", {
    method: "POST",
    body,
  });
}

export function deleteMonitor(id) {
  return apiFetch(`/monitors/${id}`, {
    method: "DELETE",
  });
}