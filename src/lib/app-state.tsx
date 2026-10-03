import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { people, roles } from "@/data/kfc";
import type { Permission, RoleId } from "@/data/types";

interface AppState {
  roleId: RoleId;
  setRoleId: (r: RoleId) => void;
  entityId: string;
  setEntityId: (e: string) => void;
  period: string;
  setPeriod: (p: string) => void;
  collapsed: boolean;
  setCollapsed: (c: boolean) => void;
  dark: boolean;
  setDark: (d: boolean) => void;
  paletteOpen: boolean;
  setPaletteOpen: (o: boolean) => void;
  can: (p: Permission) => boolean;
}

const Ctx = createContext<AppState | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [roleId, setRoleId] = useState<RoleId>("compliance-officer");
  const [entityId, setEntityId] = useState("all");
  const [period, setPeriod] = useState("Q2 FY27");
  const [collapsed, setCollapsed] = useState(false);
  const [dark, setDark] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const value = useMemo<AppState>(() => {
    const role = roles.find((r) => r.id === roleId);
    const base: Permission[] = role?.permissions ?? [];
    const all = roleId === "compliance-officer" || roleId === "system-admin";
    return {
      roleId, setRoleId, entityId, setEntityId, period, setPeriod,
      collapsed, setCollapsed, dark, setDark, paletteOpen, setPaletteOpen,
      can: (p) => all || base.includes(p),
    };
  }, [roleId, entityId, period, collapsed, dark, paletteOpen]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAppState() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAppState outside provider");
  return v;
}

export function useCurrentPerson() {
  // always defined: people list is non-empty
  const { roleId } = useAppState();
  return people.find((p) => p.roleId === roleId) ?? people[0]!;
}
