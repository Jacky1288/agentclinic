import { z } from "zod";

export const createAgentSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(80),
  modelFamily: z
    .string()
    .trim()
    .min(1, "Model family is required")
    .max(40),
  intakeDate: z
    .string()
    .trim()
    .min(1, "Intake date is required")
    .refine(
      (s) => !Number.isNaN(Date.parse(s)),
      "Intake date must be a valid date",
    ),
});

export const updateAgentSchema = createAgentSchema.extend({
  id: z.string().min(1),
});

export const archiveAgentSchema = z.object({
  id: z.string().min(1),
  archive: z.boolean(),
});

export type CreateAgentInput = z.infer<typeof createAgentSchema>;
export type UpdateAgentInput = z.infer<typeof updateAgentSchema>;
export type ArchiveAgentInput = z.infer<typeof archiveAgentSchema>;
