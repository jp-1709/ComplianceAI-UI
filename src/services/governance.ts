import {
  activityFeed,
  capas,
  controlledDocuments,
  entities,
  evidenceRecords,
  managementReviews,
  people,
  risks,
} from "@/data/kfc";

const wait = (ms = 180) => new Promise((resolve) => setTimeout(resolve, ms));

export const outputTypes = [
  "Open CAPA",
  "Open Audit",
  "Risk Treatment",
  "Training Initiative",
  "Resource Allocation",
  "Document Change",
  "Policy Change",
  "Objective Revision",
  "Carry forward",
] as const;

export const reviewProfiles = managementReviews.map((review) => ({
  ...review,
  chair: people.find((person) => person.id === review.chairId)?.name ?? review.chairId,
  coverage: review.inputs.map((input, index) => ({
    ...input,
    owner: people[(index % 12) + 1]?.name ?? "Compliance Office",
    standard: ["ISO 9001 9.3.2", "FSSAI Schedule 4", "Companies Act", "ISO 14001", "Internal QMS"][
      index % 5
    ],
    evidenceCount: [4, 3, 5, 2, 6, 4, 3, 5, 2, 4, 3, 2, 6, 5, 3, 7][index],
    readiness: [100, 100, 94, 88, 100, 96, 100, 92, 85, 100, 90, 82, 100, 98, 93, 97][index],
  })),
  enrichedOutputs: review.outputs.map((output, index) => ({
    ...output,
    type: ["Resource Allocation", "Document Change", "Resource Allocation"][
      index
    ] as (typeof outputTypes)[number],
    owner: ["Arvind Shetty", "Rajiv Malhotra", "Meera Joshi"][index],
    dueDate: ["30-Sep-2026", "15-Jul-2026", "31-Aug-2026"][index],
    severity: ["major", "critical", "moderate"][index] as "critical" | "major" | "moderate",
    standards: [["FSSAI", "ISO 9001"], ["ISO 9001 7.5", "FSSAI Schedule 4"], ["ISO 14001"]][index],
    taskId: review.downstreamTaskIds[index],
  })),
  attendees: people
    .slice(0, 7)
    .map((person, index) => ({ ...person, attended: index < 6, voting: index < 5 })),
  agenda: review.inputs.map((input, index) => ({
    id: input.id,
    label: input.label,
    minutes: index < 4 ? 10 : 7,
    state: index < 11 ? "complete" : index === 11 ? "current" : "upcoming",
  })),
  signedMinutes: {
    documentId: "MIN-MR-2026-Q2",
    signedBy: "Rohan Khanna",
    signedAt: "30-Jun-2026 18:22 IST",
    sha256: "a71e9c3827f46a2ef391cc076d534589b1292ac351bd97d6f9a4420ca8921ee4",
  },
}));

export type ReviewProfile = (typeof reviewProfiles)[number];

const documentContent = [
  [
    "Temperature excursions must be quarantined immediately.",
    "A supervisor shall record disposition before stock release.",
    "Quality reviews the excursion register weekly.",
  ],
  [
    "Only approved knives may be used.",
    "Cut-resistant gloves are mandatory during preparation.",
    "Managers verify competency monthly.",
  ],
  [
    "The organisation maintains a process-based QMS.",
    "Documented information is controlled and retained.",
  ],
  [
    "Monitoring reports require preparation and occupier review.",
    "Counter-signature must occur within seven calendar days.",
  ],
  [
    "The Internal Committee operates independently.",
    "Annual reporting follows the statutory calendar.",
  ],
  [
    "Contractors require registration evidence before access.",
    "Every contractor completes site safety induction.",
  ],
  [
    "Critical measuring equipment is uniquely identified.",
    "Calibration status remains visible across all locations.",
  ],
  [
    "GSTR-2B is reconciled to the purchase register monthly.",
    "Material variances are reviewed before GSTR-3B filing.",
  ],
];

