import { audits, capas, entities, findings, people, risks } from "@/data/kfc";

const wait = (ms = 180) => new Promise((resolve) => setTimeout(resolve, ms));

export const riskProfiles = risks.map((risk, index) => {
  const inherentLikelihood = risk.likelihood;
  const inherentImpact = risk.impact;
  const residualLikelihood = Math.max(1, risk.likelihood - (index % 2 === 0 ? 1 : 0)) as
    1 | 2 | 3 | 4 | 5;
  const residualImpact = Math.max(1, risk.impact - (index % 3 === 0 ? 1 : 0)) as 1 | 2 | 3 | 4 | 5;
  const priorLikelihood = Math.min(5, risk.likelihood + (index % 2)) as 1 | 2 | 3 | 4 | 5;
  const priorImpact = risk.impact;
  const effectiveness = [58, 72, 64, 61, 69, 76, 81][index];
  return {
    ...risk,
    owner: people.find((person) => person.id === risk.ownerId)?.name ?? "Unassigned",
    entity: entities.find((entity) => entity.id === risk.entityId)?.name ?? risk.entityId,
    inherentLikelihood,
    inherentImpact,
    residualLikelihood,
    residualImpact,
    priorLikelihood,
    priorImpact,
    inherentScore: inherentLikelihood * inherentImpact,
    residualScore: residualLikelihood * residualImpact,
    priorScore: priorLikelihood * priorImpact,
    controlEffectiveness: effectiveness,
    controls: [
      {
        name: "Preventive operating control",
        effectiveness: effectiveness + 4,
        status: "Operating",
      },
      {
        name: "Manager review and exception escalation",
        effectiveness: effectiveness - 7,
        status: effectiveness < 70 ? "Needs strengthening" : "Operating",
      },
      { name: "Monthly evidence sampling", effectiveness: effectiveness - 2, status: "Operating" },
    ],
    treatmentPlan: risk.linkedCapaIds
      .map((id) => capas.find((capa) => capa.id === id))
      .filter(Boolean),
    acceptance:
      risk.treatment === "Accept"
        ? { state: "Pending approval", requestedBy: risk.ownerId, approver: "Group CXO" }
        : { state: "Not requested", requestedBy: risk.ownerId, approver: "Group CXO" },
    reviewDate: `0${(index % 8) + 8}-Nov-2026`,
  };
});

export type RiskProfile = (typeof riskProfiles)[number];

const capaStages = [
  "Draft",
  "Pending Review",
  "In RCA",
  "Action Planning",
  "Plan Approved",
  "In Progress",
  "Pending Effectiveness",
  "Closed",
] as const;

const stageMap: Record<(typeof capas)[number]["stage"], (typeof capaStages)[number]> = {
  Investigation: "In RCA",
  "Plan Approval": "Pending Review",
  Implementation: "In Progress",
  "Effectiveness Verification": "Pending Effectiveness",
  Closed: "Closed",
};

export const capaProfiles = capas.map((capa, index) => ({
  ...capa,
  workflowStage: stageMap[capa.stage],
  workflowIndex: capaStages.indexOf(stageMap[capa.stage]),
  entity: entities.find((entity) => entity.id === capa.entityId)?.name ?? capa.entityId,
  actionOwner:
    people.find((person) => person.id === capa.actionOwnerId)?.name ?? capa.actionOwnerId,
  approver: people.find((person) => person.id === capa.approverId)?.name ?? capa.approverId,
  verifier: people.find((person) => person.id === capa.verifierId)?.name ?? capa.verifierId,
  completion: capa.stage === "Closed" ? 100 : [18, 26, 42, 34, 48, 63, 78, 85, 55, 100][index],
  rootCause: [
    "Disposition decisions were treated as an operational note rather than a controlled quality decision.",
    "Training ownership and independent approval were assigned to the same manager.",
    "The report workflow did not require an occupier signature before release.",
    "Contractor access was not technically gated by registration evidence.",
    "Induction records were maintained outside the site access workflow.",
    "Competency checks focused on induction attendance rather than observed skill.",
    "Refresher training did not include practical re-verification.",
    "Variance analysis depended on manual spreadsheet matching.",
    "Acknowledgement escalation was not risk-tiered.",
    "Calibration records were held in separate local registers.",
  ][index],
  fiveWhys: [
    "Why did the failure occur? The required control was not consistently performed.",
    "Why was it not performed? The workflow allowed the record to progress without it.",
    "Why did the workflow allow that? The approval gate was not configured as mandatory.",
    "Why was the gate not mandatory? Ownership was distributed across local teams.",
    "Why was ownership distributed? The process lacked a single enterprise control owner.",
  ],
  fishbone: {
    People: ["Competency not re-verified", "Accountability unclear"],
    Process: ["Missing mandatory gate", "Weak escalation"],
    Technology: ["Disconnected registers", "No blocking validation"],
    Evidence: ["Incomplete provenance", "Review signature absent"],
    Environment: ["High-volume shifts", "Cross-branch variation"],
    Governance: ["Control owner not centralised", "Assurance cadence weak"],
  },
}));

export type CapaProfile = (typeof capaProfiles)[number];
export { capaStages };

const auditProgress = [100, 100, 86, 54];
export const auditProfiles = audits.map((audit, index) => ({
  ...audit,
  entity: entities.find((entity) => entity.id === audit.entityId)?.name ?? audit.entityId,
  lead: people.find((person) => person.id === audit.leadId)?.name ?? audit.leadId,
  progress: auditProgress[index],
  completedItems: [52, 68, 64, 28][index],
  totalItems: [52, 68, 74, 52][index],
  findings: findings.filter((finding) => finding.auditId === audit.id),
}));

