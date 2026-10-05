import { capas, entities, evidenceRecords, obligations, people, risks } from "@/data/kfc";
import type { ModuleId, Severity, Status } from "@/data/types";

const wait = (ms = 160) => new Promise((resolve) => setTimeout(resolve, ms));
const entityName = (id: string) => entities.find((item) => item.id === id)?.name ?? id;
const ownerName = (id: string) => people.find((item) => item.id === id)?.name ?? id;

export const labourEstablishments = entities.map((entity, index) => ({
  id: `EST-${String(index + 1).padStart(3, "0")}`,
  entityId: entity.id,
  name: entity.name,
  state: entity.state,
  headcount: entity.headcount,
  registration: ["MH-S&E-11882", "MH-S&E-28441", "KA-S&E-99213", "TS-S&E-17302", "DL-S&E-41008"][
    index
  ],
  licenceExpiry: ["31-Mar-2027", "04-Aug-2027", "28-Oct-2026", "22-Dec-2026", "15-Nov-2026"][index],
  wageExceptions: [1, 4, 2, 0, 3][index],
  missingRegisters: [0, 2, 1, 0, 1][index],
  status: (["compliant", "critical", "attention", "compliant", "attention"] as Status[])[index],
}));

export const labourInspections = [
  {
    id: "LAB-INS-001",
    entityId: "ent-pune",
    authority: "Maharashtra Labour Department",
    date: "24-Sep-2026",
    scope: "BOCW registration, contractor induction and wage records",
    status: "Open response",
    findings: 3,
    ownerId: "p-10",
  },
  {
    id: "LAB-INS-002",
    entityId: "ent-delhi",
    authority: "ESIC Regional Office",
    date: "11-Sep-2026",
    scope: "Coverage, contribution records and employee declarations",
    status: "Closed",
    findings: 0,
    ownerId: "p-14",
  },
];

export const contractors = [
  {
    id: "CTR-001",
    name: "BuildRight Projects Pvt Ltd",
    entityId: "ent-pune",
    workers: 38,
    score: 54,
    bocw: "Missing",
    induction: 68,
    wageCompliance: 82,
    insurance: "Valid",
    status: "critical" as Status,
  },
  {
    id: "CTR-002",
    name: "SecureServe Facility Management",
    entityId: "ent-mumbai",
    workers: 24,
    score: 88,
    bocw: "Verified",
    induction: 100,
    wageCompliance: 96,
    insurance: "Valid",
    status: "compliant" as Status,
  },
  {
    id: "CTR-003",
    name: "GreenHands Waste Services",
    entityId: "ent-hyderabad",
    workers: 12,
    score: 76,
    bocw: "N/A",
    induction: 92,
    wageCompliance: 88,
    insurance: "Expires 20-Oct",
    status: "attention" as Status,
  },
];

export const taxFilings = [
  {
    id: "GST-FIL-001",
    form: "GSTR-1",
    period: "Sep-2026",
    entityId: "ent-mumbai",
    dueDate: "11-Oct-2026",
    liability: 1840000,
    ownerId: "p-09",
    status: "in-progress" as Status,
    arn: "Pending",
  },
  {
    id: "GST-FIL-002",
    form: "GSTR-3B",
    period: "Sep-2026",
    entityId: "ent-bengaluru",
    dueDate: "20-Oct-2026",
    liability: 2670000,
    ownerId: "p-09",
    status: "attention" as Status,
    arn: "Pending reconciliation",
  },
  {
    id: "TDS-FIL-003",
    form: "TDS 194C",
    period: "Sep-2026",
    entityId: "ent-pune",
    dueDate: "07-Oct-2026",
    liability: 218000,
    ownerId: "p-09",
    status: "overdue" as Status,
    arn: "Challan pending",
  },
];

export const itcMismatches = [
  {
    id: "ITC-001",
    vendor: "FreshRoute Logistics",
    gstin: "29AABCF1882K1Z9",
    invoice: "FRL/8861",
    books: 428000,
    government: 0,
    type: "Missing in GSTR-2B",
    owner: "Arvind Shetty",
    treatment: "Vendor follow-up",
    evidence: "EV-0003",
    approval: "Pending",
    capa: "CAPA-0008",
  },
  {
    id: "ITC-002",
    vendor: "Metro Equipment Co",
    gstin: "27AACCM9174A1Z3",
    invoice: "ME/10429",
    books: 186000,
    government: 168000,
    type: "Tax value mismatch",
    owner: "Arvind Shetty",
    treatment: "Debit note review",
    evidence: "EV-0002",
    approval: "Tax lead review",
    capa: null,
  },
  {
    id: "ITC-003",
    vendor: "QuickStaff Services",
    gstin: "29AAACQ3304L1ZW",
    invoice: "QS/22091",
    books: 0,
    government: 94000,
    type: "Not in books",
    owner: "Ananya Rao",
    treatment: "Block credit",
    evidence: "EV-0003",
    approval: "Approved",
    capa: null,
  },
];

