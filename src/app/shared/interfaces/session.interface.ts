import { Tag } from "./tag.interface";

export enum SessionForm {
  ONLINE = "ONLINE",
  IN_PERSON = "IN_PERSON",
}

export enum SessionType {
  INDIVIDUAL = "INDIVIDUAL",
  COUPLE = "COUPLE",
  GROUP = "GROUP",
}

export enum SessionStatus {
  SCHEDULED = "SCHEDULED",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
  NO_SHOW = "NO_SHOW",
}

export type AttachmentProcessingStatus = "pending" | "queued" | "processing" | "completed" | "failed";

export interface SessionAttachment {
  id: string;
  name: string;
  url: string;
  mimeType: string;
  size: number;
  processingStatus?: AttachmentProcessingStatus;
  processingProgress?: number;
  processingError?: string | null;
  transcript?: string | null;
}

export interface TranscriptSegment {
  speaker: string;
  start: number;
  end: number;
  text: string;
}

export interface Transcript {
  segments: TranscriptSegment[];
  language: string;
  duration_seconds: number;
}

export interface Session {
  id: string;
  date: string;
  form: SessionForm;
  type: SessionType;
  status: SessionStatus;
  plannedDurationMinutes: number;
  duration: number | null;
  price: string | number;
  paid: boolean;
  notes: string;
  transcription: string | null;
  summary: string | null;
  consentToRecord: boolean;
  nextSessionId: string | null;
  userId: string;
  clientId: string;
  createdAt: string;
  updatedAt: string;
  client: {
    id: string;
    firstName: string;
    lastName: string;
  };
  user: {
    id: string;
    firstName: string;
    lastName: string;
  };
  tags: Tag[];
  attachments: SessionAttachment[];
  nextSession: Session | null;
  previousSessions: Session[];
}

export interface SessionPayload {
  date: string;
  form: SessionForm;
  type: SessionType;
  status: SessionStatus;
  plannedDurationMinutes: number;
  notes?: string;
  clientId: string;
  tagIds?: string[];
  price?: number;
  paid?: boolean;
  consentToRecord?: boolean;
  nextSessionId?: string | null;
}
