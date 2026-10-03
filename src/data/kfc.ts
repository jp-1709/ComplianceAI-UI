import type {
  ActivityEvent,
  AiSuggestion,
  Audit,
  CalendarTask,
  Capa,
  ChecklistTemplate,
  ControlledDocument,
  Entity,
  EvidenceRecord,
  Finding,
  ManagementReview,
  Obligation,
  Person,
  Regulation,
  RegulatoryAlert,
  Risk,
  Role,
} from "./types";

export const organisation = {
  id: "org-kfc-india",
  name: "KFC India Demo",
  sector: "Quick Service Restaurants",
  frameworks: ["ISO 9001:2015", "FSSAI", "Labour Codes", "GST", "EHS"],
};

export const entities: Entity[] = [
  {
    id: "ent-mumbai",
    name: "Mumbai Corporate Office",
    shortName: "Mumbai HO",
    city: "Mumbai",
    state: "Maharashtra",
    type: "Corporate",
    gstin: "27AABCK1234M1Z5",
    headcount: 142,
    score: 91,
    trend: 2.4,
    openIssues: 3,
  },
  {
    id: "ent-pune",
    name: "Pune FC Road Restaurant",
    shortName: "Pune FC Road",
    city: "Pune",
    state: "Maharashtra",
    type: "Restaurant",
    gstin: "27AABCK1234M2Z4",
    headcount: 38,
    score: 78,
    trend: -1.8,
    openIssues: 5,
  },
  {
    id: "ent-bengaluru",
    name: "Bengaluru Indiranagar Restaurant",
    shortName: "Bengaluru Indiranagar",
    city: "Bengaluru",
    state: "Karnataka",
    type: "Restaurant",
    gstin: "29AABCK1234M1Z2",
    headcount: 44,
    score: 73,
    trend: -3.1,
    openIssues: 6,
  },
  {
    id: "ent-hyderabad",
    name: "Hyderabad Banjara Hills Restaurant",
    shortName: "Hyderabad Banjara Hills",
    city: "Hyderabad",
    state: "Telangana",
    type: "Restaurant",
    gstin: "36AABCK1234M1Z7",
    headcount: 41,
    score: 82,
    trend: 1.2,
    openIssues: 4,
  },
  {
    id: "ent-delhi",
    name: "Delhi Connaught Place Restaurant",
    shortName: "Delhi CP",
    city: "New Delhi",
    state: "Delhi",
    type: "Restaurant",
    gstin: "07AABCK1234M1Z9",
    headcount: 47,
    score: 69,
    trend: -4.6,
    openIssues: 7,
  },
];

export const roles: Role[] = [
  {
    id: "group-cxo",
    name: "Group CXO",
    scope: "All entities",
    permissions: [
      "view.command-center",
      "view.financials",
      "export.board-pack",
    ],
  },
  {
    id: "board-member",
    name: "Board Member",
    scope: "All entities (read)",
    permissions: ["view.command-center", "view.financials", "export.board-pack"],
  },
  {
    id: "compliance-officer",
    name: "Compliance Officer",
    scope: "All entities",
    permissions: [
      "view.command-center",
      "view.financials",
      "upload.evidence",
      "export.board-pack",
    ],
  },
  {
    id: "qms-manager",
    name: "QMS Manager",
    scope: "Quality management",
    permissions: ["view.command-center", "approve.document", "verify.effectiveness", "upload.evidence"],
  },
  {
    id: "entity-manager",
    name: "Entity Manager",
    scope: "Single entity",
    permissions: ["view.command-center", "upload.evidence"],
  },
  { id: "process-owner", name: "Process Owner", scope: "Assigned processes", permissions: ["upload.evidence"] },
  { id: "risk-owner", name: "Risk Owner", scope: "Assigned risks", permissions: ["view.command-center"] },
  { id: "internal-auditor", name: "Internal Auditor", scope: "Audit programme", permissions: ["upload.evidence"] },
  { id: "audit-lead", name: "Audit Lead", scope: "Audit programme", permissions: ["sign.record", "upload.evidence"] },
  { id: "capa-owner", name: "CAPA Owner", scope: "Assigned CAPAs", permissions: ["upload.evidence"] },
  { id: "qa-approver", name: "QA Approver", scope: "Document control", permissions: ["approve.document", "sign.record"] },
  { id: "legal-secretarial", name: "Legal / Secretarial", scope: "Secretarial", permissions: ["sign.record", "upload.evidence"] },
  { id: "tax-user", name: "Tax User", scope: "Tax & GST", permissions: ["view.financials", "upload.evidence"] },
  { id: "ehs-manager", name: "EHS Manager", scope: "EHS", permissions: ["upload.evidence", "verify.effectiveness"] },
  { id: "evidence-contributor", name: "Evidence Contributor", scope: "Assigned tasks", permissions: ["upload.evidence"] },
  {
    id: "external-auditor",
    name: "Read-only External Auditor",
    scope: "Shared scope only",
    permissions: [],
    watermarkExports: true,
  },
  { id: "system-admin", name: "System Admin", scope: "Platform", permissions: ["manage.admin", "view.command-center"] },
];

