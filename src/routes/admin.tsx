import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  BellRing,
  Database,
  KeyRound,
  Network,
  Plus,
  Save,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { getAdminWorkspace } from "@/services/platform";
import { useUnsavedChanges } from "@/hooks/use-unsaved-changes";
import { Breadcrumbs, MetricCard, Panel, PermissionGate } from "@/components/grc/widgets";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
export const Route = createFileRoute("/admin")({ component: AdminCenter });
function AdminCenter() {
  const { data } = useQuery({ queryKey: ["admin"], queryFn: getAdminWorkspace });
  const [dirty, setDirty] = useState(false);
  useUnsavedChanges(dirty);
  return (
    <PermissionGate
      permission="manage.admin"
      fallback={
        <div className="mx-auto max-w-xl py-24 text-center">
          <ShieldCheck className="mx-auto size-10 text-muted-foreground" />
          <h1 className="mt-4 text-xl font-semibold">Administration access required</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Switch to System Admin or an authorised Compliance Officer role.
          </p>
        </div>
      }
    >
      <div className="mx-auto max-w-[1700px] space-y-5">
        <Breadcrumbs
          items={[{ label: "Home", to: "/command-center" }, { label: "Administration" }]}
        />
        <div className="flex justify-between gap-3">
          <div>
            <div className="text-xs font-semibold uppercase text-primary">Platform governance</div>
            <h1 className="mt-1 text-2xl font-semibold">Administration</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Identity, scoped access, delegation, retention, notifications and workflow controls.
            </p>
          </div>
          <Button
            onClick={() => {
              setDirty(false);
              toast.success("Administration settings saved with audit event");
            }}
          >
            <Save className="size-4" /> Save settings
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <MetricCard
            label="Active users"
            value={data?.users.length ?? 0}
            hint="Role and entity scoped"
            to="/admin"
            icon={Users}
          />
          <MetricCard
            label="Configured roles"
            value={data?.roles.length ?? 0}
            hint="Least-privilege permission sets"
            to="/admin"
            icon={KeyRound}
          />
          <MetricCard
            label="Active delegations"
            value={data?.delegations.filter((item) => item.status !== "Ended").length ?? 0}
            hint="Time-bound authority"
            to="/admin"
            icon={Network}
          />
          <MetricCard
            label="Retention policies"
            value={6}
            hint="Module-specific schedules"
            to="/admin"
            icon={Database}
          />
        </div>
        <Tabs defaultValue="users">
          <TabsList className="max-w-full overflow-x-auto">
            <TabsTrigger value="users">Users & access</TabsTrigger>
            <TabsTrigger value="roles">Roles & permissions</TabsTrigger>
            <TabsTrigger value="delegation">Delegation</TabsTrigger>
            <TabsTrigger value="retention">Retention</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="workflows">Workflows</TabsTrigger>
          </TabsList>
          <TabsContent value="users">
            <Panel
              title="User, entity and module access matrix"
              action={
                <Button size="sm">
                  <Plus className="size-3.5" /> Invite user
                </Button>
              }
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b bg-muted/40 text-xs text-muted-foreground">
                    <tr>
                      <th className="p-3">User</th>
                      <th className="p-3">Role</th>
                      <th className="p-3">Entity access</th>
                      <th className="p-3">Module access</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Last active</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {data?.users.map((user) => (
                      <tr key={user.id}>
                        <td className="p-3">
                          <div className="font-medium">{user.name}</div>
                          <div className="text-xs text-muted-foreground">{user.title}</div>
                        </td>
                        <td className="p-3 text-xs">{user.role}</td>
                        <td className="p-3 text-xs">{user.entityAccess}</td>
                        <td className="p-3 text-xs">{user.modules}</td>
                        <td className="p-3 text-xs text-compliant">{user.status}</td>
                        <td className="p-3 text-xs text-muted-foreground">{user.lastActive}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>
          </TabsContent>
          <TabsContent value="roles">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {data?.roles.map((role) => (
                <Panel key={role.id} title={role.name}>
                  <div className="text-xs text-muted-foreground">{role.scope}</div>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {role.permissions.length ? (
                      role.permissions.map((permission) => (
                        <span key={permission} className="rounded bg-muted px-2 py-1 text-[10px]">
                          {permission}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        Scoped record permissions only
                      </span>
                    )}
                  </div>
                  {role.watermarkExports && (
                    <div className="mt-3 rounded border p-2 text-[10px]">
                      Exports automatically watermarked
                    </div>
                  )}
                </Panel>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="delegation">
            <Panel
              title="Time-bound delegation register"
              action={
                <Button size="sm">
                  <Plus className="size-3.5" /> Add delegation
                </Button>
              }
            >
              <div className="space-y-2">
                {data?.delegations.map((item) => (
                  <div
                    key={item.id}
                    className="grid gap-3 rounded-lg border p-4 md:grid-cols-[100px_1fr_1fr_180px_100px]"
                  >
                    <span className="font-mono text-xs">{item.id}</span>
                    <span className="text-sm">
                      {item.from} → {item.to}
                    </span>
                    <span className="text-sm">{item.scope}</span>
                    <span className="text-xs">
                      {item.start} – {item.end}
                    </span>
                    <span className="text-xs">{item.status}</span>
                  </div>
                ))}
              </div>
            </Panel>
          </TabsContent>
          <TabsContent value="retention">
            <SettingsPanel
              title="Retention policies"
              items={[
                "Tax and GST records · 8 financial years",
                "Secretarial registers and signed minutes · Permanent",
                "Labour registers · 7 years",
                "EHS licences and monitoring · 7 years after expiry",
                "QMS evidence and audit records · 7 years",
                "AI Decision Log · Permanent",
              ]}
              dirty={setDirty}
            />
          </TabsContent>
          <TabsContent value="notifications">
            <SettingsPanel
              title="Notification settings"
              items={[
                "Critical overdue escalation · Immediate",
                "Statutory deadline reminder · 30, 15, 7 and 1 days",
                "Evidence expiry reminder · 90, 60 and 30 days",
                "Approval ageing reminder · Every 2 business days",
                "Regulatory alert digest · Daily at 08:00",
              ]}
              dirty={setDirty}
              icon={BellRing}
            />
          </TabsContent>
          <TabsContent value="workflows">
            <SettingsPanel
              title="Workflow controls"
              items={[
                "Enforce CAPA role independence",
                "Block statutory date rescheduling",
                "Require evidence provenance before review",
                "Require quorum before management decisions",
                "Require legal review for authority responses",
                "Watermark external-auditor exports",
              ]}
              dirty={setDirty}
              icon={Settings}
            />
          </TabsContent>
        </Tabs>
      </div>
    </PermissionGate>
  );
}
function SettingsPanel({
  title,
  items,
  dirty,
  icon: Icon = Database,
}: {
  title: string;
  items: string[];
  dirty: (value: boolean) => void;
  icon?: typeof Database;
}) {
  return (
    <Panel title={title}>
      <div className="space-y-3">
        {items.map((item) => (
          <label
            key={item}
            className="flex items-center justify-between gap-4 rounded-lg border p-4"
          >
            <div className="flex items-center gap-3 text-sm">
              <Icon className="size-4 text-primary" />
              {item}
            </div>
            <Switch defaultChecked onCheckedChange={() => dirty(true)} />
          </label>
        ))}
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <label className="text-xs font-medium">
          Policy owner
          <Input
            className="mt-1"
            defaultValue="Group Compliance Office"
            onChange={() => dirty(true)}
          />
        </label>
        <label className="text-xs font-medium">
          Annual review date
          <Input className="mt-1" defaultValue="31-Mar-2027" onChange={() => dirty(true)} />
        </label>
      </div>
    </Panel>
  );
}
