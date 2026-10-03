import { useState, type ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Bell, Bot, ChevronsLeft, ChevronsRight, CircleHelp, Menu, Moon, Plus, Search, ShieldCheck, Sun,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { navItems, type NavItem } from "@/lib/nav";
import { useAppState, useCurrentPerson } from "@/lib/app-state";
import { entities, organisation, roles, regulatoryAlerts, calendarTasks } from "@/data/kfc";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuRadioGroup,
  DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CommandPalette, quickActions } from "./CommandPalette";

function NavLinkItem({ item, collapsed, onNavigate }: { item: NavItem; collapsed: boolean; onNavigate?: (() => void) | undefined }) {
  const link = (
    <Link
      to={item.to}
      onClick={onNavigate}
      className={cn(
        "flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px] text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        collapsed && "justify-center px-0",
      )}
      activeProps={{ className: "bg-sidebar-accent text-sidebar-accent-foreground font-medium [&>svg]:text-sidebar-primary" }}
    >
      <item.icon className="size-4 shrink-0" />
      {!collapsed && <span className="truncate">{item.label}</span>}
    </Link>
  );
  if (!collapsed) return link;
  return (
    <Tooltip>
      <TooltipTrigger asChild>{link}</TooltipTrigger>
      <TooltipContent side="right">{item.label}</TooltipContent>
    </Tooltip>
  );
}

function SidebarBody({ collapsed, onNavigate }: { collapsed: boolean; onNavigate?: (() => void) | undefined }) {
  const top = navItems.filter((n) => !n.group);
  const qms = navItems.filter((n) => n.group === "Quality Management");
  const before = top.slice(0, 11);
  const after = top.slice(11);
  return (
    <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 py-3">
      {before.map((n) => <NavLinkItem key={n.to} item={n} collapsed={collapsed} onNavigate={onNavigate} />)}
      {!collapsed ? (
        <div className="px-2.5 pb-1 pt-4 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/50">Quality Management</div>
      ) : <div className="my-2 border-t border-sidebar-border" />}
      {qms.map((n) => <NavLinkItem key={n.to} item={n} collapsed={collapsed} onNavigate={onNavigate} />)}
      <div className="my-2 border-t border-sidebar-border" />
      {after.map((n) => <NavLinkItem key={n.to} item={n} collapsed={collapsed} onNavigate={onNavigate} />)}
    </nav>
  );
}