export const people: Person[] = [
  { id: "p-01", name: "Ananya Rao", initials: "AR", title: "Group Chief Compliance Officer", entityId: "all", roleId: "compliance-officer" },
  { id: "p-02", name: "Rohit Mehra", initials: "RM", title: "Group CEO", entityId: "all", roleId: "group-cxo" },
  { id: "p-03", name: "Kavita Iyer", initials: "KI", title: "QMS Manager", entityId: "ent-mumbai", roleId: "qms-manager" },
  { id: "p-04", name: "Sandeep Kulkarni", initials: "SK", title: "Restaurant General Manager", entityId: "ent-pune", roleId: "entity-manager" },
  { id: "p-05", name: "Deepa Nair", initials: "DN", title: "Restaurant General Manager", entityId: "ent-bengaluru", roleId: "entity-manager" },
  { id: "p-06", name: "Imran Sheikh", initials: "IS", title: "Restaurant General Manager", entityId: "ent-hyderabad", roleId: "entity-manager" },
  { id: "p-07", name: "Nikhil Bansal", initials: "NB", title: "Restaurant General Manager", entityId: "ent-delhi", roleId: "entity-manager" },
  { id: "p-08", name: "Priya Desai", initials: "PD", title: "Company Secretary", entityId: "ent-mumbai", roleId: "legal-secretarial" },
  { id: "p-09", name: "Arvind Shetty", initials: "AS", title: "Indirect Tax Lead", entityId: "ent-mumbai", roleId: "tax-user" },
  { id: "p-10", name: "Meera Joshi", initials: "MJ", title: "EHS Manager — West", entityId: "ent-pune", roleId: "ehs-manager" },
  { id: "p-11", name: "Vikram Singh", initials: "VS", title: "Audit Lead", entityId: "all", roleId: "audit-lead" },
  { id: "p-12", name: "Sneha Pillai", initials: "SP", title: "Internal Auditor", entityId: "all", roleId: "internal-auditor" },
  { id: "p-13", name: "Rahul Verma", initials: "RV", title: "QA Approver", entityId: "ent-mumbai", roleId: "qa-approver" },
  { id: "p-14", name: "Farah Khan", initials: "FK", title: "Labour Compliance Specialist", entityId: "all", roleId: "process-owner" },
  { id: "p-15", name: "Tanmay Ghosh", initials: "TG", title: "Cold Chain Process Owner", entityId: "ent-delhi", roleId: "process-owner" },
];

export const regulations: Regulation[] = [
  { id: "reg-gst", title: "Central Goods and Services Tax Act, 2017", authority: "CBIC", module: "tax", effectiveFrom: "01-Jul-2017" },
  { id: "reg-oshwc", title: "Occupational Safety, Health and Working Conditions Code, 2020", authority: "Ministry of Labour & Employment", module: "labour", effectiveFrom: "29-Sep-2020" },
  { id: "reg-bocw", title: "Building and Other Construction Workers Act, 1996", authority: "State Labour Department", module: "labour", effectiveFrom: "01-Mar-1996" },
  { id: "reg-posh", title: "Sexual Harassment of Women at Workplace Act, 2013", authority: "Ministry of Women & Child Development", module: "labour", effectiveFrom: "09-Dec-2013" },
  { id: "reg-fssai", title: "Food Safety and Standards Act, 2006", authority: "FSSAI", module: "fssai", effectiveFrom: "23-Aug-2006" },
  { id: "reg-ca2013", title: "Companies Act, 2013", authority: "MCA", module: "secretarial", effectiveFrom: "01-Apr-2014" },
  { id: "reg-cpcb", title: "Water & Air (Prevention and Control of Pollution) Acts", authority: "CPCB / SPCB", module: "ehs", effectiveFrom: "01-Apr-1981" },
  { id: "reg-iso9001", title: "ISO 9001:2015 Quality Management Systems", authority: "BIS / Certification Body", module: "qms", effectiveFrom: "15-Sep-2015" },
];

export const regulatoryAlerts: RegulatoryAlert[] = [
  {
    id: "RA-2026-041",
    title: "CBIC tightens GSTR-3B input tax credit reconciliation disclosures",
    authority: "CBIC",
    module: "tax",
    publishedOn: "22-Sep-2026",
    impact: "major",
    status: "awaiting-impact-assessment",
    summary:
      "Monthly GSTR-3B filers must disclose ITC reversal workings aligned to GSTR-2B at GSTIN level. Bengaluru reconciliation variance is already under scrutiny.",
    affectedEntityIds: ["ent-mumbai", "ent-bengaluru", "ent-delhi"],
    linkedObligationIds: ["OBL-0102", "OBL-0104"],
  },
  {
    id: "RA-2026-038",
    title: "Telangana SPCB revises environmental monitoring report sign-off norms",
    authority: "Telangana SPCB",
    module: "ehs",
    publishedOn: "15-Sep-2026",
    impact: "major",
    status: "awaiting-impact-assessment",
    summary:
      "Monitoring reports must carry a counter-signature by the occupier within 7 days of lab issue. Hyderabad has an open review-signature gap.",
    affectedEntityIds: ["ent-hyderabad"],
    linkedObligationIds: ["OBL-0107"],
  },
  {
    id: "RA-2026-033",
    title: "Maharashtra BOCW cess compliance drive for contractor-led fit-outs",
    authority: "Maharashtra Labour Department",
    module: "labour",
    publishedOn: "08-Sep-2026",
    impact: "moderate",
    status: "awaiting-impact-assessment",
    summary:
      "Principal employers must retain contractor BOCW registrations and safety induction records for all fit-out work. Pune fit-out contractor pack is incomplete.",
    affectedEntityIds: ["ent-pune"],
    linkedObligationIds: ["OBL-0105"],
  },
  {
    id: "RA-2026-029",
    title: "FSSAI advisory on cold chain excursion disposition records",
    authority: "FSSAI",
    module: "fssai",
    publishedOn: "29-Aug-2026",
    impact: "critical",
    status: "assessed",
    summary:
      "Every temperature excursion needs a documented disposition decision signed by a trained supervisor. Delhi CP disposition control is assessed as weak.",
    affectedEntityIds: ["ent-delhi", "ent-pune"],
    linkedObligationIds: ["OBL-0108"],
  },
  {
    id: "RA-2026-025",
    title: "MCA extends DIR-3 KYC web filing window",
    authority: "MCA",
    module: "secretarial",
    publishedOn: "18-Aug-2026",
    impact: "minor",
    status: "implemented",
    summary: "Filing window extended by 15 days; no change to directors' underlying obligation.",
    affectedEntityIds: ["ent-mumbai"],
    linkedObligationIds: ["OBL-0106"],
  },
];

