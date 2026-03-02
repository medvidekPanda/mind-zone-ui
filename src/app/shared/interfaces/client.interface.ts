export enum ClientStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export enum ClientGender {
  MALE = "MALE",
  FEMALE = "FEMALE",
  OTHER = "OTHER",
}

export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  gender: ClientGender;
  birthDate: string;
  status: ClientStatus;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClientPayload extends Omit<Client, "createdAt" | "id" | "updatedAt"> {
  userId: string;
}
