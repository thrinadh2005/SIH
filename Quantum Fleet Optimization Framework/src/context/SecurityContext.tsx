import { createContext, useContext, useState, useEffect } from "react";

export type Role = "ADMIN" | "FLEET_OPS" | "CAPTAIN" | "ANALYST" | "AUDITOR";

interface SecurityUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar: string;
  mfaVerified: boolean;
  lastLogin: string;
  permissions: string[];
  sessionExpiry: number;
  jwtFragment: string;
}

interface SecurityState {
  user: SecurityUser;
  sessionHealthy: boolean;
  sessionAge: number;       // seconds
  threatLevel: "low" | "medium" | "high";
  failedAttempts: number;
  auditBuffer: string[];
  logAction: (action: string) => void;
  checkPermission: (perm: string) => boolean;
}

const ROLE_PERMISSIONS: Record<Role, string[]> = {
  ADMIN:      ["READ", "WRITE", "OPTIMIZE", "EXPORT", "AUDIT", "ADMIN", "CONFIGURE"],
  FLEET_OPS:  ["READ", "WRITE", "OPTIMIZE", "EXPORT"],
  CAPTAIN:    ["READ", "OPTIMIZE"],
  ANALYST:    ["READ", "EXPORT", "AUDIT"],
  AUDITOR:    ["READ", "AUDIT"],
};

const DEMO_USER: SecurityUser = {
  id: "USR-0001",
  name: "Admin — Egreen Quanta",
  email: "admin@egreen.io",
  role: "ADMIN",
  avatar: "AE",
  mfaVerified: true,
  lastLogin: new Date(Date.now() - 1000 * 60 * 14).toISOString(),
  permissions: ROLE_PERMISSIONS.ADMIN,
  sessionExpiry: Date.now() + 1000 * 60 * 60 * 8,
  jwtFragment: "eyJhbGciOiJSUzI1NiJ9…[RS256]",
};

const SecurityContext = createContext<SecurityState | null>(null);

export function SecurityProvider({ children }: { children: React.ReactNode }) {
  const [sessionAge, setSessionAge] = useState(0);
  const [auditBuffer, setAuditBuffer] = useState<string[]>([]);

  useEffect(() => {
    const t = setInterval(() => setSessionAge((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const logAction = (action: string) => {
    const entry = `[${new Date().toISOString()}] ${DEMO_USER.email} :: ${action}`;
    setAuditBuffer((prev) => [entry, ...prev].slice(0, 200));
  };

  const checkPermission = (perm: string) => DEMO_USER.permissions.includes(perm);

  const threatLevel: "low" | "medium" | "high" =
    sessionAge > 3600 ? "medium" : "low";

  return (
    <SecurityContext.Provider value={{
      user: DEMO_USER,
      sessionHealthy: sessionAge < DEMO_USER.sessionExpiry,
      sessionAge,
      threatLevel,
      failedAttempts: 0,
      auditBuffer,
      logAction,
      checkPermission,
    }}>
      {children}
    </SecurityContext.Provider>
  );
}

export function useSecurity() {
  const ctx = useContext(SecurityContext);
  if (!ctx) throw new Error("useSecurity must be used inside SecurityProvider");
  return ctx;
}
