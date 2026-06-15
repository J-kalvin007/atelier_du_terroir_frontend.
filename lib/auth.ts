"use client";

export type UserRole = "admin" | "client";

export type AuthUser = {
  id?: number | string;
  username?: string;
  email?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  profileImage?: string;
  isActive?: boolean;
  isVerified?: boolean;
  isStaff?: boolean;
  adminRole?: boolean;
  raw: Record<string, unknown>;
};

export type AuthSession = {
  token: string;
  role: UserRole;
  user: AuthUser;
};

type TokenResponse = {
  token?: string;
  key?: string;
  user?: Record<string, unknown>;
  [key: string]: unknown;
};

const STORAGE_KEY = "atelier-du-terroir-auth-v2";
const SESSION_EVENT = "atelier-du-terroir-auth-change";
const API_BASE_URL = readEnv("NEXT_PUBLIC_API_BASE_URL", "NEXT_PUBLIC_API_URL");
const TOKEN_ENDPOINT = readEnv("NEXT_PUBLIC_AUTH_TOKEN_ENDPOINT") ?? "/api/connexion/";
const PROFILE_ENDPOINT = readEnv("NEXT_PUBLIC_AUTH_ME_ENDPOINT") ?? "/api/users/me/";
const LOGOUT_ENDPOINT = readEnv("NEXT_PUBLIC_AUTH_LOGOUT_ENDPOINT") ?? "/api/auth/logout/";
const REGISTER_ENDPOINT = readEnv("NEXT_PUBLIC_AUTH_REGISTER_ENDPOINT") ?? "/api/auth/registration/";
const PROXY_TOKEN_ENDPOINT = "/api/frontend-auth/login";
const PROXY_PROFILE_ENDPOINT = "/api/frontend-auth/profile";
const PROXY_REGISTER_ENDPOINT = "/api/frontend-auth/register";

type RegisterPayload = {
  name: string;
  email: string;
  password1: string;
  password2: string;
};

type LoginPayload = {
  password: string;
  name?: string;
  username?: string;
  email?: string;
};

let sessionCache: AuthSession | null | undefined;

function readEnv(...keys: string[]) {
  for (const key of keys) {
    const value = process.env[key];

    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }

  return undefined;
}

function buildApiUrl(path: string) {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  if (!API_BASE_URL) {
    return normalizedPath;
  }

  return `${API_BASE_URL.replace(/\/$/, "")}${normalizedPath}`;
}

function buildProxyUrl(path: string) {
  return path.startsWith("/") ? path : `/${path}`;
}

function getAuthHeaders(token: string, scheme: "Token" | "Bearer") {
  return {
    Authorization: `${scheme} ${token}`,
  };
}

function readString(value: unknown) {
  return typeof value === "string" ? value : undefined;
}

function readBoolean(value: unknown) {
  return typeof value === "boolean" ? value : undefined;
}

function readErrorMessage(payload: unknown) {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const record = payload as Record<string, unknown>;
  const detail = readString(record.detail) ?? readString(record.message) ?? readString(record.error);

  if (detail) {
    return detail;
  }

  const fieldErrors: string[] = [];

  for (const [key, value] of Object.entries(record)) {
    if (typeof value === "string" && value.trim().length > 0) {
      fieldErrors.push(`${key}: ${value}`);
      continue;
    }

    if (Array.isArray(value) && value.length > 0) {
      const messages = value.filter((item): item is string => typeof item === "string");

      if (messages.length > 0) {
        fieldErrors.push(`${key}: ${messages.join(" ")}`);
      }
    }
  }

  if (fieldErrors.length > 0) {
    return fieldErrors.join(" ");
  }

  return null;
}

async function parseErrorResponse(response: Response, fallbackMessage: string) {
  const contentType = response.headers.get("content-type") ?? "";

  try {
    if (contentType.includes("application/json")) {
      const payload = (await response.json()) as unknown;
      return readErrorMessage(payload) ?? fallbackMessage;
    }

    const text = (await response.text()).trim();
    return text || fallbackMessage;
  } catch {
    return fallbackMessage;
  }
}

async function parseJsonSafely(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return (await response.json()) as Record<string, unknown>;
  }

  const text = await response.text();
  return text ? ({ detail: text } as Record<string, unknown>) : {};
}

function shouldRetryDirectly(payload: Record<string, unknown> | null, responseStatus?: number) {
  if (!payload) {
    return responseStatus === 500;
  }

  const detail = readString(payload.detail)?.toLowerCase() ?? "";
  return responseStatus === 500 && (detail.includes("fetch failed") || detail.includes("failed to fetch"));
}

async function fetchThroughProxyThenDirect(
  proxyPath: string,
  backendPath: string,
  init: RequestInit
) {
  const baseHeaders = new Headers(init.headers);

  const proxyResponse = await fetch(buildProxyUrl(proxyPath), {
    ...init,
    headers: baseHeaders,
  });

  const proxyPayload = proxyResponse.ok ? null : await parseJsonSafely(proxyResponse);

  if (proxyResponse.ok || !shouldRetryDirectly(proxyPayload, proxyResponse.status)) {
    return {
      response: proxyResponse,
      payload: proxyPayload,
    };
  }

  const directHeaders = new Headers(init.headers);
  directHeaders.set("ngrok-skip-browser-warning", "true");
  directHeaders.set("Accept", directHeaders.get("Accept") ?? "application/json");

  const directResponse = await fetch(buildApiUrl(backendPath), {
    ...init,
    headers: directHeaders,
  });

  const directPayload = directResponse.ok ? null : await parseJsonSafely(directResponse);

  return {
    response: directResponse,
    payload: directPayload,
  };
}