export const obligations: Obligation[] = [
  { id: "OBL-0101", title: "Monthly GSTR-1 outward supplies return", regulationId: "reg-gst", module: "tax", entityId: "ent-mumbai", ownerId: "p-09", frequency: "Monthly", dueDate: "11-Oct-2026", statutoryLocked: true, status: "in-progress", evidenceIds: ["EV-0001"], riskIds: [] },
  { id: "OBL-0102", title: "Monthly GSTR-3B summary return & ITC reconciliation", regulationId: "reg-gst", module: "tax", entityId: "ent-bengaluru", ownerId: "p-09", frequency: "Monthly", dueDate: "20-Oct-2026", statutoryLocked: true, status: "attention", evidenceIds: ["EV-0002", "EV-0003"], riskIds: ["RSK-0005"] },
  { id: "OBL-0103", title: "TDS payment (Section 194C contractor payments)", regulationId: "reg-gst", module: "tax", entityId: "ent-pune", ownerId: "p-09", frequency: "Monthly", dueDate: "07-Oct-2026", statutoryLocked: true, status: "overdue", evidenceIds: ["EV-0004"], riskIds: [] },
  { id: "OBL-0104", title: "PF & ESI monthly contribution and ECR filing", regulationId: "reg-oshwc", module: "labour", entityId: "ent-delhi", ownerId: "p-14", frequency: "Monthly", dueDate: "15-Oct-2026", statutoryLocked: true, status: "in-progress", evidenceIds: ["EV-0005"], riskIds: [] },
  { id: "OBL-0105", title: "Contractor BOCW registration & safety induction pack", regulationId: "reg-bocw", module: "labour", entityId: "ent-pune", ownerId: "p-10", frequency: "Event-based", dueDate: "09-Oct-2026", statutoryLocked: false, status: "overdue", evidenceIds: ["EV-0006"], riskIds: ["RSK-0003"] },
  { id: "OBL-0106", title: "Annual return MGT-7 and DIR-3 KYC filings", regulationId: "reg-ca2013", module: "secretarial", entityId: "ent-mumbai", ownerId: "p-08", frequency: "Annual", dueDate: "29-Nov-2026", statutoryLocked: true, status: "compliant", evidenceIds: ["EV-0007"], riskIds: [] },
  { id: "OBL-0107", title: "Quarterly environmental monitoring report submission", regulationId: "reg-cpcb", module: "ehs", entityId: "ent-hyderabad", ownerId: "p-10", frequency: "Quarterly", dueDate: "14-Oct-2026", statutoryLocked: true, status: "attention", evidenceIds: ["EV-0008"], riskIds: ["RSK-0002"] },
  { id: "OBL-0108", title: "Cold chain temperature log review & excursion disposition", regulationId: "reg-fssai", module: "fssai", entityId: "ent-delhi", ownerId: "p-15", frequency: "Monthly", dueDate: "05-Oct-2026", statutoryLocked: false, status: "critical", evidenceIds: ["EV-0009", "EV-0010"], riskIds: ["RSK-0001"] },
  { id: "OBL-0109", title: "POSH Internal Committee annual report to District Officer", regulationId: "reg-posh", module: "labour", entityId: "ent-mumbai", ownerId: "p-14", frequency: "Annual", dueDate: "31-Dec-2026", statutoryLocked: true, status: "in-progress", evidenceIds: ["EV-0011"], riskIds: [] },
  { id: "OBL-0110", title: "FSSAI licence renewal — Bengaluru Indiranagar", regulationId: "reg-fssai", module: "fssai", entityId: "ent-bengaluru", ownerId: "p-05", frequency: "Annual", dueDate: "28-Oct-2026", statutoryLocked: true, status: "attention", evidenceIds: ["EV-0012"], riskIds: [] },
  { id: "OBL-0111", title: "Thermometer & weighing scale calibration programme", regulationId: "reg-iso9001", module: "qms", entityId: "ent-bengaluru", ownerId: "p-03", frequency: "Quarterly", dueDate: "18-Oct-2026", statutoryLocked: false, status: "attention", evidenceIds: ["EV-0013"], riskIds: ["RSK-0007"] },
  { id: "OBL-0112", title: "Shops & Establishments registration renewal", regulationId: "reg-oshwc", module: "labour", entityId: "ent-hyderabad", ownerId: "p-06", frequency: "Annual", dueDate: "22-Dec-2026", statutoryLocked: true, status: "compliant", evidenceIds: ["EV-0014"], riskIds: [] },
];

