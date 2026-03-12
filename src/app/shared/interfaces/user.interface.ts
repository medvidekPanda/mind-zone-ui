export enum UserRole {
  ADMIN = "ADMIN",
  USER = "USER",
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  firebaseId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserPayload extends Omit<User, "createdAt" | "id" | "updatedAt" | "role"> {
  role?: UserRole;
}