function inferRole(data: Record<string, unknown>): UserRole | null {
  const adminRoleValue = readString(data.admin_role);
  const hasAdminPrivilege =
    readBoolean(data.is_admin) === true ||
    readBoolean(data.is_staff) === true ||
    readBoolean(data.is_superuser) === true ||
    readBoolean(data.admin_role) === true ||
    ["super_admin", "platform_admin", "admin", "manager"].includes(
      (adminRoleValue ?? "").toLowerCase()
    );

  if (hasAdminPrivilege) {
    return "admin";
  }

  const directRole =
    readString(data.role) ??
    readString(data.user_role) ??
    readString(data.userType) ??
    readString(data.user_type) ??
    readString(data.account_type) ??
    readString(data.type);

  if (directRole) {
    const normalizedRole = directRole.toLowerCase();

    if (
      ["admin", "administrator", "staff", "superuser", "super_admin", "manager"].includes(
        normalizedRole
      )
    ) {
      return "admin";
    }

    if (["platform_admin"].includes(normalizedRole)) {
      return "admin";
    }

    if (["client", "customer", "user", "buyer"].includes(normalizedRole)) {
      return "client";
    }
  }

  if (readBoolean(data.is_client) === true || readBoolean(data.customer) === true) {
    return "client";
  }

  const nestedUser =
    data.user && typeof data.user === "object" ? (data.user as Record<string, unknown>) : null;
  const nestedData =
    data.data && typeof data.data === "object" ? (data.data as Record<string, unknown>) : null;

  if (nestedUser) {
    const nestedUserRole = inferRoleShallow(nestedUser);
    if (nestedUserRole) {
      return nestedUserRole;
    }
  }

  if (nestedData) {
    const nestedDataRole = inferRoleShallow(nestedData);
    if (nestedDataRole) {
      return nestedDataRole;
    }
  }

  return null;
}

function inferRoleShallow(data: Record<string, unknown>): UserRole | null {
  const directRole =
    readString(data.role) ??
    readString(data.user_role) ??
    readString(data.userType) ??
    readString(data.user_type) ??
    readString(data.account_type) ??
    readString(data.type);

  if (!directRole) {
    if (
      readBoolean(data.is_admin) === true ||
      readBoolean(data.is_staff) === true ||
      readBoolean(data.is_superuser) === true ||
      readBoolean(data.admin_role) === true
    ) {
      return "admin";
    }

    if (readBoolean(data.is_client) === true || readBoolean(data.customer) === true) {
      return "client";
    }

    return null;
  }

  const normalizedRole = directRole.toLowerCase();

  if (
    [
      "admin",
      "administrator",
      "staff",
      "superuser",
      "super_admin",
      "platform_admin",
      "manager",
    ].includes(normalizedRole)
  ) {
    return "admin";
  }

  if (["client", "customer", "user", "buyer"].includes(normalizedRole)) {
    return "client";
  }

  return null;
}

function normalizeUser(data: Record<string, unknown>): AuthUser {
  return {
    id: typeof data.id === "number" || typeof data.id === "string" ? data.id : undefined,
    username: readString(data.username),
    email: readString(data.email),
    name: readString(data.name),
    firstName: readString(data.first_name) ?? readString(data.firstName),
    lastName: readString(data.last_name) ?? readString(data.lastName),
    phoneNumber: readString(data.phone_number),
    profileImage: readString(data.profile_image),
    isActive: readBoolean(data.is_active),
    isVerified: readBoolean(data.is_verified),
    isStaff: readBoolean(data.is_staff),
    adminRole: readBoolean(data.admin_role),
    raw: data,
  };
}

async function requestProfile(token: string) {
  for (const scheme of ["Token", "Bearer"] as const) {
    const { response } = await fetchThroughProxyThenDirect(PROXY_PROFILE_ENDPOINT, PROFILE_ENDPOINT, {
      method: "GET",
      headers: getAuthHeaders(token, scheme),
    });

    if (response.ok) {
      return (await response.json()) as Record<string, unknown>;
    }

    if (response.status !== 401) {
      throw new Error("Impossible de recuperer le profil utilisateur.");
    }
  }

  throw new Error("Le token est invalide ou l'API profil n'accepte pas ce format d'authentification.");
}

function buildLoginPayload(identifier: string, password: string): LoginPayload {
  const normalizedIdentifier = identifier.trim();

  if (normalizedIdentifier.includes("@")) {
    return {
      name: normalizedIdentifier,
      username: normalizedIdentifier,
      email: normalizedIdentifier,
      password,
    };
  }

  return {
    name: normalizedIdentifier,
    username: normalizedIdentifier,
    password,
  };
}

