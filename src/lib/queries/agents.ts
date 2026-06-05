import { db } from "@/lib/db";

export async function listAgents({ archived }: { archived: boolean }) {
  return db.agent.findMany({
    where: archived ? { NOT: { archivedAt: null } } : { archivedAt: null },
    orderBy: { intakeDate: "desc" },
  });
}

export async function getAgent(id: string) {
  return db.agent.findUnique({ where: { id } });
}

export type AgentRow = Awaited<ReturnType<typeof listAgents>>[number];
