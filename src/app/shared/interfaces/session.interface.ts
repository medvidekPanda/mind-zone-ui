export enum SessionFormat {
  ONLINE = "ONLINE",
  IN_PERSON = "IN_PERSON",
}

export enum SessionType {
  INDIVIDUAL = "INDIVIDUAL",
  COUPLE = "COUPLE",
  GROUP = "GROUP",
}

export interface Session {
  id: string;
  date: string;
  time: string;
  format: SessionFormat;
  type: SessionType;
  duration: number;
  notes: string;
  nextPlan: string;
  tags: string[];
  price: number;
  paid: boolean;
  clientId: string;
  therapistId: string;
  createdAt: string;
  updatedAt: string;
}

export type SessionPayload = Omit<Session, "id" | "createdAt" | "updatedAt">;