const taskSeed: Array<[string, string, string, string, string, CalendarTask["status"], number, CalendarTask["priority"]]> = [
  ["TSK-2401", "File GSTR-1 for Sep-2026", "OBL-0101", "ent-mumbai", "p-09", "in-progress", 0, "moderate"],
  ["TSK-2402", "Reconcile GSTR-2B vs purchase register", "OBL-0102", "ent-bengaluru", "p-09", "attention", 6, "major"],
  ["TSK-2403", "Deposit TDS challan for Sep-2026", "OBL-0103", "ent-pune", "p-09", "overdue", 14, "critical"],
  ["TSK-2404", "Upload PF ECR acknowledgement", "OBL-0104", "ent-delhi", "p-14", "in-progress", 2, "moderate"],
  ["TSK-2405", "Collect contractor BOCW registration copies", "OBL-0105", "ent-pune", "p-10", "overdue", 21, "critical"],
  ["TSK-2406", "Counter-sign Q2 environmental monitoring report", "OBL-0107", "ent-hyderabad", "p-06", "overdue", 9, "major"],
  ["TSK-2407", "Close out cold chain excursion dispositions", "OBL-0108", "ent-delhi", "p-15", "overdue", 18, "critical"],
  ["TSK-2408", "Compile POSH IC annual report inputs", "OBL-0109", "ent-mumbai", "p-14", "in-progress", 0, "minor"],
  ["TSK-2409", "Submit FSSAI renewal application", "OBL-0110", "ent-bengaluru", "p-05", "attention", 3, "major"],
  ["TSK-2410", "Schedule Q4 calibration vendor visit", "OBL-0111", "ent-bengaluru", "p-03", "attention", 5, "moderate"],
  ["TSK-2411", "Acknowledge revised cold chain SOP", "OBL-0108", "ent-pune", "p-04", "overdue", 11, "major"],
  ["TSK-2412", "Verify knife handling retraining attendance", "OBL-0111", "ent-bengaluru", "p-05", "overdue", 16, "critical"],
];

export const calendarTasks: CalendarTask[] = taskSeed.map(
  ([id, title, obligationId, entityId, ownerId, status, ageingDays, priority]) => ({
    id,
    title,
    obligationId,
    entityId,
    ownerId,
    dueDate: obligations.find((o) => o.id === obligationId)?.dueDate ?? "15-Oct-2026",
    status,
    ageingDays,
    priority,
  }),
);

const evidenceSeed: Array<[string, EvidenceRecord["type"], string, string, EvidenceRecord["module"], string, string | null]> = [
  ["GSTR-1 Aug-2026 filed return", "Return", "ent-mumbai", "p-09", "tax", "05-Sep-2026", null],
  ["GSTR-3B Aug-2026 filed return", "Return", "ent-bengaluru", "p-09", "tax", "18-Sep-2026", null],
  ["GSTR-2B reconciliation workbook Aug-2026", "Report", "ent-bengaluru", "p-09", "tax", "19-Sep-2026", null],
  ["TDS challan 281 — Aug-2026", "Challan", "ent-pune", "p-09", "tax", "06-Sep-2026", null],
  ["PF ECR acknowledgement Aug-2026", "Return", "ent-delhi", "p-14", "labour", "14-Sep-2026", null],
  ["Contractor safety induction register", "Register", "ent-pune", "p-10", "labour", "02-Sep-2026", "02-Sep-2027"],
  ["MGT-7 FY2025-26 filed copy", "Return", "ent-mumbai", "p-08", "secretarial", "26-Nov-2025", null],
  ["Q2 ambient air monitoring lab report", "Report", "ent-hyderabad", "p-10", "ehs", "08-Sep-2026", "08-Sep-2027"],
  ["Cold chain temperature log — Sep-2026", "Register", "ent-delhi", "p-15", "fssai", "30-Sep-2026", null],
  ["Excursion disposition decision sheet", "Report", "ent-delhi", "p-15", "fssai", "12-Sep-2026", null],
  ["POSH IC constitution order", "Certificate", "ent-mumbai", "p-14", "labour", "11-Jan-2026", "11-Jan-2029"],
  ["FSSAI licence — Bengaluru Indiranagar", "Certificate", "ent-bengaluru", "p-05", "fssai", "29-Oct-2023", "28-Oct-2026"],
  ["Thermometer calibration certificate set", "Certificate", "ent-bengaluru", "p-03", "qms", "20-Jul-2026", "20-Oct-2026"],
  ["Telangana Shops & Establishments registration", "Certificate", "ent-hyderabad", "p-06", "labour", "23-Dec-2025", "22-Dec-2026"],
  ["Fire NOC — Delhi CP", "Certificate", "ent-delhi", "p-07", "ehs", "15-Nov-2025", "14-Nov-2026"],
  ["Pest control service report Sep-2026", "Report", "ent-pune", "p-04", "fssai", "24-Sep-2026", null],
  ["Potable water test report", "Report", "ent-bengaluru", "p-05", "fssai", "03-Sep-2026", "03-Mar-2027"],
  ["Medical fitness certificates — food handlers", "Certificate", "ent-hyderabad", "p-06", "labour", "19-Feb-2026", "18-Feb-2027"],
  ["Knife handling retraining attendance sheet", "Register", "ent-bengaluru", "p-05", "qms", "27-Sep-2026", null],
  ["Internal audit IA-2026-03 working papers", "Report", "ent-bengaluru", "p-12", "qms", "21-Sep-2026", null],
  ["Internal audit IA-2026-02 issued report", "Report", "ent-delhi", "p-11", "qms", "09-Sep-2026", null],
  ["Management review MR-2026-Q2 minutes", "Minutes", "ent-mumbai", "p-02", "qms", "30-Jun-2026", null],
  ["Supplier cold chain audit certificate", "Certificate", "ent-mumbai", "p-03", "fssai", "14-Apr-2026", "13-Apr-2027"],
  ["Weighing scale calibration certificate", "Certificate", "ent-pune", "p-04", "qms", "11-Aug-2026", "11-Nov-2026"],
  ["Hazardous waste disposal manifest", "Register", "ent-hyderabad", "p-10", "ehs", "16-Sep-2026", null],
  ["Consent to operate — SPCB Telangana", "Certificate", "ent-hyderabad", "p-10", "ehs", "01-Apr-2024", "31-Mar-2027"],
  ["Contract labour licence — Pune fit-out", "Certificate", "ent-pune", "p-10", "labour", "05-Aug-2026", "04-Aug-2027"],
  ["Wage register Sep-2026", "Register", "ent-delhi", "p-14", "labour", "30-Sep-2026", null],
  ["Board meeting minutes — Aug-2026", "Minutes", "ent-mumbai", "p-08", "secretarial", "21-Aug-2026", null],
  ["Statutory register of directors", "Register", "ent-mumbai", "p-08", "secretarial", "01-Apr-2026", null],
  ["Eye-wash station inspection photos", "Photo", "ent-pune", "p-10", "ehs", "22-Sep-2026", null],
  ["Grease trap cleaning log", "Register", "ent-delhi", "p-07", "ehs", "26-Sep-2026", null],
  ["Allergen labelling verification report", "Report", "ent-mumbai", "p-03", "fssai", "17-Sep-2026", null],
  ["Customer complaint closure pack — Sep-2026", "Report", "ent-bengaluru", "p-05", "qms", "28-Sep-2026", null],
  ["Fire drill record — Hyderabad", "Register", "ent-hyderabad", "p-06", "ehs", "12-Sep-2026", null],
  ["Thermal imaging report — walk-in chiller", "Report", "ent-delhi", "p-15", "fssai", "20-Sep-2026", null],
];