function Brand({ collapsed }: { collapsed: boolean }) {
  return (
    <div className={cn("flex h-14 items-center gap-2 border-b border-sidebar-border px-4", collapsed && "justify-center px-0")}>
      <div className="grid size-7 place-items-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground"><ShieldCheck className="size-4" /></div>
      {!collapsed && (
        <div className="leading-tight">
          <div className="text-sm font-semibold text-sidebar-accent-foreground">Quantbit</div>
          <div className="text-[10px] uppercase tracking-wider text-sidebar-foreground/60">Compliance AI</div>
        </div>
      )}
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const s = useAppState();
  const me = useCurrentPerson();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const role = roles.find((r) => r.id === s.roleId)!;
  const notifCount = regulatoryAlerts.filter((a) => a.status === "awaiting-impact-assessment").length + calendarTasks.filter((t) => t.status === "overdue").length;

  return (
    <TooltipProvider delayDuration={150}>
      <div className="flex min-h-screen bg-background">
        <aside className={cn("sticky top-0 hidden h-screen shrink-0 flex-col bg-sidebar transition-[width] duration-200 md:flex", s.collapsed ? "w-16" : "w-64")}>
          <Brand collapsed={s.collapsed} />
          <SidebarBody collapsed={s.collapsed} />
          <button onClick={() => s.setCollapsed(!s.collapsed)} className="flex h-10 items-center justify-center gap-2 border-t border-sidebar-border text-xs text-sidebar-foreground/70 hover:text-sidebar-accent-foreground" aria-label="Toggle sidebar">
            {s.collapsed ? <ChevronsRight className="size-4" /> : <><ChevronsLeft className="size-4" /> Collapse</>}
          </button>
        </aside>

        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent side="left" className="w-72 border-sidebar-border bg-sidebar p-0">
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <div className="flex h-full flex-col"><Brand collapsed={false} /><SidebarBody collapsed={false} onNavigate={() => setMobileOpen(false)} /></div>
          </SheetContent>
        </Sheet>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b bg-surface/90 px-3 backdrop-blur md:px-5">
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen(true)} aria-label="Open navigation"><Menu className="size-5" /></Button>

            <div className="hidden items-center gap-2 lg:flex">
              <span className="rounded-md border px-2.5 py-1.5 text-xs font-medium">{organisation.name}</span>
              <Select value={s.entityId} onValueChange={s.setEntityId}>
                <SelectTrigger className="h-8 w-48 text-xs" aria-label="Entity"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All entities ({entities.length})</SelectItem>
                  {entities.map((e) => <SelectItem key={e.id} value={e.id}>{e.shortName}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={s.period} onValueChange={s.setPeriod}>
                <SelectTrigger className="h-8 w-28 text-xs" aria-label="Period"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Sep-2026", "Q2 FY27", "H1 FY27", "FY26"].map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <button onClick={() => s.setPaletteOpen(true)} className="ml-auto flex h-8 w-full max-w-xs items-center gap-2 rounded-md border bg-background px-2.5 text-xs text-muted-foreground hover:border-border-strong lg:ml-4">
              <Search className="size-3.5" /> <span className="flex-1 text-left">Search records, people, actions…</span>
              <kbd className="rounded border bg-muted px-1 font-mono text-[10px]">⌘K</kbd>
            </button>

            <div className="flex items-center gap-1 lg:ml-auto">
              <DropdownMenu>
                <DropdownMenuTrigger asChild><Button size="sm" className="h-8 gap-1"><Plus className="size-4" /><span className="hidden sm:inline">Create</span></Button></DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {quickActions.slice(0, 7).map((a) => (
                    <DropdownMenuItem key={a.label} onSelect={() => navigate({ to: a.to })}><a.icon className="size-4" />{a.label}</DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="ghost" size="icon" className="relative size-8" aria-label={`${notifCount} notifications`} onClick={() => navigate({ to: "/my-work" })}>
                <Bell className="size-4" />
                <span className="absolute -right-0.5 -top-0.5 grid min-w-4 place-items-center rounded-full bg-critical px-1 text-[10px] font-semibold text-critical-foreground">{notifCount}</span>
              </Button>
              <Button variant="ghost" size="icon" className="size-8 text-ai" aria-label="AI assistant" onClick={() => navigate({ to: "/ai-assistant" })}><Bot className="size-4" /></Button>
              <Button variant="ghost" size="icon" className="hidden size-8 sm:inline-flex" aria-label="Toggle theme" onClick={() => s.setDark(!s.dark)}>{s.dark ? <Sun className="size-4" /> : <Moon className="size-4" />}</Button>
              <Button variant="ghost" size="icon" className="hidden size-8 sm:inline-flex" aria-label="Help"><CircleHelp className="size-4" /></Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="ml-1 flex items-center gap-2 rounded-md px-1.5 py-1 hover:bg-muted">
                    <span className="grid size-7 place-items-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">{me.initials}</span>
                    <span className="hidden text-left leading-tight xl:block">
                      <span className="block text-xs font-medium">{me.name}</span>
                      <span className="block text-[10px] text-muted-foreground">{role.name}</span>
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  <DropdownMenuLabel>{me.name}<div className="text-xs font-normal text-muted-foreground">{me.title}</div></DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>Preview as role: {role.name}</DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="max-h-80 overflow-y-auto">
                      <DropdownMenuRadioGroup value={s.roleId} onValueChange={(v) => s.setRoleId(v as typeof s.roleId)}>
                        {roles.map((r) => <DropdownMenuRadioItem key={r.id} value={r.id}>{r.name}</DropdownMenuRadioItem>)}
                      </DropdownMenuRadioGroup>
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                  <DropdownMenuItem onSelect={() => s.setDark(!s.dark)}>{s.dark ? "Light" : "Dark"} theme</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          {role.watermarkExports && (
            <div className="border-b bg-attention-soft px-5 py-1.5 text-xs text-attention-foreground">Read-only external auditor view — all exports are watermarked.</div>
          )}
          <main className="flex-1 px-4 py-5 md:px-6 lg:px-8">{children}</main>
        </div>
        <CommandPalette />
      </div>
    </TooltipProvider>
  );
}
