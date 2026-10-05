import { aiSuggestions, entities, people, roles } from "@/data/kfc";

const wait = (ms = 160) => new Promise((resolve) => setTimeout(resolve, ms));

export const reportDefinitions = [
  {
    id: "RPT-001",
    title: "Executive Compliance Posture",
    category: "Executive",
    description: "Entity scores, obligations, risk, CAPA and assurance trends.",
    lastRun: "05-Oct-2026 08:30",
    format: "PDF",
    records: 84,
  },
  {
    id: "RPT-002",
    title: "Statutory Due-Date and Filing Register",
    category: "Regulatory",
    description: "Locked statutory dates, filing state, owners and evidence completeness.",
    lastRun: "05-Oct-2026 08:12",
    format: "Excel",
    records: 42,
  },
  {
    id: "RPT-003",
    title: "Risk, Finding and CAPA Traceability",
    category: "Assurance",
    description: "End-to-end treatment and independent verification status.",
    lastRun: "04-Oct-2026 18:44",
    format: "PDF",
    records: 21,
  },
  {
    id: "RPT-004",
    title: "Evidence Expiry and Coverage",
    category: "Evidence",
    description: "Evidence provenance, expiry risk and obligation coverage.",
    lastRun: "04-Oct-2026 17:10",
    format: "Excel",
    records: 36,
  },
];

export const savedReportConfigs = [
  {
    id: "CFG-01",
    name: "Board quarterly pack",
    entity: "All entities",
    period: "Q2 FY27",
    modules: "All modules",
    status: "Exceptions only",
  },
  {
    id: "CFG-02",
    name: "South region action queue",
    entity: "Bengaluru + Hyderabad",
    period: "Sep-2026",
    modules: "EHS, QMS, Tax",
    status: "Open / overdue",
  },
  {
    id: "CFG-03",
    name: "External audit evidence index",
    entity: "All entities",
    period: "H1 FY27",
    modules: "QMS",
    status: "Verified evidence",
  },
];

export const boardPackSections = [
  { id: "BP-01", title: "Executive posture and trend", readiness: 100, pages: 2 },
  { id: "BP-02", title: "Material regulatory change", readiness: 100, pages: 2 },
  { id: "BP-03", title: "Obligations, filings and evidence", readiness: 96, pages: 3 },
  { id: "BP-04", title: "Risks above appetite", readiness: 100, pages: 2 },
  { id: "BP-05", title: "Major findings and CAPAs", readiness: 92, pages: 3 },
  { id: "BP-06", title: "Management decisions required", readiness: 100, pages: 1 },
];

export const aiReviewQueues = {
  obligations: [
    {
      id: "AI-MAP-01",
      title: "Map CBIC Rule 88D disclosure to Bengaluru GSTR-3B obligation",
      confidence: 88,
      source: "RA-2026-041",
      target: "OBL-0102",
      status: "Awaiting human review",
    },
    {
      id: "AI-MAP-02",
      title: "Add seven-day occupier signature checkpoint",
      confidence: 81,
      source: "RA-2026-038",
      target: "OBL-0107",
      status: "Edited by reviewer",
    },
  ],
  risks: [
    {
      id: "AI-RSK-01",
      title: "Increase likelihood for recurring knife-handling risk",
      confidence: 84,
      source: "INC-2026-017",
      target: "RSK-0004",
      status: "Awaiting risk owner",
    },
  ],
  capas: [
    {
      id: "AI-RCA-01",
      title: "Draft systemic root cause for excursion disposition weakness",
      confidence: 86,
      source: "FND-0001",
      target: "CAPA-0001",
      status: "Reviewer editing",
    },
  ],
  audits: [
    {
      id: "AI-AUD-01",
      title: "Draft GST ITC control-testing checklist",
      confidence: 79,
      source: "RA-2026-041",
      target: "IA-2026-05",
      status: "Awaiting audit lead",
    },
  ],
};

export const aiDecisionLog = aiSuggestions.map((item, index) => ({
  id: `AIDL-${String(index + 1).padStart(4, "0")}`,
  user: ["Ananya Rao", "Meera Joshi", "Kavita Iyer"][index],
  suggestion: item.suggestion,
  model: "Quantbit Compliance AI / qca-2.3",
  sources: item.sourceRecords.map((source) => source.id),
  time: ["05-Oct-2026 09:18", "04-Oct-2026 16:42", "03-Oct-2026 11:07"][index],
  decision: [
    "Edited and accepted as draft",
    "Accepted as draft",
    "Rejected — independence conflict handled manually",
  ][index],
  finalResult: [
    "CAPA extension draft created with 26-Oct target; pending human approval.",
    "OBL-0107 draft checkpoint added; pending obligation-owner confirmation.",
    "No assignment change made by AI; workflow remains blocked for administrator action.",
  ][index],
}));

export const aiForbiddenActions = [
  "Approve, reject or sign any record",
  "Submit statutory filings or authority responses",
  "Close CAPAs, findings, incidents or audits",
  "Accept risk or change appetite",
  "Verify corrective-action effectiveness",
  "Override quorum, segregation-of-duties or permission controls",
  "Delete evidence, alter hashes or hide audit history",
  "Make autonomous employment, POSH or disciplinary decisions",
];

export const accessMatrix = people.map((person, index) => ({
  ...person,
  role: roles.find((role) => role.id === person.roleId)?.name ?? person.roleId,
  entityAccess:
    person.entityId === "all"
      ? "All entities"
      : (entities.find((entity) => entity.id === person.entityId)?.shortName ?? person.entityId),
  modules:
    index < 3
      ? "All modules"
      : person.roleId === "tax-user"
        ? "Tax & GST"
        : person.roleId === "ehs-manager"
          ? "EHS, Labour"
          : person.roleId === "legal-secretarial"
            ? "Secretarial"
            : "Assigned workflows",
  status: "Active",
  lastActive: `${index + 1}h ago`,
}));

export const delegations = [
  {
    id: "DEL-001",
    from: "Ananya Rao",
    to: "Kavita Iyer",
    scope: "QMS approvals",
    start: "07-Oct-2026",
    end: "11-Oct-2026",
    status: "Scheduled",
  },
  {
    id: "DEL-002",
    from: "Priya Desai",
    to: "Ananya Rao",
    scope: "MCA filing review",
    start: "01-Oct-2026",
    end: "05-Oct-2026",
    status: "Ended",
  },
];

export async function getReportsWorkspace() {
  await wait();
  return { reports: reportDefinitions, configs: savedReportConfigs, boardPack: boardPackSections };
}
export async function getAiWorkspace() {
  await wait();
  return { queues: aiReviewQueues, decisions: aiDecisionLog, forbidden: aiForbiddenActions };
}
export async function getAdminWorkspace() {
  await wait();
  return { users: accessMatrix, roles, delegations };
}
