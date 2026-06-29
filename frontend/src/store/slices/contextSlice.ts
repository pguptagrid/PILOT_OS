import { StateCreator } from "zustand";
import { AppState } from "../types";

export interface ContextSlice {
  typedFlightOrigin: string;
  typedFlightDestination: string;
  typedFlightDate: string;
  setTypedFlightContext: (origin: string, dest: string, date: string) => void;

  typedEmailTo: string;
  typedEmailSubject: string;
  setTypedEmailContext: (to: string, subject: string) => void;

  talkiniaSubRoute: string;
  lastReportedTalkiniaPath: string;
  setTalkiniaSubRoute: (route: string) => void;
  reportTalkiniaPath: (route: string) => void;
}

export const createContextSlice: StateCreator<
  AppState,
  [],
  [],
  ContextSlice
> = (set, get) => ({
  typedFlightOrigin: "",
  typedFlightDestination: "",
  typedFlightDate: "",
  setTypedFlightContext: (origin, dest, date) =>
    set({
      typedFlightOrigin: origin,
      typedFlightDestination: dest,
      typedFlightDate: date
    }),

  typedEmailTo: "",
  typedEmailSubject: "",
  setTypedEmailContext: (to, subject) =>
    set({
      typedEmailTo: to,
      typedEmailSubject: subject
    }),

  talkiniaSubRoute: "/",
  lastReportedTalkiniaPath: "/",
  setTalkiniaSubRoute: (route) => set({ talkiniaSubRoute: route }),
  reportTalkiniaPath: (route) =>
    set({ lastReportedTalkiniaPath: route, talkiniaSubRoute: route })
});
