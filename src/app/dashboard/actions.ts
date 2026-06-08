"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { cancelAppointmentSchema } from "@/lib/validation/appointment";

export async function cancelAppointment(formData: FormData): Promise<void> {
  const parsed = cancelAppointmentSchema.safeParse({
    id: String(formData.get("id") ?? ""),
  });
  if (!parsed.success) {
    throw new Error("Invalid cancel request");
  }
  await db.appointment.update({
    where: { id: parsed.data.id },
    data: { status: "cancelled" },
  });
  revalidatePath("/dashboard");
}
