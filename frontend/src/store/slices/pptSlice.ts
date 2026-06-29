import { StateCreator } from "zustand";
import { AppState, SlideInfo } from "../types";

export interface PptSlice {
  pptSlides: SlideInfo[];
  pptUploaded: boolean;
  pptFileName: string;
  setPptSlides: (s: SlideInfo[]) => void;
  setPptFileName: (n: string) => void;
}

export const createPptSlice: StateCreator<
  AppState,
  [],
  [],
  PptSlice
> = (set, get) => ({
  pptSlides: [],
  pptUploaded: false,
  pptFileName: "",

  setPptSlides: (s) => set({ pptSlides: s, pptUploaded: s.length > 0 }),
  setPptFileName: (n) => set({ pptFileName: n })
});