export const evidenceRecords: EvidenceRecord[] = evidenceSeed.map(
  ([title, type, entityId, ownerId, module, issuedOn, expiresOn], i) => {
    const id = `EV-${String(i + 1).padStart(4, "0")}`;
    return {
      id,
      title,
      type,
      entityId,
      ownerId,
      module,
      sha256: `${(i + 7).toString(16).padStart(2, "0")}a3f${(i * 7919).toString(16)}c1d${(i * 104729).toString(16)}9e4b${(i + 31).toString(16)}f`.padEnd(64, "0").slice(0, 64),
      issuedOn,
      expiresOn,
      linkedRecordIds: obligations.filter((o) => o.evidenceIds.includes(id)).map((o) => o.id),
      accessHistory: [
        { at: issuedOn, by: people.find((p) => p.id === ownerId)?.name ?? "System", action: "Uploaded" },
        { at: "26-Sep-2026", by: "Ananya Rao", action: "Viewed" },
      ],
    };
  },
);

export const controlledDocuments: ControlledDocument[] = [
  { id: "DOC-0001", code: "SOP-FS-014", title: "Cold Chain Receiving & Excursion Disposition SOP", version: "4.2", status: "pending-approval", ownerId: "p-15", approverId: "p-13", entityId: "ent-delhi", effectiveFrom: "01-Oct-2026", nextReview: "01-Oct-2027", acknowledgementsPending: 9, acknowledgementsTotal: 47 },
  { id: "DOC-0002", code: "SOP-QA-002", title: "Knife Handling & Sharp Tools Safety SOP", version: "3.0", status: "approved", ownerId: "p-05", approverId: "p-13", entityId: "ent-bengaluru", effectiveFrom: "15-Aug-2026", nextReview: "15-Aug-2027", acknowledgementsPending: 6, acknowledgementsTotal: 44 },
  { id: "DOC-0003", code: "MAN-QMS-001", title: "Quality Management System Manual", version: "7.1", status: "approved", ownerId: "p-03", approverId: "p-13", entityId: "ent-mumbai", effectiveFrom: "01-Apr-2026", nextReview: "01-Apr-2027", acknowledgementsPending: 0, acknowledgementsTotal: 142 },
  { id: "DOC-0004", code: "SOP-EHS-009", title: "Environmental Monitoring & Report Review SOP", version: "2.3", status: "pending-approval", ownerId: "p-10", approverId: "p-03", entityId: "ent-hyderabad", effectiveFrom: "10-Oct-2026", nextReview: "10-Oct-2027", acknowledgementsPending: 11, acknowledgementsTotal: 41 },
  { id: "DOC-0005", code: "POL-HR-004", title: "POSH Policy & Internal Committee Charter", version: "5.0", status: "approved", ownerId: "p-14", approverId: "p-13", entityId: "ent-mumbai", effectiveFrom: "11-Jan-2026", nextReview: "11-Jan-2027", acknowledgementsPending: 3, acknowledgementsTotal: 142 },
  { id: "DOC-0006", code: "SOP-LAB-003", title: "Contractor Onboarding & BOCW Compliance SOP", version: "1.4", status: "draft", ownerId: "p-10", approverId: "p-03", entityId: "ent-pune", effectiveFrom: "20-Oct-2026", nextReview: "20-Oct-2027", acknowledgementsPending: 38, acknowledgementsTotal: 38 },
  { id: "DOC-0007", code: "SOP-QA-011", title: "Measuring Equipment Calibration SOP", version: "2.0", status: "approved", ownerId: "p-03", approverId: "p-13", entityId: "ent-mumbai", effectiveFrom: "01-Jul-2026", nextReview: "01-Jul-2027", acknowledgementsPending: 4, acknowledgementsTotal: 56 },
  { id: "DOC-0008", code: "SOP-TAX-006", title: "GST Input Tax Credit Reconciliation SOP", version: "3.1", status: "approved", ownerId: "p-09", approverId: "p-13", entityId: "ent-mumbai", effectiveFrom: "01-Sep-2026", nextReview: "01-Sep-2027", acknowledgementsPending: 2, acknowledgementsTotal: 18 },
];