export const taxNotices = [
  {
    id: "GST-NOT-001",
    authority: "Karnataka GST",
    section: "Section 61 scrutiny",
    receivedOn: "26-Sep-2026",
    respondBy: "18-Oct-2026",
    entityId: "ent-bengaluru",
    amount: 420000,
    status: "attention" as Status,
    ownerId: "p-09",
    subject: "Difference between GSTR-3B ITC and GSTR-2B",
  },
  {
    id: "TDS-NOT-002",
    authority: "Income Tax CPC",
    section: "Section 200A",
    receivedOn: "14-Sep-2026",
    respondBy: "14-Oct-2026",
    entityId: "ent-mumbai",
    amount: 38000,
    status: "in-progress" as Status,
    ownerId: "p-09",
    subject: "Short deduction query for contractor payments",
  },
];

export const directors = [
  {
    id: "DIR-001",
    name: "Rohit Mehra",
    din: "00881234",
    designation: "Managing Director",
    appointedOn: "01-Apr-2019",
    committees: ["CSR", "Risk"],
    kyc: "Filed",
    interestDisclosure: "Current",
  },
  {
    id: "DIR-002",
    name: "Nandita Shah",
    din: "02194771",
    designation: "Independent Director",
    appointedOn: "15-Jul-2022",
    committees: ["Audit", "NRC"],
    kyc: "Filed",
    interestDisclosure: "Current",
  },
  {
    id: "DIR-003",
    name: "Ajay Menon",
    din: "04401892",
    designation: "Non-Executive Director",
    appointedOn: "12-Jan-2024",
    committees: ["Audit"],
    kyc: "Due 30-Sep",
    interestDisclosure: "Pending refresh",
  },
];

export const boardMeetings = [
  {
    id: "BM-2026-04",
    title: "Board Meeting — Q2 FY2026-27",
    date: "21-Aug-2026",
    chair: "Rohit Mehra",
    quorum: { present: 3, required: 2, met: true },
    agenda: [
      "Approve Q1 financial results",
      "Review enterprise compliance posture",
      "Approve related-party transactions",
      "Note internal audit reports",
    ],
    resolutions: [
      {
        id: "RES-041",
        title: "Approve Q1 financial results",
        votesFor: 3,
        votesAgainst: 0,
        abstained: 0,
        status: "Passed",
      },
      {
        id: "RES-042",
        title: "Approve cold-chain sensor capital allocation",
        votesFor: 2,
        votesAgainst: 0,
        abstained: 1,
        status: "Passed",
      },
    ],
    minutesId: "EV-0029",
  },
];

export const mcaFilings = [
  {
    id: "MCA-001",
    form: "MGT-7",
    purpose: "Annual return FY2025-26",
    dueDate: "29-Nov-2026",
    filedOn: null,
    srn: "Pending",
    status: "in-progress" as Status,
    ownerId: "p-08",
  },
  {
    id: "MCA-002",
    form: "DIR-3 KYC",
    purpose: "Director KYC — Ajay Menon",
    dueDate: "30-Sep-2026",
    filedOn: "27-Sep-2026",
    srn: "F91821033",
    status: "compliant" as Status,
    ownerId: "p-08",
  },
  {
    id: "MCA-003",
    form: "AOC-4",
    purpose: "Financial statements FY2025-26",
    dueDate: "30-Oct-2026",
    filedOn: null,
    srn: "Pending",
    status: "attention" as Status,
    ownerId: "p-08",
  },
];

export const incidents = [
  {
    id: "INC-2026-017",
    title: "Knife-handling laceration during prep shift",
    entityId: "ent-bengaluru",
    occurredOn: "18-Sep-2026 19:42",
    severity: "major" as Severity,
    peopleAffected: [
      { name: "Crew member — anonymised", injury: "Laceration requiring sutures", lostDays: 2 },
    ],
    containment: [
      "First aid and hospital referral",
      "Knife removed from service",
      "Shift safety stand-down",
    ],
    evidenceIds: ["EV-0019", "EV-0034"],
    rootCause:
      "Competency was not re-verified after induction and worn equipment remained available.",
    capaId: "CAPA-0006",
    riskId: "RSK-0004",
    followUpAudit: "IA-2026-03",
    status: "in-progress" as Status,
  },
];