export async function login(identifier: string, password: string) {
  const { response, payload } = await fetchThroughProxyThenDirect(
    PROXY_TOKEN_ENDPOINT,
    TOKEN_ENDPOINT,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(buildLoginPayload(identifier, password)),
    }
  );

  if (!response.ok) {
    throw new Error(
      (payload ? readErrorMessage(payload) : null) ??
        (await parseErrorResponse(
          response,
          "Identifiants invalides. Verifie le nom d'utilisateur et le mot de passe."
        ))
    );
  }

  const tokenPayload = (await response.json()) as TokenResponse;
  const token = readString(tokenPayload.token) ?? readString(tokenPayload.key);

  if (!token) {
    throw new Error("L'API de connexion n'a pas renvoye de token exploitable.");
  }

  const loginUser = tokenPayload.user;
  const loginRole =
    inferRole(tokenPayload as Record<string, unknown>) ?? (loginUser ? inferRole(loginUser) : null);

  let profilePayload: Record<string, unknown> | null = null;

  try {
    profilePayload = await requestProfile(token);
  } catch {
    profilePayload = loginUser ?? null;
  }

  const role = loginRole ?? (profilePayload ? inferRole(profilePayload) : null);

  if (!role) {
    throw new Error(
      "Impossible de determiner si l'utilisateur est admin ou client a partir des attributs API."
    );
  }

  const session: AuthSession = {
    token,
    role,
    user: normalizeUser(profilePayload ?? loginUser ?? {}),
  };

  persistSession(session);
  return session;
}

export async function logout(session: AuthSession | null) {
  if (session) {
    for (const scheme of ["Token", "Bearer"] as const) {
      const { response } = await fetchThroughProxyThenDirect(LOGOUT_ENDPOINT, LOGOUT_ENDPOINT, {
        method: "POST",
        headers: getAuthHeaders(session.token, scheme),
      });

      if (response.ok || response.status === 401 || response.status === 405) {
        break;
      }
    }
  }

  clearSession();
}

export async function refreshSessionFromProfile(session: AuthSession) {
  const profilePayload = await requestProfile(session.token);
  const role = inferRole(profilePayload);

  if (!role) {
    throw new Error(
      "Impossible de determiner si l'utilisateur est admin ou client a partir du profil API."
    );
  }

  const refreshedSession: AuthSession = {
    token: session.token,
    role,
    user: normalizeUser(profilePayload),
  };

  persistSession(refreshedSession);
  return refreshedSession;
}

export async function register(payload: RegisterPayload) {
  const { response, payload: errorPayload } = await fetchThroughProxyThenDirect(
    PROXY_REGISTER_ENDPOINT,
    REGISTER_ENDPOINT,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: payload.name,
        email: payload.email,
        password1: payload.password1,
        password2: payload.password2,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(
      (errorPayload ? readErrorMessage(errorPayload) : null) ??
        (await parseErrorResponse(
          response,
          "Inscription impossible. Verifie les champs ou adapte l'endpoint d'inscription."
        ))
    );
  }

  return (await response.json()) as Record<string, unknown>;
}

export function persistSession(session: AuthSession) {
  const normalizedSession = normalizeStoredSession(session);
  sessionCache = normalizedSession;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizedSession));
  window.dispatchEvent(new Event(SESSION_EVENT));
}

export function readSession() {
  if (typeof window === "undefined") {
    return null;
  }

  if (sessionCache !== undefined) {
    return sessionCache;
  }

  const storedSession = window.localStorage.getItem(STORAGE_KEY);

  if (!storedSession) {
    sessionCache = null;
    return null;
  }

  try {
    const parsedSession = JSON.parse(storedSession) as AuthSession;
    sessionCache = normalizeStoredSession(parsedSession);

    if (JSON.stringify(parsedSession) !== JSON.stringify(sessionCache)) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionCache));
    }

    return sessionCache;
  } catch {
    clearSession();
    return null;
  }
}

export function clearSession() {
  if (typeof window !== "undefined") {
    sessionCache = null;
    window.localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event(SESSION_EVENT));
  }
}

export function subscribeToSession(callback: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key && event.key !== STORAGE_KEY) {
      return;
    }

    sessionCache = undefined;
    callback();
  };

  const handleSessionChange = () => {
    sessionCache = undefined;
    callback();
  };

  window.addEventListener("storage", handleStorage);
  window.addEventListener(SESSION_EVENT, handleSessionChange);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(SESSION_EVENT, handleSessionChange);
  };
}

export function getDashboardPath(role: UserRole) {
  return role === "admin" ? "/admin" : "/";
}

function normalizeStoredSession(session: AuthSession) {
  const rawUser =
    session.user?.raw && typeof session.user.raw === "object"
      ? (session.user.raw as Record<string, unknown>)
      : {};

  const inferredRole =
    inferRole(rawUser) ??
    inferRole({
      role: rawUser.role,
      is_staff: session.user?.isStaff,
      admin_role: session.user?.adminRole,
    }) ??
    session.role;

  return {
    ...session,
    role: inferredRole,
  } satisfies AuthSession;
}
