import { create } from "zustand";
import { persist } from "zustand/middleware";
import { SearchMatch } from "./constants";

type AppState = {
  file: File | null;
  setFile: (file: File | null) => void;
  numPages: number;
  setNumPages: (numPages: number) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  scale: number;
  setScale: (scale: number) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchMatches: SearchMatch[];
  setSearchMatches: (matches: SearchMatch[]) => void;
  currentMatchIndex: number;
  setCurrentMatchIndex: (index: number) => void;
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      file: null,
      setFile: (file) =>
        set({
          file,
          currentPage: 1,
          searchQuery: "",
          searchMatches: [],
          currentMatchIndex: -1,
        }),
      numPages: 0,
      setNumPages: (numPages) => set({ numPages }),
      currentPage: 1,
      setCurrentPage: (currentPage) => set({ currentPage }),
      scale: 0.85,
      setScale: (scale) => set({ scale }),
      searchQuery: "",
      setSearchQuery: (searchQuery) => set({ searchQuery }),
      searchMatches: [],
      setSearchMatches: (searchMatches) => set({ searchMatches }),
      currentMatchIndex: -1,
      setCurrentMatchIndex: (currentMatchIndex) => set({ currentMatchIndex }),
      sidebarOpen: window.innerWidth >= 768,
      toggleSidebar: () =>
        set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (open: boolean) => set({ sidebarOpen: open }),
    }),
    {
      name: "pdf-reader-storage",
      partialize: (state) => ({
        scale: state.scale,
      }),
    }
  )
);