export const risks: Risk[] = [
  { id: "RSK-0001", title: "Cold chain excursion disposition weakness leading to unsafe product release", entityId: "ent-delhi", ownerId: "p-15", module: "fssai", likelihood: 4, impact: 5, appetiteThreshold: 12, treatment: "Mitigate", status: "critical", linkedCapaIds: ["CAPA-0001", "CAPA-0002"] },
  { id: "RSK-0002", title: "Environmental monitoring reports submitted without occupier review signature", entityId: "ent-hyderabad", ownerId: "p-10", module: "ehs", likelihood: 4, impact: 4, appetiteThreshold: 12, treatment: "Mitigate", status: "attention", linkedCapaIds: ["CAPA-0003"] },
  { id: "RSK-0003", title: "Contractor and BOCW safety controls not enforced at Pune fit-out", entityId: "ent-pune", ownerId: "p-10", module: "labour", likelihood: 3, impact: 5, appetiteThreshold: 12, treatment: "Mitigate", status: "attention", linkedCapaIds: ["CAPA-0004", "CAPA-0005"] },
  { id: "RSK-0004", title: "Recurring knife-handling injuries at Bengaluru Indiranagar", entityId: "ent-bengaluru", ownerId: "p-05", module: "qms", likelihood: 4, impact: 3, appetiteThreshold: 9, treatment: "Mitigate", status: "attention", linkedCapaIds: ["CAPA-0006", "CAPA-0007"] },
  { id: "RSK-0005", title: "GST reconciliation variance exposing entity to departmental scrutiny", entityId: "ent-bengaluru", ownerId: "p-09", module: "tax", likelihood: 3, impact: 4, appetiteThreshold: 9, treatment: "Mitigate", status: "attention", linkedCapaIds: ["CAPA-0008"] },
  { id: "RSK-0006", title: "Pending document acknowledgements leaving staff on superseded SOPs", entityId: "ent-mumbai", ownerId: "p-03", module: "qms", likelihood: 3, impact: 3, appetiteThreshold: 9, treatment: "Mitigate", status: "in-progress", linkedCapaIds: ["CAPA-0009"] },
  { id: "RSK-0007", title: "No cross-branch visibility of calibration status for critical instruments", entityId: "ent-bengaluru", ownerId: "p-03", module: "qms", likelihood: 3, impact: 3, appetiteThreshold: 9, treatment: "Mitigate", status: "in-progress", linkedCapaIds: ["CAPA-0010"] },
];

export const capas: Capa[] = [
  { id: "CAPA-0001", title: "Rebuild excursion disposition decision workflow with supervisor sign-off", source: "Audit Finding", entityId: "ent-delhi", actionOwnerId: "p-15", approverId: "p-03", verifierId: "p-11", severity: "critical", dueDate: "12-Oct-2026", stage: "Implementation", status: "overdue", independenceConflict: false, linkedFindingId: "FND-0001", linkedRiskId: "RSK-0001" },
  { id: "CAPA-0002", title: "Retrain Delhi CP shift supervisors on cold chain disposition rules", source: "Audit Finding", entityId: "ent-delhi", actionOwnerId: "p-07", approverId: "p-07", verifierId: "p-07", severity: "major", dueDate: "18-Oct-2026", stage: "Plan Approval", status: "attention", independenceConflict: true, linkedFindingId: "FND-0001", linkedRiskId: "RSK-0001" },
  { id: "CAPA-0003", title: "Introduce 7-day counter-signature control on monitoring reports", source: "Inspection", entityId: "ent-hyderabad", actionOwnerId: "p-10", approverId: "p-03", verifierId: "p-12", severity: "major", dueDate: "16-Oct-2026", stage: "Implementation", status: "in-progress", independenceConflict: false, linkedFindingId: "FND-0002", linkedRiskId: "RSK-0002" },
  { id: "CAPA-0004", title: "Collect and verify contractor BOCW registrations before site access", source: "Inspection", entityId: "ent-pune", actionOwnerId: "p-10", approverId: "p-01", verifierId: "p-12", severity: "critical", dueDate: "10-Oct-2026", stage: "Investigation", status: "overdue", independenceConflict: false, linkedRiskId: "RSK-0003" },
  { id: "CAPA-0005", title: "Mandatory safety induction gate for all fit-out contractors", source: "Internal Review", entityId: "ent-pune", actionOwnerId: "p-04", approverId: "p-10", verifierId: "p-11", severity: "major", dueDate: "24-Oct-2026", stage: "Plan Approval", status: "in-progress", independenceConflict: false, linkedRiskId: "RSK-0003" },
  { id: "CAPA-0006", title: "Replace worn knives and enforce cut-resistant glove usage", source: "Incident", entityId: "ent-bengaluru", actionOwnerId: "p-05", approverId: "p-03", verifierId: "p-12", severity: "major", dueDate: "14-Oct-2026", stage: "Implementation", status: "overdue", independenceConflict: false, linkedFindingId: "FND-0003", linkedRiskId: "RSK-0004" },
  { id: "CAPA-0007", title: "Monthly knife-handling competency re-verification", source: "Incident", entityId: "ent-bengaluru", actionOwnerId: "p-05", approverId: "p-03", verifierId: "p-11", severity: "moderate", dueDate: "31-Oct-2026", stage: "Effectiveness Verification", status: "in-progress", independenceConflict: false, linkedRiskId: "RSK-0004" },
  { id: "CAPA-0008", title: "Automate GSTR-2B vs purchase register variance reporting", source: "Internal Review", entityId: "ent-bengaluru", actionOwnerId: "p-09", approverId: "p-01", verifierId: "p-12", severity: "major", dueDate: "26-Oct-2026", stage: "Implementation", status: "in-progress", independenceConflict: false, linkedRiskId: "RSK-0005" },
  { id: "CAPA-0009", title: "Escalation workflow for overdue SOP acknowledgements", source: "Customer Complaint", entityId: "ent-mumbai", actionOwnerId: "p-03", approverId: "p-13", verifierId: "p-11", severity: "moderate", dueDate: "04-Nov-2026", stage: "Plan Approval", status: "in-progress", independenceConflict: false, linkedRiskId: "RSK-0006" },
  { id: "CAPA-0010", title: "Single cross-branch calibration register with expiry alerts", source: "Audit Finding", entityId: "ent-bengaluru", actionOwnerId: "p-03", approverId: "p-01", verifierId: "p-11", severity: "moderate", dueDate: "30-Oct-2026", stage: "Closed", status: "verified", independenceConflict: false, linkedFindingId: "FND-0004", linkedRiskId: "RSK-0007" },
];

