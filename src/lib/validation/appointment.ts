import { z } from "zod";

export const bookAppointmentSchema = z.object({
  agentId: z.string().min(1, "Agent is required"),
  therapyId: z.string().min(1, "Therapy is required"),
  slotId: z.string().min(1, "Slot is required"),
});

export const cancelAppointmentSchema = z.object({
  id: z.string().min(1, "Appointment id is required"),
});

export type BookAppointmentInput = z.infer<typeof bookAppointmentSchema>;
export type CancelAppointmentInput = z.infer<typeof cancelAppointmentSchema>;
