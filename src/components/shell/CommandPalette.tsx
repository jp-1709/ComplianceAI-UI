import { useNavigate } from "@tanstack/react-router";
import { AlertTriangle, CalendarPlus, ClipboardCheck, FilePlus2, ShieldPlus, Siren, Upload, Wrench, Clock } from "lucide-react";
import {
  CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator,
} from "@/components/ui/command";
import { useAppState } from "@/lib/app-state";
import { navItems } from "@/lib/nav";
import {
  calendarTasks, capas, controlledDocuments, entities, evidenceRecords, findings, obligations, people, regulations, regulatoryAlerts, risks,
} from "@/data/kfc";

export const quickActions = [
  { label: "Create obligation", icon: FilePlus2, to: "/obligations" },
  { label: "Upload evidence", icon: Upload, to: "/evidence" },
  { label: "Raise CAPA", icon: Wrench, to: "/qms/capa" },
  { label: "Report incident", icon: Siren, to: "/ehs" },
  { label: "Add risk", icon: ShieldPlus, to: "/qms/risks" },
  { label: "Start audit", icon: ClipboardCheck, to: "/qms/audits" },
  { label: "Schedule management review", icon: CalendarPlus, to: "/qms/management-reviews" },
  { label: "Open my overdue tasks", icon: Clock, to: "/my-work" },
];

export function CommandPalette() {
  const { paletteOpen, setPaletteOpen } = useAppState();
  const navigate = useNavigate();
  const go = (to: string) => { setPaletteOpen(false); navigate({ to }); };

  const groups: { heading: string; to: string; items: { id: string; label: string }[] }[] = [
    { heading: "Obligations", to: "/obligations", items: obligations.map((o) => ({ id: o.id, label: o.title })) },
    { heading: "Regulations", to: "/regulatory/alerts", items: regulations.map((r) => ({ id: r.authority, label: r.title })) },
    { heading: "Regulatory notices", to: "/regulatory/alerts", items: regulatoryAlerts.map((r) => ({ id: r.id, label: r.title })) },
    { heading: "Tasks", to: "/calendar", items: calendarTasks.map((t) => ({ id: t.id, label: t.title })) },
    { heading: "Evidence", to: "/evidence", items: evidenceRecords.map((e) => ({ id: e.id, label: e.title })) },
    { heading: "Documents", to: "/qms/documents", items: controlledDocuments.map((d) => ({ id: d.code, label: d.title })) },
    { heading: "CAPAs", to: "/qms/capa", items: capas.map((c) => ({ id: c.id, label: c.title })) },
    { heading: "Risks", to: "/qms/risks", items: risks.map((r) => ({ id: r.id, label: r.title })) },
    { heading: "Findings", to: "/qms/audits", items: findings.map((f) => ({ id: f.id, label: f.title })) },
    { heading: "People", to: "/admin", items: people.map((p) => ({ id: p.initials, label: `${p.name} — ${p.title}` })) },
    { heading: "Entities", to: "/entities", items: entities.map((e) => ({ id: e.shortName, label: e.name })) },
  ];

  return (
    <CommandDialog open={paletteOpen} onOpenChange={setPaletteOpen}>
      <CommandInput placeholder="Search obligations, CAPAs, evidence, people… or type an action" />
      <CommandList className="max-h-[420px]">
        <CommandEmpty>No matching records.</CommandEmpty>
        <CommandGroup heading="Quick actions">
          {quickActions.map((a) => (
            <CommandItem key={a.label} onSelect={() => go(a.to)}><a.icon className="size-4" />{a.label}</CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Go to">
          {navItems.map((n) => <CommandItem key={n.to} onSelect={() => go(n.to)}><n.icon className="size-4" />{n.label}</CommandItem>)}
        </CommandGroup>
        <CommandSeparator />
        {groups.map((g) => (
          <CommandGroup key={g.heading} heading={g.heading}>
            {g.items.map((i) => (
              <CommandItem key={g.heading + i.id + i.label} value={`${i.id} ${i.label}`} onSelect={() => go(g.to)}>
                <span className="w-24 shrink-0 font-mono text-[11px] text-muted-foreground">{i.id}</span>
                <span className="truncate">{i.label}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
      <div className="flex items-center gap-1.5 border-t px-3 py-2 text-[11px] text-muted-foreground"><AlertTriangle className="size-3" /> Results respect your role's access.</div>
    </CommandDialog>
  );
}
