import { createContext } from "react";

export type SidebarNavItem = {
  id: string;
  label?: string;
};

export type SidebarState = {
  activeItemId: string | null;
};

export type SidebarContextValue = {
  state: SidebarState;
  setActive: (id: string) => void;
  clearActive: () => void;
};

export const SidebarContext =
  createContext<SidebarContextValue | null>(null);
