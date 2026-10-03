export type RoleId =
  | "group-cxo"
  | "board-member"
  | "compliance-officer"
  | "qms-manager"
  | "entity-manager"
  | "process-owner"
  | "risk-owner"
  | "internal-auditor"
  | "audit-lead"
  | "capa-owner"
  | "qa-approver"
  | "legal-secretarial"
  | "tax-user"
  | "ehs-manager"
  | "evidence-contributor"
  | "external-auditor"
  | "system-admin";

export type Permission =
  | "view.command-center"
  | "view.financials"
  | "approve.document"
  | "verify.effectiveness"
  | "sign.record"
  | "export.board-pack"
  | "manage.admin"
  | "upload.evidence";

export interface Role {
  id: RoleId;
  name: string;
  scope: string;
  permissions: Permission[];
  watermarkExports?: boolean;
}

export interface Person {
  id: string;
  name: string;
  initials: string;
  title: string;
  entityId: string | "all";
  roleId: RoleId;
}

export interface Entity {
  id: string;
  name: string;
  shortName: string;
  city: string;
  state: string;
  type: "Corporate" | "Restaurant";
  gstin: string;
  headcount: number;
  score: number;
  trend: number;
  openIssues: number;
}

export type Status =
  | "compliant"
  | "attention"
  | "overdue"
  | "critical"
  | "in-progress"
  | "draft"
  | "closed"
  | "approved"
  | "pending-approval"
  | "verified";

export type Severity = "critical" | "major" | "moderate" | "minor";

export type ModuleId =
  | "labour"
  | "tax"
  | "secretarial"
  | "ehs"
  | "qms"
  | "fssai";

export interface Regulation {
  id: string;
  title: string;
  authority: string;
  module: ModuleId;
  effectiveFrom: string;
}

export interface RegulatoryAlert {
  id: string;
  title: string;
  authority: string;
  module: ModuleId;
  publishedOn: string;
  impact: Severity;
  status: "awaiting-impact-assessment" | "assessed" | "implemented";
  summary: string;
  affectedEntityIds: string[];
  linkedObligationIds: string[];
}

export interface Obligation {
  id: string;
  title: string;
  regulationId: string;
  module: ModuleId;
  entityId: string;
  ownerId: string;
  frequency: "Monthly" | "Quarterly" | "Annual" | "Event-based";
  dueDate: string;
  statutoryLocked: boolean;
  status: Status;
  evidenceIds: string[];
  riskIds: string[];
}

export interface CalendarTask {
  id: string;
  title: string;
  obligationId: string;
  entityId: string;
  ownerId: string;
  dueDate: string;
  status: Status;
  ageingDays: number;
  priority: Severity;
}

export interface EvidenceRecord {
  id: string;
  title: string;
  type: "Return" | "Challan" | "Register" | "Certificate" | "Photo" | "Report" | "Minutes";
  entityId: string;
  ownerId: string;
  module: ModuleId;
  sha256: string;
  issuedOn: string;
  expiresOn: string | null;
  linkedRecordIds: string[];
  accessHistory: { at: string; by: string; action: string }[];
}

export interface ControlledDocument {
  id: string;
  code: string;
  title: string;
  version: string;
  status: "approved" | "pending-approval" | "draft";
  ownerId: string;
  approverId: string;
  entityId: string;
  effectiveFrom: string;
  nextReview: string;
  acknowledgementsPending: number;
  acknowledgementsTotal: number;
}

export interface Risk {
  id: string;
  title: string;
  entityId: string;
  ownerId: string;
  module: ModuleId;
  likelihood: 1 | 2 | 3 | 4 | 5;
  impact: 1 | 2 | 3 | 4 | 5;
  appetiteThreshold: number;
  treatment: "Mitigate" | "Transfer" | "Accept" | "Avoid";
  status: Status;
  linkedCapaIds: string[];
}

export interface Capa {
  id: string;
  title: string;
  source: "Audit Finding" | "Incident" | "Inspection" | "Customer Complaint" | "Internal Review";
  entityId: string;
  actionOwnerId: string;
  approverId: string;
  verifierId: string;
  severity: Severity;
  dueDate: string;
  stage: "Investigation" | "Plan Approval" | "Implementation" | "Effectiveness Verification" | "Closed";
  status: Status;
  independenceConflict: boolean;
  linkedFindingId?: string;
  linkedRiskId?: string;
}

export interface Audit {
  id: string;
  title: string;
  entityId: string;
  leadId: string;
  scope: string;
  plannedOn: string;
  status: "Planned" | "Fieldwork" | "Reporting" | "Issued";
  reportIssued: boolean;
  findingIds: string[];
  checklistTemplateId: string;
}

export interface Finding {
  id: string;
  title: string;
  auditId: string;
  entityId: string;
  severity: Severity;
  clause: string;
  status: Status;
  ownerId: string;
  capaId?: string;
}

export interface ChecklistTemplate {
  id: string;
  title: string;
  module: ModuleId;
  questions: number;
  lastUpdated: string;
}

export interface ManagementReview {
  id: string;
  title: string;
  heldOn: string;
  chairId: string;
  status: "Closed" | "Scheduled" | "Inputs Locked";
  inputs: { id: string; label: string; locked: boolean }[];
  outputs: { id: string; label: string; decision: string }[];
  downstreamTaskIds: string[];
  quorumMet: boolean;
}

export interface AiSuggestion {
  id: string;
  suggestion: string;
  why: string;
  confidence: number;
  sourceRecords: { id: string; label: string }[];
  sourceExcerpts: string[];
  assumptions: string[];
  missingInfo: string[];
}

export interface ActivityEvent {
  id: string;
  at: string;
  actor: string;
  action: string;
  recordId: string;
  module: ModuleId;
}
