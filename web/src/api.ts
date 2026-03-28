import type { IdeaSummary, IdeaDetail, VariantEdge, PortfolioDomain } from "./types.js";

const BASE_URL = (import.meta as { env?: { VITE_API_URL?: string } }).env?.VITE_API_URL ?? "";

async function fetchJson<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, options);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API error ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

export function getIdeas(): Promise<IdeaSummary[]> {
  return fetchJson<IdeaSummary[]>("/api/ideas");
}

export function getIdea(id: string): Promise<IdeaDetail> {
  return fetchJson<IdeaDetail>(`/api/ideas/${id}`);
}

export function updateIdeaStatus(
  id: string,
  status: IdeaSummary["status"]
): Promise<{ success: boolean; id: string; status: string }> {
  return fetchJson(`/api/ideas/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
}

export function getVariants(): Promise<VariantEdge[]> {
  return fetchJson<VariantEdge[]>("/api/variants");
}

export function getPortfolio(): Promise<PortfolioDomain[]> {
  return fetchJson<PortfolioDomain[]>("/api/portfolio");
}