export const monitoringPoints = [
  {
    id: "MON-001",
    name: "Ambient PM2.5",
    entityId: "ent-hyderabad",
    unit: "µg/m³",
    limit: 60,
    readings: [38, 42, 55, 64, 58, 49],
    status: "critical" as Status,
    lastSampled: "28-Sep-2026",
  },
  {
    id: "MON-002",
    name: "Effluent pH",
    entityId: "ent-hyderabad",
    unit: "pH",
    limit: 8.5,
    readings: [7.1, 7.4, 7.2, 7.8, 8.1, 7.6],
    status: "compliant" as Status,
    lastSampled: "28-Sep-2026",
  },
  {
    id: "MON-003",
    name: "Workplace noise",
    entityId: "ent-pune",
    unit: "dB(A)",
    limit: 85,
    readings: [72, 78, 82, 81, 86, 83],
    status: "attention" as Status,
    lastSampled: "30-Sep-2026",
  },
];

export const ehsLicences = [
  {
    id: "EHS-LIC-001",
    name: "Consent to Operate — Telangana SPCB",
    entityId: "ent-hyderabad",
    authority: "Telangana SPCB",
    licenceNo: "TSPCB/CTO/2024/8812",
    issuedOn: "01-Apr-2024",
    expiresOn: "31-Mar-2027",
    conditions: 12,
    evidenceId: "EV-0026",
    status: "compliant" as Status,
  },
  {
    id: "EHS-LIC-002",
    name: "Fire NOC — Delhi CP",
    entityId: "ent-delhi",
    authority: "Delhi Fire Service",
    licenceNo: "DFS/NOC/2025/1098",
    issuedOn: "15-Nov-2025",
    expiresOn: "14-Nov-2026",
    conditions: 6,
    evidenceId: "EV-0015",
    status: "attention" as Status,
  },
];

export function moduleEvidence(module: ModuleId) {
  return evidenceRecords.filter((item) => item.module === module);
}

export function enrich<T extends { entityId?: string; ownerId?: string }>(item: T) {
  return {
    ...item,
    entity: item.entityId ? entityName(item.entityId) : undefined,
    owner: item.ownerId ? ownerName(item.ownerId) : undefined,
  };
}

export async function getModuleWorkspace(module: "labour" | "tax" | "secretarial" | "ehs") {
  await wait();
  if (module === "labour")
    return {
      establishments: labourEstablishments,
      inspections: labourInspections,
      contractors,
      evidence: moduleEvidence("labour"),
    };
  if (module === "tax")
    return {
      filings: taxFilings,
      mismatches: itcMismatches,
      notices: taxNotices,
      evidence: moduleEvidence("tax"),
    };
  if (module === "secretarial")
    return {
      directors,
      meetings: boardMeetings,
      filings: mcaFilings,
      evidence: moduleEvidence("secretarial"),
    };
  return {
    incidents,
    monitoring: monitoringPoints,
    licences: ehsLicences,
    evidence: moduleEvidence("ehs"),
  };
}

export async function getModuleRecord(kind: string, id: string) {
  await wait();
  const all = [
    ...labourEstablishments,
    ...labourInspections,
    ...contractors,
    ...taxFilings,
    ...itcMismatches,
    ...taxNotices,
    ...directors,
    ...boardMeetings,
    ...mcaFilings,
    ...incidents,
    ...monitoringPoints,
    ...ehsLicences,
  ] as Array<{ id: string }>;
  return all.find((item) => item.id === id);
}

export async function getLabourEstablishment(id: string) {
  await wait();
  return labourEstablishments.find((item) => item.id === id);
}
export async function getLabourContractor(id: string) {
  await wait();
  return contractors.find((item) => item.id === id);
}
export async function getLabourInspection(id: string) {
  await wait();
  return labourInspections.find((item) => item.id === id);
}
export async function getTaxFiling(id: string) {
  await wait();
  return taxFilings.find((item) => item.id === id);
}
export async function getItcReconciliation(id: string) {
  await wait();
  return itcMismatches.find((item) => item.id === id);
}
export async function getTaxNotice(id: string) {
  await wait();
  return taxNotices.find((item) => item.id === id);
}
export async function getDirector(id: string) {
  await wait();
  return directors.find((item) => item.id === id);
}
export async function getBoardMeeting(id: string) {
  await wait();
  return boardMeetings.find((item) => item.id === id);
}
export async function getMcaFiling(id: string) {
  await wait();
  return mcaFilings.find((item) => item.id === id);
}
export async function getIncident(id: string) {
  await wait();
  return incidents.find((item) => item.id === id);
}
export async function getMonitoringPoint(id: string) {
  await wait();
  return monitoringPoints.find((item) => item.id === id);
}
export async function getEhsLicence(id: string) {
  await wait();
  return ehsLicences.find((item) => item.id === id);
}

export const linkedModuleRecords = { obligations, risks, capas };
