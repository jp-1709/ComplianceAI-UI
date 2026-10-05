import { useEffect, type ReactNode } from "react";
import { create } from "zustand";
import { people, roles } from "@/data/kfc";
import type { Permission, RoleId } from "@/data/types";

interface AppState {
  roleId: RoleId;
  setRoleId: (roleId: RoleId) => void;
  entityId: string;
  setEntityId: (entityId: string) => void;
  period: string;
  setPeriod: (period: string) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  dark: boolean;
  setDark: (dark: boolean) => void;
  paletteOpen: boolean;
  setPaletteOpen: (paletteOpen: boolean) => void;
  can: (permission: Permission) => boolean;
}

export const useAppState = create<AppState>((set, get) => ({
  roleId: "compliance-officer",
  setRoleId: (roleId) => set({ roleId }),
  entityId: "all",
  setEntityId: (entityId) => set({ entityId }),
  period: "Q2 FY27",
  setPeriod: (period) => set({ period }),
  collapsed: false,
  setCollapsed: (collapsed) => set({ collapsed }),
  dark: false,
  setDark: (dark) => set({ dark }),
  paletteOpen: false,
  setPaletteOpen: (paletteOpen) => set({ paletteOpen }),
  can: (permission) => {
    const roleId = get().roleId;
    if (roleId === "compliance-officer" || roleId === "system-admin") return true;
    return roles.find((role) => role.id === roleId)?.permissions.includes(permission) ?? false;
  },
}));

/** Installs browser-only global behavior while the store remains usable outside React. */
export function AppStateProvider({ children }: { children: ReactNode }) {
  const dark = useAppState((state) => state.dark);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        useAppState.setState((state) => ({ paletteOpen: !state.paletteOpen }));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  return <>{children}</>;
}

export function useCurrentPerson() {
  const roleId = useAppState((state) => state.roleId);
  return people.find((person) => person.roleId === roleId) ?? people[0]!;
}
