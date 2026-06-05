export type AgentFormState =
  | { status: "idle" }
  | { status: "error"; message: string; fieldErrors?: Record<string, string> };

export const initialAgentFormState: AgentFormState = { status: "idle" };
