import { createContext, useContext, type ReactNode } from "react";
import { authClient } from "./auth-client";
import type { BetterAuthClientOptions } from "@better-auth/core";
import type { InferClientAPI } from "better-auth/client";

type Session = Awaited<ReturnType<InferClientAPI<BetterAuthClientOptions>["getSession"]>>;

type AuthContextValue = {
  session: Session | null;
  isPending: boolean;
  userId: string | null;
};

const AuthContext = createContext<AuthContextValue>({
  session: null,
  isPending: true,
  userId: null,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, isPending } = authClient.useSession();
  const userId = session?.user?.id ?? null;

  return (
    <AuthContext.Provider value={{ session, isPending, userId }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
