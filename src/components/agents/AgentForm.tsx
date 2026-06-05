"use client";

import { useActionState, useTransition } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  createAgentSchema,
  type CreateAgentInput,
} from "@/lib/validation/agent";
import {
  initialAgentFormState,
  type AgentFormState,
} from "@/app/agents/form-state";

type Action = (
  state: AgentFormState,
  formData: FormData,
) => Promise<AgentFormState>;

type AgentFormProps = {
  action: Action;
  submitLabel: string;
  defaultValues?: Partial<CreateAgentInput> & { id?: string };
};

function toDateInputValue(value: string | undefined): string {
  if (!value) return new Date().toISOString().slice(0, 10);
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toISOString().slice(0, 10);
}

export function AgentForm({ action, submitLabel, defaultValues }: AgentFormProps) {
  const [state, formAction] = useActionState(action, initialAgentFormState);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateAgentInput>({
    resolver: zodResolver(createAgentSchema),
    defaultValues: {
      name: defaultValues?.name ?? "",
      modelFamily: defaultValues?.modelFamily ?? "",
      intakeDate: toDateInputValue(defaultValues?.intakeDate),
    },
  });

  const onSubmit: SubmitHandler<CreateAgentInput> = (data) => {
    const fd = new FormData();
    if (defaultValues?.id) fd.append("id", defaultValues.id);
    fd.append("name", data.name);
    fd.append("modelFamily", data.modelFamily);
    fd.append("intakeDate", data.intakeDate);
    startTransition(() => formAction(fd));
  };

  const serverErrors = state.status === "error" ? state.fieldErrors ?? {} : {};
  const fieldError = (key: keyof CreateAgentInput) =>
    errors[key]?.message ?? serverErrors[key];

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mx-auto w-full max-w-xl space-y-6"
      noValidate
    >
      {state.status === "error" && !state.fieldErrors ? (
        <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
          {state.message}
        </p>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            placeholder="Claudia"
            autoComplete="off"
            aria-invalid={Boolean(fieldError("name")) || undefined}
            {...register("name")}
          />
          {fieldError("name") ? (
            <p className="text-xs text-red-600 dark:text-red-400">
              {fieldError("name")}
            </p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="modelFamily">Model family</Label>
          <Input
            id="modelFamily"
            placeholder="Claude"
            autoComplete="off"
            aria-invalid={Boolean(fieldError("modelFamily")) || undefined}
            {...register("modelFamily")}
          />
          {fieldError("modelFamily") ? (
            <p className="text-xs text-red-600 dark:text-red-400">
              {fieldError("modelFamily")}
            </p>
          ) : null}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="intakeDate">Intake date</Label>
        <Input
          id="intakeDate"
          type="date"
          aria-invalid={Boolean(fieldError("intakeDate")) || undefined}
          {...register("intakeDate")}
        />
        {fieldError("intakeDate") ? (
          <p className="text-xs text-red-600 dark:text-red-400">
            {fieldError("intakeDate")}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
        <Link
          href="/agents"
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          Cancel
        </Link>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}
