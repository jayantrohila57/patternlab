import { useState, useCallback, type ReactNode } from "react";
import { SidebarContext, type SidebarState } from "./sidebar.context";

type SidebarProviderProps = {
  children: ReactNode;
  defaultActiveId?: string | null;
};

export function SidebarProvider({
  children,
  defaultActiveId = null,
}: SidebarProviderProps) {
  const [state, setState] = useState<SidebarState>({
    activeItemId: defaultActiveId,
  });

  const setActive = useCallback((id: string) => {
    setState({ activeItemId: id });
  }, []);

  const clearActive = useCallback(() => {
    setState({ activeItemId: null });
  }, []);

  return (
    <SidebarContext.Provider value={{ state, setActive, clearActive }}>
      {children}
    </SidebarContext.Provider>
  );
}
