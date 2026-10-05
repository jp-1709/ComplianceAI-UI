import {
  calendarTasks,
  entities,
  evidenceRecords,
  obligations,
  people,
  regulations,
  regulatoryAlerts,
  risks,
} from "@/data/kfc";
import type { CalendarTask, EvidenceRecord, Obligation, RegulatoryAlert } from "@/data/types";

const wait = (ms = 360) => new Promise((resolve) => setTimeout(resolve, ms));

export interface RegulatoryAlertView extends RegulatoryAlert {
  jurisdiction: string;
  effectiveOn: string;
  materiality: "High" | "Medium" | "Low";
  aiSummary: string;
  sources: { label: string; citation: string }[];
  potentialGaps: string[];
}

export interface ObligationView extends Obligation {
  entityName: string;
  ownerName: string;
  regulationTitle: string;
  legalCitation: string;
  plainLanguage: string;
  applicability: string;
  dueDateRule: string;
  evidenceRequirements: string[];
  isoMappings: string[];
  controls: string[];
  versions: { version: string; effectiveFrom: string; changedBy: string; note: string }[];
}

export interface CalendarTaskView extends CalendarTask {
  entityName: string;
  ownerName: string;
  reviewerName: string;
  statutoryLocked: boolean;
  checklist: { label: string; complete: boolean }[];
  evidenceRequired: string[];
  evidenceSubmitted: string[];
  escalation: string;
}

export interface EvidenceView extends EvidenceRecord {
  entityName: string;
  ownerName: string;
  sensitivity: "Internal" | "Confidential" | "Restricted";
  retention: string;
}

const alertExtras: Record<
  string,
  Pick<
    RegulatoryAlertView,
    "jurisdiction" | "effectiveOn" | "materiality" | "aiSummary" | "sources" | "potentialGaps"
  >
> = {
  "RA-2026-041": {
    jurisdiction: "India · all GST registrations",
    effectiveOn: "01-Oct-2026",
    materiality: "High",
    aiSummary:
      "The change increases GSTIN-level evidence expectations for ITC reversals and makes reconciliation exceptions easier for CBIC to scrutinise.",
    sources: [
      { label: "CBIC Notification 18/2026", citation: "Rule 88D and GSTR-3B Table 4" },
      { label: "GST Portal advisory", citation: "Advisory dated 22-Sep-2026" },
    ],
    potentialGaps: [
      "Bengaluru variance workflow has no documented reviewer",
      "GSTR-2B reconciliation evidence is not linked at GSTIN level",
    ],
  },
  "RA-2026-038": {
    jurisdiction: "Telangana",
    effectiveOn: "01-Oct-2026",
    materiality: "High",
    aiSummary:
      "Occupier counter-signature is now a time-bound control and should become an explicit obligation checkpoint.",
    sources: [{ label: "TSPCB Circular 14/2026", citation: "Paragraph 4" }],
    potentialGaps: [
      "Hyderabad Q2 report is unsigned",
      "SOP-EHS-009 does not state the seven-day window",
    ],
  },
  "RA-2026-033": {
    jurisdiction: "Maharashtra",
    effectiveOn: "08-Sep-2026",
    materiality: "Medium",
    aiSummary:
      "Principal employers need a defensible contractor pack before fit-out access is permitted.",
    sources: [
      {
        label: "Maharashtra Labour Department drive note",
        citation: "BOCW enforcement note 2026/33",
      },
    ],
    potentialGaps: [
      "Pune contractor registration copy is missing",
      "Safety induction gate is not consistently evidenced",
    ],
  },
};

function toAlert(alert: RegulatoryAlert): RegulatoryAlertView {
  const fallback = {
    jurisdiction: "India",
    effectiveOn: alert.publishedOn,
    materiality:
      alert.impact === "critical" || alert.impact === "major"
        ? ("High" as const)
        : ("Low" as const),
    aiSummary: alert.summary,
    sources: [{ label: alert.authority, citation: `Notice ${alert.id}` }],
    potentialGaps: ["Applicability confirmation is pending"],
  };
  return { ...alert, ...(alertExtras[alert.id] ?? fallback) };
}

