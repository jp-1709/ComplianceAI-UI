import {
  audits,
  calendarTasks,
  capas,
  entities,
  evidenceRecords,
  obligations,
  people,
  regulatoryAlerts,
  risks,
} from "@/data/kfc";
import { daysUntil } from "@/lib/date";
import type { CalendarTask, Entity, ModuleId, Severity, Status } from "@/data/types";

const wait = (ms = 340) => new Promise((resolve) => setTimeout(resolve, ms));

export type WorkTab =
  | "assigned"
  | "approval"
  | "evidence"
  | "overdue"
  | "week"
  | "watching"
  | "delegated"
  | "completed";
export type BoardState = "To do" | "In progress" | "In review" | "Done";

export interface WorkItem extends CalendarTask {
  entityName: string;
  ownerName: string;
  reviewerName: string;
  tabs: WorkTab[];
  boardState: BoardState;
  slaHours: number;
  evidenceComplete: number;
  evidenceRequired: number;
}

export interface NotificationItem {
  id: string;
  type: "Regulatory" | "Deadline" | "Evidence" | "Approval" | "Escalation";
  title: string;
  detail: string;
  at: string;
  unread: boolean;
  severity: Severity;
  to: string;
  filter: string;
}

export interface OfficerCommandData {
  today: WorkItem[];
  alerts: typeof regulatoryAlerts;
  unassignedObligations: typeof obligations;
  evidenceGaps: WorkItem[];
  awaitingReview: WorkItem[];
  upcomingFilings: typeof obligations;
  escalations: WorkItem[];
}

export interface EntityOverviewData {
  entity: Entity;
  moduleHealth: { module: ModuleId; score: number }[];
  licences: typeof evidenceRecords;
  obligations: typeof obligations;
  evidence: typeof evidenceRecords;
  risks: typeof risks;
  audits: typeof audits;
  capas: typeof capas;
  incidents: typeof capas;
  tasks: WorkItem[];
}

function toWorkItem(task: CalendarTask, index: number): WorkItem {
  const due = daysUntil(task.dueDate);
  const boardState: BoardState =
    task.status === "compliant" || task.status === "closed"
      ? "Done"
      : task.status === "attention"
        ? "In review"
        : task.status === "in-progress"
          ? "In progress"
          : "To do";
  const tabs: WorkTab[] = ["assigned"];
  if (index % 3 === 0 || task.status === "attention") tabs.push("approval");
  if (index % 2 === 0) tabs.push("evidence");
  if (task.status === "overdue") tabs.push("overdue");
  if (due >= 0 && due <= 7) tabs.push("week");
  if (index % 4 === 0) tabs.push("watching");
  if (index % 5 === 0) tabs.push("delegated");
  if (boardState === "Done") tabs.push("completed");
  return {
    ...task,
    entityName: entities.find((entity) => entity.id === task.entityId)?.shortName ?? task.entityId,
    ownerName: people.find((person) => person.id === task.ownerId)?.name ?? task.ownerId,
    reviewerName: index % 2 === 0 ? "Ananya Rao" : "Kavita Iyer",
    tabs: [...new Set(tabs)],
    boardState,
    slaHours: task.status === "overdue" ? -task.ageingDays * 24 : Math.max(4, due * 24),
    evidenceRequired: 2,
    evidenceComplete: index % 3 === 0 ? 1 : 2,
  };
}

export async function getMyWork(): Promise<WorkItem[]> {
  await wait();
  return calendarTasks.map(toWorkItem);
}

export async function moveWorkItem(id: string, boardState: BoardState) {
  await wait(450);
  const task = calendarTasks.find((item) => item.id === id);
  if (!task) throw new Error("Work item not found");
  return { ...toWorkItem(task, calendarTasks.indexOf(task)), boardState };
}

export async function bulkWorkAction(ids: string[], action: "assign" | "remind") {
  await wait(600);
  return { ids, action, completedAt: new Date().toISOString() };
}