export const findingProfiles = findings.map((finding, index) => {
  const audit = audits.find((item) => item.id === finding.auditId);
  const capa = capas.find((item) => item.id === finding.capaId);
  return {
    ...finding,
    auditTitle: audit?.title ?? finding.auditId,
    entity: entities.find((entity) => entity.id === finding.entityId)?.name ?? finding.entityId,
    owner: people.find((person) => person.id === finding.ownerId)?.name ?? finding.ownerId,
    lifecycle:
      finding.status === "closed"
        ? "Independently Closed"
        : ["Action In Progress", "Issued", "Acknowledged", "Action Complete"][index],
    capa,
  };
});

export const auditChecklist = [
  {
    id: "CL-01",
    section: "Governance",
    question: "Is the applicable procedure current, approved and available at point of use?",
    result: "Conforming",
    evidence: 2,
  },
  {
    id: "CL-02",
    section: "Competency",
    question: "Can the process owner demonstrate current competency and refresher verification?",
    result: "Major NC",
    evidence: 1,
  },
  {
    id: "CL-03",
    section: "Operations",
    question: "Are exceptions dispositioned by an authorised reviewer before closure?",
    result: "Not tested",
    evidence: 0,
  },
  {
    id: "CL-04",
    section: "Evidence",
    question: "Does sampled evidence show owner, date, approval and traceable provenance?",
    result: "Observation",
    evidence: 3,
  },
  {
    id: "CL-05",
    section: "Effectiveness",
    question: "Are corrective actions independently verified after an adequate monitoring period?",
    result: "Not tested",
    evidence: 0,
  },
];

export const qmsFlows = {
  B: [
    "Risk identified",
    "Inherent assessment",
    "Controls mapped",
    "Residual assessment",
    "Treatment CAPA",
    "Effectiveness verified",
    "Risk reviewed",
  ],
  C: [
    "Finding issued",
    "CAPA auto-created",
    "Root cause analysis",
    "Plan approved",
    "Actions implemented",
    "Independent effectiveness",
    "Finding closed",
  ],
  E: [
    "Audit programmed",
    "Checklist executed",
    "Evidence sampled",
    "Finding raised",
    "Report issued",
    "CAPA monitored",
    "Management review",
  ],
};

export async function getRiskWorkspace() {
  await wait();
  return { risks: riskProfiles };
}

export async function getRisk(id: string) {
  await wait();
  return riskProfiles.find((risk) => risk.id === id);
}

export async function getCapaWorkspace() {
  await wait();
  return { capas: capaProfiles };
}

export async function getCapa(id: string) {
  await wait();
  return capaProfiles.find((capa) => capa.id === id);
}

export async function getAuditWorkspace() {
  await wait();
  return { audits: auditProfiles, findings: findingProfiles };
}

export async function getAudit(id: string) {
  await wait();
  return auditProfiles.find((audit) => audit.id === id);
}

export async function getFinding(id: string) {
  await wait();
  return findingProfiles.find((finding) => finding.id === id);
}

export interface CreateQmsRecordInput {
  title: string;
  entityId: string;
  ownerId: string;
  dueDate: string;
}

const nextId = (prefix: string, records: Array<{ id: string }>) => {
  const highest = records.reduce((max, record) => {
    const value = Number(record.id.match(/(\d+)$/)?.[1] ?? 0);
    return Math.max(max, value);
  }, 0);
  return `${prefix}-${String(highest + 1).padStart(4, "0")}`;
};

export async function createRisk(input: CreateQmsRecordInput) {
  await wait(260);
  const template = riskProfiles[0];
  const record: RiskProfile = {
    ...template,
    id: nextId("RSK", riskProfiles),
    title: input.title,
    entityId: input.entityId,
    entity: entities.find((entity) => entity.id === input.entityId)?.name ?? input.entityId,
    ownerId: input.ownerId,
    owner: people.find((person) => person.id === input.ownerId)?.name ?? input.ownerId,
    status: "open",
    treatment: "Mitigate",
    treatmentPlan: [],
    acceptance: { state: "Not requested", requestedBy: input.ownerId, approver: "Group CXO" },
    reviewDate: input.dueDate,
  };
  riskProfiles.unshift(record);
  return record;
}

export async function createCapa(input: CreateQmsRecordInput) {
  await wait(260);
  const template = capaProfiles[0];
  const record: CapaProfile = {
    ...template,
    id: nextId("CAPA", capaProfiles),
    title: input.title,
    entityId: input.entityId,
    entity: entities.find((entity) => entity.id === input.entityId)?.name ?? input.entityId,
    actionOwnerId: input.ownerId,
    actionOwner: people.find((person) => person.id === input.ownerId)?.name ?? input.ownerId,
    dueDate: input.dueDate,
    workflowStage: "Draft",
    workflowIndex: 0,
    completion: 0,
    status: "open",
    independenceConflict: false,
  };
  capaProfiles.unshift(record);
  return record;
}

export async function createAudit(input: CreateQmsRecordInput) {
  await wait(260);
  const template = auditProfiles[0];
  const record = {
    ...template,
    id: nextId("IA", auditProfiles),
    title: input.title,
    entityId: input.entityId,
    entity: entities.find((entity) => entity.id === input.entityId)?.name ?? input.entityId,
    leadId: input.ownerId,
    lead: people.find((person) => person.id === input.ownerId)?.name ?? input.ownerId,
    plannedOn: input.dueDate,
    status: "Planned" as const,
    progress: 0,
    completedItems: 0,
    findings: [],
    reportIssued: false,
  };
  auditProfiles.unshift(record);
  return record;
}
