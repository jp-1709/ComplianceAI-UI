import { Link } from "@tanstack/react-router";
import type React from "react";

import { cn } from "@/lib/utils";

type RecordLinkProps = {
  id: string;
  className?: string;
  children?: React.ReactNode;
};

function recordRouteFor(id: string) {
  if (id.startsWith("RSK-")) return { to: "/qms/risks/$id", params: { id } };
  if (id.startsWith("CAPA-")) return { to: "/qms/capa/$id", params: { id } };
  if (id.startsWith("FND-")) return { to: "/qms/audits/findings/$id", params: { id } };
  if (id.startsWith("IA-")) return { to: "/qms/audits/$id", params: { id } };
  if (id.startsWith("OBL-")) return { to: "/obligations/$id", params: { id } };
  if (id.startsWith("DOC-")) return { to: "/qms/documents/$id", params: { id } };
  if (id.startsWith("MR-")) return { to: "/qms/management-reviews/$id", params: { id } };
  if (id.startsWith("GST-NOT-") || id.startsWith("TDS-NOT-"))
    return { to: "/tax/notices/$id", params: { id } };
  if (id.startsWith("GST-FIL-") || id.startsWith("TDS-FIL-"))
    return { to: "/tax/filings/$id", params: { id } };
  if (id.startsWith("ITC-")) return { to: "/tax/reconciliation/$id", params: { id } };
  if (id.startsWith("INC-")) return { to: "/ehs/incidents/$id", params: { id } };
  if (id.startsWith("MON-")) return { to: "/ehs/monitoring/$id", params: { id } };
  if (id.startsWith("EHS-LIC-")) return { to: "/ehs/licences/$id", params: { id } };
  if (id.startsWith("EST-")) return { to: "/labour/establishments/$id", params: { id } };
  if (id.startsWith("CTR-")) return { to: "/labour/contractors/$id", params: { id } };
  if (id.startsWith("LAB-INS-")) return { to: "/labour/inspections/$id", params: { id } };
  if (id.startsWith("DIR-")) return { to: "/secretarial/directors/$id", params: { id } };
  if (id.startsWith("BM-")) return { to: "/secretarial/meetings/$id", params: { id } };
  if (id.startsWith("MCA-")) return { to: "/secretarial/filings/$id", params: { id } };
  if (id.startsWith("EV-")) return { to: "/evidence", params: {} };
  if (id.startsWith("RA-")) return { to: "/regulatory/alerts", params: {} };
  if (id.startsWith("TSK-")) return { to: "/my-work", params: {} };
  return null;
}

export function RecordLink({ id, className, children }: RecordLinkProps) {
  const route = recordRouteFor(id);
  const content = children ?? id;
  const classes = cn("font-mono text-primary underline-offset-2 hover:underline", className);

  if (!route) {
    return <span className={cn("font-mono", className)}>{content}</span>;
  }

  return (
    <Link to={route.to} params={route.params} className={classes}>
      {content}
    </Link>
  );
}