export async function getOfficerCommandCenter(): Promise<OfficerCommandData> {
  await wait();
  const work = calendarTasks.map(toWorkItem);
  return {
    today: work
      .filter((item) => item.status === "overdue" || daysUntil(item.dueDate) <= 7)
      .slice(0, 6),
    alerts: regulatoryAlerts.filter((alert) => alert.status === "awaiting-impact-assessment"),
    unassignedObligations: obligations.filter((_item, index) => index % 6 === 0),
    evidenceGaps: work.filter((item) => item.evidenceComplete < item.evidenceRequired),
    awaitingReview: work.filter((item) => item.tabs.includes("approval")),
    upcomingFilings: obligations.filter(
      (item) => daysUntil(item.dueDate) >= 0 && daysUntil(item.dueDate) <= 30,
    ),
    escalations: work.filter((item) => item.status === "overdue" && item.priority !== "minor"),
  };
}

export async function getNotifications(): Promise<NotificationItem[]> {
  await wait();
  const alertItems: NotificationItem[] = regulatoryAlerts
    .filter((item) => item.status === "awaiting-impact-assessment")
    .map((item) => ({
      id: `N-${item.id}`,
      type: "Regulatory",
      title: item.title,
      detail: `${item.authority} · impact assessment required`,
      at: item.publishedOn,
      unread: true,
      severity: item.impact,
      to: "/regulatory/alerts",
      filter: "awaiting-impact-assessment",
    }));
  const taskItems: NotificationItem[] = calendarTasks
    .filter((item) => item.status === "overdue")
    .map((item) => ({
      id: `N-${item.id}`,
      type: item.priority === "critical" ? "Escalation" : "Deadline",
      title: item.title,
      detail: `${item.ageingDays} days overdue · owner escalation active`,
      at: item.dueDate,
      unread: item.priority === "critical",
      severity: item.priority,
      to: "/my-work",
      filter: "overdue",
    }));
  const evidenceItems: NotificationItem[] = evidenceRecords
    .filter(
      (item) => item.expiresOn && daysUntil(item.expiresOn) >= 0 && daysUntil(item.expiresOn) <= 45,
    )
    .map((item) => ({
      id: `N-${item.id}`,
      type: "Evidence",
      title: `${item.title} expires soon`,
      detail: `Renewal evidence required by ${item.expiresOn}`,
      at: item.issuedOn,
      unread: true,
      severity: daysUntil(item.expiresOn!) <= 14 ? "major" : "moderate",
      to: "/evidence",
      filter: "expiring-soon",
    }));
  const approvals: NotificationItem[] = calendarTasks
    .filter((_item, index) => index % 3 === 0)
    .slice(0, 4)
    .map((item) => ({
      id: `N-APR-${item.id}`,
      type: "Approval",
      title: `${item.title} is awaiting your review`,
      detail: "Evidence submitted · SLA clock running",
      at: "03-Oct-2026 14:30",
      unread: false,
      severity: item.priority,
      to: "/my-work",
      filter: "approval",
    }));
  return [...alertItems, ...taskItems, ...evidenceItems, ...approvals];
}

export async function getEntityOverview(id: string): Promise<EntityOverviewData | null> {
  await wait();
  const entity = entities.find((item) => item.id === id);
  if (!entity) return null;
  const entityObligations = obligations.filter((item) => item.entityId === id);
  const entityEvidence = evidenceRecords.filter((item) => item.entityId === id);
  const entityRisks = risks.filter((item) => item.entityId === id);
  const entityAudits = audits.filter((item) => item.entityId === id);
  const entityCapas = capas.filter((item) => item.entityId === id);
  const modules: ModuleId[] = ["labour", "tax", "secretarial", "ehs", "qms", "fssai"];
  return {
    entity,
    moduleHealth: modules.map((module, index) => ({
      module,
      score: Math.max(48, Math.min(96, entity.score + [3, -4, 5, 1, -2, -6][index]!)),
    })),
    licences: entityEvidence.filter((item) => item.type === "Certificate"),
    obligations: entityObligations,
    evidence: entityEvidence,
    risks: entityRisks,
    audits: entityAudits,
    capas: entityCapas,
    incidents: entityCapas.filter((item) => item.source === "Incident"),
    tasks: calendarTasks
      .filter((item) => item.entityId === id)
      .map((item) => toWorkItem(item, calendarTasks.indexOf(item))),
  };
}

export function statusFromBoardState(state: BoardState): Status {
  return state === "Done"
    ? "closed"
    : state === "In review"
      ? "attention"
      : state === "In progress"
        ? "in-progress"
        : "draft";
}
