"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { bookAppointmentSchema } from "@/lib/validation/appointment";

export async function bookAppointment(formData: FormData): Promise<void> {
  const parsed = bookAppointmentSchema.safeParse({
    agentId: String(formData.get("agentId") ?? ""),
    therapyId: String(formData.get("therapyId") ?? ""),
    slotId: String(formData.get("slotId") ?? ""),
  });
  if (!parsed.success) {
    throw new Error("Invalid booking request");
  }
  const { agentId, therapyId, slotId } = parsed.data;

  const appointment = await db.$transaction(async (tx) => {
    const taken = await tx.appointment.findFirst({
      where: { slotId, status: "booked" },
      select: { id: true },
    });
    if (taken) return null;
    return tx.appointment.create({
      data: { agentId, therapyId, slotId, status: "booked" },
      select: { id: true },
    });
  });

  if (!appointment) {
    redirect(`/book/${agentId}/${therapyId}`);
  }

  revalidatePath("/dashboard");
  redirect(`/book/confirmed/${appointment.id}`);
}
