import {
  Bot,
  Building2,
  CalendarDays,
  ClipboardCheck,
  FileCheck2,
  FileText,
  Gauge,
  HardHat,
  Inbox,
  Landmark,
  LineChart,
  ListChecks,
  Radar,
  Receipt,
  Scale,
  Settings,
  ShieldAlert,
  Users,
  Vault,
  Wrench,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  description: string;
  group?: string;
}

export const navItems: NavItem[] = [
  {
    to: "/command-center",
    label: "Command Center",
    icon: Gauge,
    description: "Group-wide compliance posture and exceptions.",
  },
  {
    to: "/my-work",
    label: "My Work",
    icon: Inbox,
    description: "Tasks, approvals and reviews assigned to you.",
  },
  {
    to: "/entities",
    label: "Entities",
    icon: Building2,
    description: "Restaurants and offices in scope, with scores.",
  },
  {
    to: "/regulatory/alerts",
    label: "Regulatory Intelligence",
    icon: Radar,
    description: "Regulatory changes and their impact assessments.",
  },
  {
    to: "/obligations",
    label: "Obligation Register",
    icon: ListChecks,
    description: "Every statutory and internal obligation, mapped to owners.",
  },
  {
    to: "/calendar",
    label: "Compliance Calendar",
    icon: CalendarDays,
    description: "Due dates, locked statutory deadlines and ageing.",
  },
  {
    to: "/evidence",
    label: "Evidence Vault",
    icon: Vault,
    description: "Hashed evidence with provenance and access history.",
  },
  {
    to: "/labour",
    label: "Labour Compliance",
    icon: Users,
    description: "PF, ESI, contract labour, BOCW and POSH.",
  },
  {
    to: "/tax",
    label: "Tax & GST",
    icon: Receipt,
    description: "GST returns, TDS and reconciliations.",
  },
  {
    to: "/secretarial",
    label: "Secretarial",
    icon: Landmark,
    description: "Board meetings, filings and statutory registers.",
  },
  {
    to: "/ehs",
    label: "EHS",
    icon: HardHat,
    description: "Environment, health and safety obligations.",
  },
  {
    to: "/qms/documents",
    label: "Document Control",
    icon: FileText,
    group: "Quality Management",
    description: "Controlled SOPs, versions and acknowledgements.",
  },
  {
    to: "/qms/capa",
    label: "CAPA",
    icon: Wrench,
    group: "Quality Management",
    description: "Corrective and preventive actions with independence checks.",
  },
  {
    to: "/qms/audits",
    label: "Internal Audit",
    icon: ClipboardCheck,
    group: "Quality Management",
    description: "Audit programme, checklists and findings.",
  },
  {
    to: "/qms/risks",
    label: "Risk Management",
    icon: ShieldAlert,
    group: "Quality Management",
    description: "Risk register, heat map and appetite.",
  },
  {
    to: "/qms/management-reviews",
    label: "Management Review",
    icon: Scale,
    group: "Quality Management",
    description: "Review inputs, decisions and downstream actions.",
  },
  {
    to: "/reports",
    label: "Reports & Analytics",
    icon: LineChart,
    description: "Board packs, trends and analytics.",
  },
  {
    to: "/ai-assistant",
    label: "AI Assistant",
    icon: Bot,
    description: "Drafts, summaries and recommendations — humans decide.",
  },
  {
    to: "/admin",
    label: "Administration",
    icon: Settings,
    description: "Users, roles, entities and configuration.",
  },
];

export const navByPath = Object.fromEntries(navItems.map((n) => [n.to, n]));
export { FileCheck2 };
