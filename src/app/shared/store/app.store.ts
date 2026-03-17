import { signalStore, withMethods, withState } from "@ngrx/signals";

import { CLIENT_GENDER_OPTIONS, CLIENT_STATUS_OPTIONS } from "../constants/client.constants";
import { SESSION_FORM_OPTIONS, SESSION_STATUS_OPTIONS, SESSION_TYPE_OPTIONS } from "../constants/session.constants";
import { ClientGender, ClientStatus } from "../interfaces/client.interface";
import { SessionForm, SessionStatus, SessionType } from "../interfaces/session.interface";

/**
 * AppStore manages global application metadata (enums, labels, options).
 */
export const AppStore = signalStore(
  { providedIn: "root" },
  withState({
    clientStatusOptions: CLIENT_STATUS_OPTIONS,
    clientGenderOptions: CLIENT_GENDER_OPTIONS,
    sessionFormOptions: SESSION_FORM_OPTIONS,
    sessionTypeOptions: SESSION_TYPE_OPTIONS,
    sessionStatusOptions: SESSION_STATUS_OPTIONS,
  }),
  withMethods(() => ({
    getClientStatusLabel: (status: ClientStatus) =>
      CLIENT_STATUS_OPTIONS.find((opt) => opt.value === status)?.label ?? status,
    getClientGenderLabel: (gender: ClientGender) =>
      CLIENT_GENDER_OPTIONS.find((opt) => opt.value === gender)?.label ?? gender,
    getSessionFormLabel: (form: SessionForm) => SESSION_FORM_OPTIONS.find((opt) => opt.value === form)?.label ?? form,
    getSessionTypeLabel: (type: SessionType) => SESSION_TYPE_OPTIONS.find((opt) => opt.value === type)?.label ?? type,
    getSessionStatusLabel: (status: SessionStatus) =>
      SESSION_STATUS_OPTIONS.find((opt) => opt.value === status)?.label ?? status,
  })),
);