function toObligation(item: Obligation): ObligationView {
  const regulation = regulations.find((x) => x.id === item.regulationId)!;
  return {
    ...item,
    entityName: entities.find((x) => x.id === item.entityId)?.name ?? item.entityId,
    ownerName: people.find((x) => x.id === item.ownerId)?.name ?? item.ownerId,
    regulationTitle: regulation.title,
    legalCitation: `${regulation.title} · applicable rules and prescribed form`,
    plainLanguage: `Complete and evidence “${item.title}” for the applicable entity within the prescribed statutory window. Retain filing acknowledgement and reviewer evidence.`,
    applicability: `Applies to ${entities.find((x) => x.id === item.entityId)?.name ?? "the entity"} based on its registration, operations and jurisdiction.`,
    dueDateRule: item.statutoryLocked
      ? `System-calculated statutory date for ${item.frequency.toLowerCase()} compliance; only a legal administrator can change the governing rule.`
      : `Operational target set by the control owner; may be rescheduled with reason and audit trail.`,
    evidenceRequirements: [
      "Completed return or control record",
      "Acknowledgement / reviewer sign-off",
      "Supporting reconciliation or source register",
    ],
    isoMappings:
      item.module === "qms"
        ? ["ISO 9001:2015 cl. 7.5", "ISO 9001:2015 cl. 9.1"]
        : ["ISO 9001:2015 cl. 4.2", "ISO 9001:2015 cl. 7.5"],
    controls: ["Named accountable owner", "Due-date monitoring", "Evidence completeness review"],
    versions: [
      {
        version: "v2.1",
        effectiveFrom: "01-Sep-2026",
        changedBy: "Ananya Rao",
        note: "Added entity evidence mapping.",
      },
      {
        version: "v2.0",
        effectiveFrom: "01-Apr-2026",
        changedBy: "Kavita Iyer",
        note: "Annual control review.",
      },
    ],
  };
}

function toTask(task: CalendarTask): CalendarTaskView {
  const obligation = obligations.find((x) => x.id === task.obligationId)!;
  return {
    ...task,
    entityName: entities.find((x) => x.id === task.entityId)?.shortName ?? task.entityId,
    ownerName: people.find((x) => x.id === task.ownerId)?.name ?? task.ownerId,
    reviewerName: task.priority === "critical" ? "Ananya Rao" : "Kavita Iyer",
    statutoryLocked: obligation.statutoryLocked,
    checklist: [
      { label: "Validate source records", complete: task.status !== "in-progress" },
      { label: "Perform control / prepare filing", complete: task.status === "compliant" },
      { label: "Reviewer sign-off", complete: false },
    ],
    evidenceRequired: ["Primary compliance record", "Reviewer acknowledgement"],
    evidenceSubmitted: obligation.evidenceIds.slice(0, task.status === "overdue" ? 1 : 2),
    escalation:
      task.status === "overdue"
        ? `Escalated to Entity Manager · ${task.ageingDays} days overdue`
        : "No active escalation",
  };
}

function toEvidence(item: EvidenceRecord): EvidenceView {
  return {
    ...item,
    entityName: entities.find((x) => x.id === item.entityId)?.shortName ?? item.entityId,
    ownerName: people.find((x) => x.id === item.ownerId)?.name ?? item.ownerId,
    sensitivity:
      item.type === "Minutes" ? "Restricted" : item.type === "Return" ? "Confidential" : "Internal",
    retention:
      item.module === "tax"
        ? "8 financial years"
        : item.module === "secretarial"
          ? "Permanent"
          : "7 years after expiry",
  };
}

export async function getRegulatoryWorkspace() {
  await wait();
  return regulatoryAlerts.map(toAlert);
}
export async function updateAlertDecision(
  id: string,
  decision: "approved" | "rejected" | "analysis-requested",
) {
  await wait(520);
  return { id, decision, at: new Date().toISOString() };
}
export async function getObligations() {
  await wait();
  return obligations.map(toObligation);
}
export async function getObligation(id: string) {
  await wait(240);
  const item = obligations.find((x) => x.id === id);
  return item ? toObligation(item) : null;
}
export async function getCalendarTasks() {
  await wait();
  return calendarTasks.map(toTask);
}
export async function rescheduleTask(id: string, dueDate: string) {
  await wait(500);
  const task = toTask(calendarTasks.find((x) => x.id === id)!);
  if (task.statutoryLocked) throw new Error("Statutory dates cannot be rescheduled");
  return { ...task, dueDate };
}
export async function getEvidenceLibrary() {
  await wait();
  return evidenceRecords.map(toEvidence);
}
export async function uploadEvidence(input: {
  title: string;
  entityId: string;
  module: EvidenceRecord["module"];
}) {
  await wait(700);
  const index = evidenceRecords.length + 1;
  return toEvidence({
    id: `EV-${String(index).padStart(4, "0")}`,
    title: input.title,
    type: "Report",
    entityId: input.entityId,
    ownerId: "p-01",
    module: input.module,
    sha256: `new${index}`.padEnd(64, "0"),
    issuedOn: "03-Oct-2026",
    expiresOn: null,
    linkedRecordIds: [],
    accessHistory: [{ at: "03-Oct-2026 16:30", by: "Ananya Rao", action: "Uploaded" }],
  });
}
export const workspaceRisks = risks;
