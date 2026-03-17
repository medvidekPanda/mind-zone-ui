import { ClientGender, ClientStatus } from "../interfaces/client.interface";

export const CLIENT_STATUS_OPTIONS = [
  { label: "Aktivní", value: ClientStatus.ACTIVE },
  { label: "Pozastaveno", value: ClientStatus.STOPPED },
  { label: "Čekající", value: ClientStatus.PENDING },
];

export const CLIENT_GENDER_OPTIONS = [
  { label: "Muž", value: ClientGender.MALE },
  { label: "Žena", value: ClientGender.FEMALE },
  { label: "Jiné", value: ClientGender.OTHER },
];
