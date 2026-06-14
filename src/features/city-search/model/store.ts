import { create } from "zustand";

interface CitySearchState {
  query: string;
  open: boolean;
  setQuery: (value: string) => void;
  setOpen: (value: boolean) => void;
  reset: () => void;
}

/* Состояние поиска города в шапке */
export const useCitySearch = create<CitySearchState>((set) => ({
  query: "",
  open: false,
  setQuery: (value) => set({ query: value, open: true }),
  setOpen: (value) => set({ open: value }),
  reset: () => set({ query: "", open: false }),
}));
