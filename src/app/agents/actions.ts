"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import {
  archiveAgentSchema,
  createAgentSchema,
  updateAgentSchema,
  type CreateAgentInput,
  type UpdateAgentInput,
} from "@/lib/validation/agent";
import type { AgentFormState } from "./form-state";

function flattenZod(error: import("zod").ZodError): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_form";
    if (!fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return fieldErrors;
}

export async function createAgent(
  _prev: AgentFormState,
  formData: FormData,
): Promise<AgentFormState> {
  const raw: CreateAgentInput = {
    name: String(formData.get("name") ?? ""),
    modelFamily: String(formData.get("modelFamily") ?? ""),
    intakeDate: String(formData.get("intakeDate") ?? ""),
  };
  const parsed = createAgentSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      status: "error",
      message: "Please correct the highlighted fields.",
      fieldErrors: flattenZod(parsed.error),
    };
  }
  await db.agent.create({
    data: {
      name: parsed.data.name,
      modelFamily: parsed.data.modelFamily,
      intakeDate: new Date(parsed.data.intakeDate),
    },
  });
  revalidatePath("/agents");
  redirect("/agents");
}

export async function updateAgent(
  _prev: AgentFormState,
  formData: FormData,
): Promise<AgentFormState> {
  const raw: UpdateAgentInput = {
    id: String(formData.get("id") ?? ""),
    name: String(formData.get("name") ?? ""),
    modelFamily: String(formData.get("modelFamily") ?? ""),
    intakeDate: String(formData.get("intakeDate") ?? ""),
  };
  const parsed = updateAgentSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      status: "error",
      message: "Please correct the highlighted fields.",
      fieldErrors: flattenZod(parsed.error),
    };
  }
  await db.agent.update({
    where: { id: parsed.data.id },
    data: {
      name: parsed.data.name,
      modelFamily: parsed.data.modelFamily,
      intakeDate: new Date(parsed.data.intakeDate),
    },
  });
  revalidatePath("/agents");
  redirect("/agents");
}

export async function setAgentArchived(formData: FormData): Promise<void> {
  const parsed = archiveAgentSchema.safeParse({
    id: String(formData.get("id") ?? ""),
    archive: String(formData.get("archive") ?? "") === "true",
  });
  if (!parsed.success) {
    throw new Error("Invalid archive request");
  }
  await db.agent.update({
    where: { id: parsed.data.id },
    data: { archivedAt: parsed.data.archive ? new Date() : null },
  });
  revalidatePath("/agents");
}