export const documentProfiles = controlledDocuments.map((document, index) => ({
  ...document,
  owner: people.find((person) => person.id === document.ownerId)?.name ?? document.ownerId,
  approver: people.find((person) => person.id === document.approverId)?.name ?? document.approverId,
  entity: entities.find((entity) => entity.id === document.entityId)?.name ?? document.entityId,
  category: document.code.startsWith("POL")
    ? "Policy"
    : document.code.startsWith("MAN")
      ? "Manual"
      : "SOP",
  currentContent: documentContent[index],
  priorVersion: document.version.replace(/(\d+)$/, (value) =>
    String(Math.max(0, Number(value) - 1)),
  ),
  priorContent: documentContent[index]
    .map((line, lineIndex) =>
      lineIndex === 1 ? line.replace("shall", "should").replace("mandatory", "recommended") : line,
    )
    .slice(0, 2),
  reviewers: [document.ownerId, document.approverId],
  linkedEvidence: evidenceRecords
    .filter((evidence) => evidence.entityId === document.entityId)
    .slice(0, 3),
  linkedRisks: risks.filter((risk) => risk.entityId === document.entityId).slice(0, 2),
  linkedCapas: capas.filter((capa) => capa.entityId === document.entityId).slice(0, 2),
  reviewState:
    document.status === "pending-approval"
      ? "Approval required"
      : document.status === "draft"
        ? "Author revision"
        : "Current",
}));

export type DocumentProfile = (typeof documentProfiles)[number];

export async function getManagementReviews() {
  await wait();
  return reviewProfiles;
}

export async function getManagementReview(id: string) {
  await wait();
  return reviewProfiles.find((review) => review.id === id);
}

export async function getDocuments() {
  await wait();
  return documentProfiles;
}

export async function getDocument(id: string) {
  await wait();
  return documentProfiles.find((document) => document.id === id || document.code === id);
}

export interface CreateGovernanceRecordInput {
  title: string;
  entityId: string;
  ownerId: string;
  dueDate: string;
}

export async function createDocument(input: CreateGovernanceRecordInput) {
  await wait(260);
  const nextNumber =
    documentProfiles.reduce((max, document) => {
      const value = Number(document.id.match(/(\d+)$/)?.[1] ?? 0);
      return Math.max(max, value);
    }, 0) + 1;
  const template = documentProfiles[0];
  const id = `DOC-${String(nextNumber).padStart(4, "0")}`;
  const record: DocumentProfile = {
    ...template,
    id,
    code: `QMS-DOC-${String(nextNumber).padStart(3, "0")}`,
    title: input.title,
    entityId: input.entityId,
    entity: entities.find((entity) => entity.id === input.entityId)?.name ?? input.entityId,
    ownerId: input.ownerId,
    owner: people.find((person) => person.id === input.ownerId)?.name ?? input.ownerId,
    nextReview: input.dueDate,
    status: "draft",
    version: "0.1",
    priorVersion: "0",
    priorContent: [],
    currentContent: [
      "Draft purpose and scope pending author completion.",
      "Control requirements will be defined during content review.",
      "Records and review responsibilities must be confirmed before approval.",
    ],
    linkedEvidence: [],
    linkedRisks: [],
    linkedCapas: [],
    acknowledgementsPending: 0,
    acknowledgementsTotal: 0,
    reviewState: "Author revision",
  };
  documentProfiles.unshift(record);
  return record;
}

export async function createManagementReview(input: CreateGovernanceRecordInput) {
  await wait(260);
  const template = reviewProfiles[0];
  const id = `MR-${new Date().getFullYear()}-Q${reviewProfiles.length + 2}`;
  const record: ReviewProfile = {
    ...template,
    id,
    title: input.title,
    chairId: input.ownerId,
    chair: people.find((person) => person.id === input.ownerId)?.name ?? input.ownerId,
    heldOn: input.dueDate,
    status: "Planned",
    inputs: template.inputs.map((item) => ({ ...item, locked: false })),
    outputs: [],
    downstreamTaskIds: [],
    enrichedOutputs: [],
    agenda: template.agenda.map((item) => ({ ...item, state: "upcoming" as const })),
  };
  reviewProfiles.unshift(record);
  return record;
}

export const governanceActivity = activityFeed.filter((item) => item.module === "qms");
