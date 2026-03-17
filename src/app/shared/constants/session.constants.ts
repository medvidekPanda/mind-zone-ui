import { SessionForm, SessionStatus, SessionType } from "../interfaces/session.interface";

export const SESSION_FORM_OPTIONS = [
  { label: "Online", value: SessionForm.ONLINE },
  { label: "Osobně", value: SessionForm.IN_PERSON },
];

export const SESSION_TYPE_OPTIONS = [
  { label: "Individuální", value: SessionType.INDIVIDUAL },
  { label: "Párová", value: SessionType.COUPLE },
  { label: "Skupinová", value: SessionType.GROUP },
];

export const SESSION_STATUS_OPTIONS = [
  { label: "Naplánováno", value: SessionStatus.SCHEDULED },
  { label: "Dokončeno", value: SessionStatus.COMPLETED },
  { label: "Zrušeno", value: SessionStatus.CANCELLED },
  { label: "Nedostavil se", value: SessionStatus.NO_SHOW },
];