export const checklistTemplates: ChecklistTemplate[] = [
  { id: "CHK-0001", title: "Food Safety & Cold Chain Internal Audit Checklist", module: "fssai", questions: 68, lastUpdated: "02-Sep-2026" },
  { id: "CHK-0002", title: "Labour & Contractor Compliance Checklist", module: "labour", questions: 52, lastUpdated: "19-Aug-2026" },
  { id: "CHK-0003", title: "ISO 9001 Process Audit Checklist", module: "qms", questions: 74, lastUpdated: "11-Sep-2026" },
];

export const audits: Audit[] = [
  { id: "IA-2026-01", title: "Labour & contractor compliance audit — Pune FC Road", entityId: "ent-pune", leadId: "p-11", scope: "Contract labour, BOCW, wage registers", plannedOn: "12-Aug-2026", status: "Issued", reportIssued: true, findingIds: [], checklistTemplateId: "CHK-0002" },
  { id: "IA-2026-02", title: "Cold chain and food safety audit — Delhi CP", entityId: "ent-delhi", leadId: "p-11", scope: "Receiving, storage, excursion disposition", plannedOn: "02-Sep-2026", status: "Issued", reportIssued: true, findingIds: ["FND-0001"], checklistTemplateId: "CHK-0001" },
  { id: "IA-2026-03", title: "ISO 9001 process audit — Bengaluru Indiranagar", entityId: "ent-bengaluru", leadId: "p-12", scope: "Training, calibration, incident management", plannedOn: "18-Sep-2026", status: "Reporting", reportIssued: false, findingIds: ["FND-0003", "FND-0004"], checklistTemplateId: "CHK-0003" },
  { id: "IA-2026-04", title: "EHS compliance audit — Hyderabad Banjara Hills", entityId: "ent-hyderabad", leadId: "p-12", scope: "Monitoring, waste, consents", plannedOn: "08-Oct-2026", status: "Fieldwork", reportIssued: false, findingIds: ["FND-0002"], checklistTemplateId: "CHK-0002" },
];

export const findings: Finding[] = [
  { id: "FND-0001", title: "Temperature excursions closed without documented disposition decision", auditId: "IA-2026-02", entityId: "ent-delhi", severity: "major", clause: "FSSAI Sch-4 / ISO 9001 cl.8.5.1", status: "in-progress", ownerId: "p-15", capaId: "CAPA-0001" },
  { id: "FND-0002", title: "Environmental monitoring report issued without occupier review signature", auditId: "IA-2026-04", entityId: "ent-hyderabad", severity: "major", clause: "SPCB consent condition 7(b)", status: "in-progress", ownerId: "p-10", capaId: "CAPA-0003" },
  { id: "FND-0003", title: "Recurring knife-handling injuries with no competency re-verification", auditId: "IA-2026-03", entityId: "ent-bengaluru", severity: "major", clause: "ISO 9001 cl.7.2", status: "in-progress", ownerId: "p-05", capaId: "CAPA-0006" },
  { id: "FND-0004", title: "Calibration status not visible across branches", auditId: "IA-2026-03", entityId: "ent-bengaluru", severity: "minor", clause: "ISO 9001 cl.7.1.5", status: "closed", ownerId: "p-03", capaId: "CAPA-0010" },
];

