export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: "OWNER_ADMIN" | "MANAGER" | "ORDER_STAFF" | "INVENTORY_STAFF";
  enabled: boolean;
};

export type LoginCredentials = { email: string; password: string };
export type SessionResponse = { user: AuthUser | null; expired?: boolean };

export class AuthError extends Error {
  constructor(
    message: string,
    public readonly fieldErrors: Partial<Record<keyof LoginCredentials, string>> = {},
  ) {
    super(message);
    this.name = "AuthError";
  }
}
