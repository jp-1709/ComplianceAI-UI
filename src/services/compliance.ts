import {
  activityFeed,
  calendarTasks,
  capas,
  entities,
  evidenceRecords,
  findings,
  managementReviews,
  obligations,
  organisation,
  postureTrend,
  regulatoryAlerts,
  risks,
  taskAgeing,
} from "@/data/kfc";
import { daysUntil } from "@/lib/date";

const wait = (ms = 420) => new Promise((resolve) => setTimeout(resolve, ms));

export interface DashboardIssue {
  id: string;
  title: string;
  detail: string;
  kind: "work" | "risk" | "finding" | "capa" | "evidence" | "change";
  severity: "critical" | "major" | "moderate" | "minor";
  to: string;
  filter: string;
}

export interface CommandCenterData {
  organisation: typeof organisation;
  overallScore: number;
  scoreDelta: number;
  postureTrend: typeof postureTrend;
  entityScores: typeof entities;
  due: { seven: number; thirty: number; ninety: number };
  issueCounts: Record<DashboardIssue["kind"], number>;
  priorityIssues: DashboardIssue[];
  risks: typeof risks;
  taskAgeing: typeof taskAgeing;
  activity: typeof activityFeed;
  decisions: (typeof managementReviews)[number]["outputs"];
  lastReviewedOn: string;
}

const inScope = (entityId: string, selected: string) => selected === "all" || entityId === selected;

export async function getCommandCenter(selectedEntityId = "all"): Promise<CommandCenterData> {
  await wait();
  const scopedEntities = entities.filter((x) => inScope(x.id, selectedEntityId));
  const scopedObligations = obligations.filter((x) => inScope(x.entityId, selectedEntityId));
  const scopedTasks = calendarTasks.filter((x) => inScope(x.entityId, selectedEntityId));
  const scopedRisks = risks.filter((x) => inScope(x.entityId, selectedEntityId));
  const scopedFindings = findings.filter((x) => inScope(x.entityId, selectedEntityId));
  const scopedCapas = capas.filter((x) => inScope(x.entityId, selectedEntityId));
  const scopedEvidence = evidenceRecords.filter((x) => inScope(x.entityId, selectedEntityId));
  const scopedAlerts = regulatoryAlerts.filter(
    (x) => selectedEntityId === "all" || x.affectedEntityIds.includes(selectedEntityId),
  );

  const overdueWork = scopedTasks.filter(
    (x) => x.status === "overdue" && x.priority === "critical",
  );
  const aboveAppetite = scopedRisks.filter((x) => x.likelihood * x.impact > x.appetiteThreshold);
  const majorFindings = scopedFindings.filter(
    (x) => x.severity === "major" && x.status !== "closed",
  );
  const highCapas = scopedCapas.filter(
    (x) =>
      (x.severity === "critical" || x.severity === "major") &&
      x.status !== "closed" &&
      x.status !== "verified",
  );
  const expiringEvidence = scopedEvidence.filter(
    (x) => x.expiresOn && daysUntil(x.expiresOn) >= 0 && daysUntil(x.expiresOn) <= 45,
  );
  const awaitingChanges = scopedAlerts.filter((x) => x.status === "awaiting-impact-assessment");

  const severityOrder = { critical: 0, major: 1, moderate: 2, minor: 3 } as const;
  const priorityIssues: DashboardIssue[] = [
    ...overdueWork.map((x) => ({
      id: x.id,
      title: x.title,
      detail: `${x.ageingDays} days overdue`,
      kind: "work" as const,
      severity: x.priority,
      to: "/my-work",
      filter: "critical-overdue",
    })),
    ...aboveAppetite.map((x) => ({
      id: x.id,
      title: x.title,
      detail: `Score ${x.likelihood * x.impact} · appetite ${x.appetiteThreshold}`,
      kind: "risk" as const,
      severity: x.likelihood * x.impact >= 16 ? ("critical" as const) : ("major" as const),
      to: "/qms/risks",
      filter: "above-appetite",
    })),
    ...majorFindings.map((x) => ({
      id: x.id,
      title: x.title,
      detail: `${x.clause} · open Major finding`,
      kind: "finding" as const,
      severity: x.severity,
      to: "/qms/audits",
      filter: "open-major-findings",
    })),
    ...highCapas.map((x) => ({
      id: x.id,
      title: x.title,
      detail: `${x.stage} · due ${x.dueDate}`,
      kind: "capa" as const,
      severity: x.severity,
      to: "/qms/capa",
      filter: "high-severity-open",
    })),
    ...expiringEvidence.map((x) => ({
      id: x.id,
      title: x.title,
      detail: `Expires ${x.expiresOn}`,
      kind: "evidence" as const,
      severity: daysUntil(x.expiresOn!) <= 14 ? ("major" as const) : ("moderate" as const),
      to: "/evidence",
      filter: "expiring-soon",
    })),
    ...awaitingChanges.map((x) => ({
      id: x.id,
      title: x.title,
      detail: `${x.authority} · impact assessment required`,
      kind: "change" as const,
      severity: x.impact,
      to: "/regulatory/alerts",
      filter: "awaiting-impact-assessment",
    })),
  ].sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  const dueIn = (start: number, end: number) =>
    scopedObligations.filter((x) => {
      const days = daysUntil(x.dueDate);
      return days >= start && days <= end;
    }).length;
  const divisor = Math.max(1, scopedEntities.length);

  return {
    organisation,
    overallScore: Math.round(scopedEntities.reduce((sum, x) => sum + x.score, 0) / divisor),
    scoreDelta: Number((scopedEntities.reduce((sum, x) => sum + x.trend, 0) / divisor).toFixed(1)),
    postureTrend,
    entityScores: scopedEntities.toSorted((a, b) => b.score - a.score),
    due: { seven: dueIn(0, 7), thirty: dueIn(8, 30), ninety: dueIn(31, 90) },
    issueCounts: {
      work: overdueWork.length,
      risk: aboveAppetite.length,
      finding: majorFindings.length,
      capa: highCapas.length,
      evidence: expiringEvidence.length,
      change: awaitingChanges.length,
    },
    priorityIssues,
    risks: scopedRisks,
    taskAgeing,
    activity: activityFeed,
    decisions: managementReviews[0]?.outputs ?? [],
    lastReviewedOn: managementReviews[0]?.heldOn ?? "—",
  };
}

export async function exportBoardPack(): Promise<void> {
  await wait(850);
  const content = [
    "QUANTBIT COMPLIANCE AI — BOARD POSTURE PACK",
    "KFC India Demo",
    "Generated from the Executive Command Center",
    "Preview export: production packs include charts, evidence links and audit watermarks.",
  ].join("\n\n");
  const url = URL.createObjectURL(new Blob([content], { type: "application/pdf" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "KFC-India-Compliance-Board-Pack.pdf";
  anchor.click();
  URL.revokeObjectURL(url);
}
