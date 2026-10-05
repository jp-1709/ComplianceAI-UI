import { useState, type ReactElement } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { entities, people } from "@/data/kfc";
import { createAudit, createCapa, createRisk } from "@/services/qms";
import { createDocument, createManagementReview } from "@/services/governance";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({
  title: z.string().trim().min(5, "Enter a descriptive title"),
  entityId: z.string().min(1, "Choose an entity"),
  ownerId: z.string().min(1, "Choose an owner"),
  dueDate: z
    .string()
    .trim()
    .regex(/^\d{2}-[A-Za-z]{3}-\d{4}$/, "Use DD-MMM-YYYY, for example 31-Oct-2026"),
});

type Values = z.infer<typeof schema>;
type Kind = "document" | "risk" | "capa" | "audit" | "review";

const config: Record<
  Kind,
  { title: string; description: string; action: string; queryKey: readonly string[] }
> = {
  document: {
    title: "Create controlled document",
    description: "Start a traceable draft. Approval and publication remain human-controlled.",
    action: "Create document draft",
    queryKey: ["controlled-documents"],
  },
  risk: {
    title: "Add enterprise risk",
    description: "Create a draft risk assessment for control mapping and owner review.",
    action: "Add risk to register",
    queryKey: ["qms", "risks"],
  },
  capa: {
    title: "Raise CAPA",
    description: "Open a corrective action in Draft. Independent roles can be assigned next.",
    action: "Raise draft CAPA",
    queryKey: ["qms", "capas"],
  },
  audit: {
    title: "Start internal audit",
    description: "Create a planned audit and continue into scope and checklist preparation.",
    action: "Create audit plan",
    queryKey: ["qms", "audits"],
  },
  review: {
    title: "Schedule management review",
    description: "Create a review cycle with the standard 16-input agenda ready for planning.",
    action: "Schedule review cycle",
    queryKey: ["management-reviews"],
  },
};

export function CreateQmsRecordDialog({
  kind,
  trigger,
  onCreated,
}: {
  kind: Kind;
  trigger: ReactElement;
  onCreated: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const settings = config[kind];
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      entityId: "ent-mumbai",
      ownerId: "p-03",
      dueDate: "31-Oct-2026",
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: Values) => {
      if (kind === "document") return createDocument(values);
      if (kind === "risk") return createRisk(values);
      if (kind === "capa") return createCapa(values);
      if (kind === "audit") return createAudit(values);
      return createManagementReview(values);
    },
    onSuccess: async (record) => {
      await queryClient.invalidateQueries({ queryKey: [...settings.queryKey] });
      setOpen(false);
      form.reset();
      toast.success(`${record.id} created as a draft`, {
        description: "The audit trail records this human-created action.",
      });
      onCreated(record.id);
    },
    onError: () => toast.error("The record could not be created. Please try again."),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{settings.title}</DialogTitle>
          <DialogDescription>{settings.description}</DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
        >
          <div className="space-y-2">
            <Label htmlFor={`${kind}-title`}>Title</Label>
            <Input
              id={`${kind}-title`}
              autoFocus
              aria-invalid={Boolean(form.formState.errors.title)}
              {...form.register("title")}
            />
            {form.formState.errors.title && (
              <p className="text-xs text-critical">{form.formState.errors.title.message}</p>
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor={`${kind}-entity`}>Entity</Label>
              <select
                id={`${kind}-entity`}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                {...form.register("entityId")}
              >
                {entities.map((entity) => (
                  <option key={entity.id} value={entity.id}>
                    {entity.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${kind}-owner`}>{kind === "review" ? "Chair" : "Owner"}</Label>
              <select
                id={`${kind}-owner`}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                {...form.register("ownerId")}
              >
                {people.map((person) => (
                  <option key={person.id} value={person.id}>
                    {person.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${kind}-due-date`}>
              {kind === "audit" || kind === "review" ? "Planned date" : "Due / review date"}
            </Label>
            <Input
              id={`${kind}-due-date`}
              placeholder="DD-MMM-YYYY"
              aria-invalid={Boolean(form.formState.errors.dueDate)}
              {...form.register("dueDate")}
            />
            {form.formState.errors.dueDate && (
              <p className="text-xs text-critical">{form.formState.errors.dueDate.message}</p>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Creating…" : settings.action}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