export const managementReviews: ManagementReview[] = [
  {
    id: "MR-2026-Q2",
    title: "Quarterly Management Review — Q2 FY2026-27",
    heldOn: "30-Jun-2026",
    chairId: "p-02",
    status: "Closed",
    quorumMet: true,
    inputs: [
      "Status of actions from previous review",
      "Changes in external and internal issues",
      "Customer satisfaction and feedback",
      "Quality objective performance",
      "Process performance and product conformity",
      "Nonconformities and corrective actions",
      "Monitoring and measurement results",
      "Audit results",
      "External provider performance",
      "Adequacy of resources",
      "Effectiveness of risk actions",
      "Opportunities for improvement",
      "Regulatory change log",
      "Statutory filing performance",
      "EHS incident summary",
      "Evidence completeness report",
    ].map((label, i) => ({ id: `MRI-${i + 1}`, label, locked: true })),
    outputs: [
      { id: "MRO-1", label: "Improvement opportunities", decision: "Fund cold chain sensor upgrade across all restaurants in Q3." },
      { id: "MRO-2", label: "QMS change needs", decision: "Revise SOP-FS-014 to mandate supervisor disposition sign-off." },
      { id: "MRO-3", label: "Resource needs", decision: "Add one EHS coordinator for the South region." },
    ],
    downstreamTaskIds: ["TSK-2407", "TSK-2410", "TSK-2412"],
  },
];

export const aiSuggestions: AiSuggestion[] = [
  {
    id: "AI-001",
    suggestion: "Raise a critical CAPA extension request for CAPA-0001 with a revised 26-Oct-2026 target.",
    why: "Implementation is 6 days past target, two of four actions are unstarted, and the linked risk RSK-0001 sits above appetite.",
    confidence: 0.86,
    sourceRecords: [
      { id: "CAPA-0001", label: "CAPA-0001 implementation log" },
      { id: "RSK-0001", label: "RSK-0001 risk score history" },
      { id: "FND-0001", label: "FND-0001 audit finding" },
    ],
    sourceExcerpts: [
      "\"Excursion disposition sheet not signed for 4 of 11 excursions in Sep-2026.\" — IA-2026-02 working papers",
      "\"Residual risk 20 against appetite 12.\" — RSK-0001 assessment",
    ],
    assumptions: ["Sensor upgrade purchase order approved in Q3 management review remains funded."],
    missingInfo: ["Vendor installation date for Delhi CP walk-in chiller sensors."],
  },
  {
    id: "AI-002",
    suggestion: "Map regulatory alert RA-2026-038 to obligation OBL-0107 and add a counter-signature checkpoint.",
    why: "The alert changes the sign-off window to 7 days, which the current obligation and SOP-EHS-009 v2.3 do not reflect.",
    confidence: 0.79,
    sourceRecords: [
      { id: "RA-2026-038", label: "Telangana SPCB circular" },
      { id: "OBL-0107", label: "OBL-0107 obligation definition" },
      { id: "DOC-0004", label: "SOP-EHS-009 v2.3 (pending approval)" },
    ],
    sourceExcerpts: [
      "\"...counter-signed by the occupier within seven days of laboratory issue.\" — SPCB circular, para 4",
    ],
    assumptions: ["Hyderabad remains the only entity under Telangana SPCB jurisdiction."],
    missingInfo: ["Whether the circular applies retrospectively to Q2 reports."],
  },
  {
    id: "AI-003",
    suggestion: "Flag an independence conflict on CAPA-0002 before plan approval.",
    why: "Nikhil Bansal is action owner, approver and effectiveness verifier on the same CAPA.",
    confidence: 0.94,
    sourceRecords: [{ id: "CAPA-0002", label: "CAPA-0002 assignment record" }],
    sourceExcerpts: ["\"Owner: Nikhil Bansal; Approver: Nikhil Bansal; Verifier: Nikhil Bansal.\""],
    assumptions: [],
    missingInfo: ["Preferred independent verifier for Delhi CP."],
  },
];

export const activityFeed: ActivityEvent[] = [
  { id: "ACT-01", at: "30-Sep-2026 18:42", actor: "Vikram Singh", action: "Issued audit report IA-2026-02 with one Major finding", recordId: "IA-2026-02", module: "qms" },
  { id: "ACT-02", at: "29-Sep-2026 11:05", actor: "Ananya Rao", action: "Escalated CAPA-0004 to Group Compliance", recordId: "CAPA-0004", module: "labour" },
  { id: "ACT-03", at: "28-Sep-2026 16:20", actor: "Kavita Iyer", action: "Approved document version MAN-QMS-001 v7.1", recordId: "DOC-0003", module: "qms" },
  { id: "ACT-04", at: "27-Sep-2026 09:14", actor: "Deepa Nair", action: "Uploaded knife handling retraining attendance sheet", recordId: "EV-0019", module: "qms" },
  { id: "ACT-05", at: "25-Sep-2026 14:33", actor: "Arvind Shetty", action: "Raised GST reconciliation variance of ₹4.2 lakh for review", recordId: "RSK-0005", module: "tax" },
  { id: "ACT-06", at: "23-Sep-2026 10:02", actor: "Meera Joshi", action: "Reassessed RSK-0003 to above appetite", recordId: "RSK-0003", module: "labour" },
  { id: "ACT-07", at: "22-Sep-2026 17:48", actor: "System", action: "Captured regulatory alert RA-2026-041 awaiting impact assessment", recordId: "RA-2026-041", module: "tax" },
];

export const postureTrend = [
  { period: "Apr-26", score: 74 },
  { period: "May-26", score: 76 },
  { period: "Jun-26", score: 79 },
  { period: "Jul-26", score: 81 },
  { period: "Aug-26", score: 80 },
  { period: "Sep-26", score: 79 },
  { period: "Oct-26", score: 78 },
];

export const taskAgeing = [
  { bucket: "0-7 days", count: 14 },
  { bucket: "8-15 days", count: 9 },
  { bucket: "16-30 days", count: 6 },
  { bucket: "31-60 days", count: 3 },
  { bucket: "60+ days", count: 1 },
];
