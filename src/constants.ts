export const HIGHLIGHT_COLORS = [
  "rgba(255, 255, 0, 0.3)",
  "rgba(0, 255, 0, 0.3)",
  "rgba(255, 0, 0, 0.3)",
  "rgba(0, 255, 255, 0.3)",
  "rgba(255, 0, 255, 0.3)",
  "rgba(255, 165, 0, 0.3)",
  "rgba(128, 0, 128, 0.3)",
  "rgba(0, 128, 0, 0.3)",
];

export const ACTIVE_HIGHLIGHT_COLORS = [
  "rgba(255, 255, 0, 0.5)",
  "rgba(0, 255, 0, 0.5)",
  "rgba(255, 0, 0, 0.5)",
  "rgba(0, 255, 255, 0.5)",
  "rgba(255, 0, 255, 0.5)",
  "rgba(255, 165, 0, 0.5)",
  "rgba(128, 0, 128, 0.5)",
  "rgba(0, 128, 0, 0.5)",
];

export function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export type SearchMatch = {
  pageIndex: number;
  matchIndex: number;
  str: string;
  termIndex: number;
};
