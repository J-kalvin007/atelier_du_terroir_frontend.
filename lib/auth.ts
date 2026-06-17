"use client";

import { mergeAuthProfileRecords } from "@/lib/auth-profile";

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

export type UserProfileUpdatePayload = {
  name?: string;
  first_name?: string;
  last_name?: string;
};

export class AuthRoleMismatchError extends Error {
  actualRole: UserRole;
  expectedRole: UserRole;

  constructor(actualRole: UserRole, expectedRole: UserRole) {
    super(buildRoleMismatchMessage(actualRole, expectedRole));
    this.name = "AuthRoleMismatchError";
    this.actualRole = actualRole;
    this.expectedRole = expectedRole;
  }
}

export type LoginOptions = {
  expectedRole?: UserRole;
};

function buildRoleMismatchMessage(actualRole: UserRole, expectedRole: UserRole) {
  if (expectedRole === "client" && actualRole === "admin") {
    return "Ce compte est administrateur. Accede a /admin pour te connecter, pas via la connexion client.";
  }

  if (expectedRole === "admin" && actualRole === "client") {
    return "Ce compte est client. Il ne peut pas acceder a l'espace administrateur.";
  }

  return `Ce compte est de type "${actualRole}" alors que la connexion "${expectedRole}" est requise.`;
}

type TokenResponse = {
  
  key?: string;
  user?: Record<string, unknown>;
 
};

const STORAGE_KEY = "atelier-du-terroir-auth-v3";
const SESSION_EVENT = "atelier-du-terroir-auth-change";
const API_BASE_URL =
  readEnv("NEXT_PUBLIC_API_BASE_URL", "NEXT_PUBLIC_API_URL") ?? "http://localhost:8000";
const TOKEN_ENDPOINT = readEnv("NEXT_PUBLIC_AUTH_TOKEN_ENDPOINT") ?? "/api/connexion/";
const PROFILE_ENDPOINT = readEnv("NEXT_PUBLIC_AUTH_ME_ENDPOINT") ?? "/api/users/me/";
const AUTH_USER_ENDPOINT = readEnv("NEXT_PUBLIC_AUTH_USER_ENDPOINT") ?? "/api/auth/user/";
const LOGOUT_ENDPOINT = readEnv("NEXT_PUBLIC_AUTH_LOGOUT_ENDPOINT") ?? "/api/auth/logout/";
const REGISTER_ENDPOINT = readEnv("NEXT_PUBLIC_AUTH_REGISTER_ENDPOINT") ?? "/api/auth/registration/";


type RegisterPayload = {
  name: string;
  email: string;
  password1: string;
  password2: string;
};

type LoginPayload = {
  password: string;
  username?: string;
  email?: string;
  name?: string;
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

const AUTH_FIELD_LABELS: Record<string, string> = {
  password1: "Mot de passe",
  password2: "Confirmation du mot de passe",
  email: "Email",
  name: "Nom",
  username: "Identifiant",
  non_field_errors: "Connexion",
};

function translateAuthValidationMessage(message: string) {
  const normalized = message.trim();

  if (/too common/i.test(normalized)) {
    return "Ce mot de passe est trop courant. Utilisez une combinaison plus unique, par exemple Max@Terroir2026! ou Atelier#Max847.";
  }

  if (/too short/i.test(normalized)) {
    return "Le mot de passe est trop court (8 caracteres minimum).";
  }

  if (/entirely numeric/i.test(normalized)) {
    return "Le mot de passe ne peut pas contenir uniquement des chiffres.";
  }

  if (/too similar/i.test(normalized)) {
    return "Le mot de passe ressemble trop a votre nom ou email.";
  }

  if (/didn't match|do not match/i.test(normalized)) {
    return "Les mots de passe ne correspondent pas.";
  }

  if (/valid email|adresse e-mail valide/i.test(normalized)) {
    return "Adresse email invalide. Utilise le format nom@domaine.com.";
  }

  if (/already exists|already registered|deja utilise|already taken/i.test(normalized)) {
    return "Cette adresse email est deja utilisee.";
  }

  if (/unable to log in with provided credentials/i.test(normalized)) {
    return "Email ou mot de passe incorrect. Verifie tes identifiants ou cree un compte.";
  }

  if (/must include "email" and "password"/i.test(normalized)) {
    return "Utilise ton adresse email (pas seulement un pseudo) pour te connecter.";
  }

  return normalized;
}

function formatAuthFieldError(field: string, message: string) {
  const label = AUTH_FIELD_LABELS[field] ?? field;
  return `${label} : ${translateAuthValidationMessage(message)}`;
}

function readErrorMessage(payload: unknown) {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const record = payload as Record<string, unknown>;
  const detail = readString(record.detail) ?? readString(record.message) ?? readString(record.error);

  if (detail) {
    return translateAuthValidationMessage(detail);
  }

  const fieldErrors: string[] = [];

  for (const [key, value] of Object.entries(record)) {
    if (typeof value === "string" && value.trim().length > 0) {
      fieldErrors.push(formatAuthFieldError(key, value));
      continue;
    }

    if (Array.isArray(value) && value.length > 0) {
      const messages = value.filter((item): item is string => typeof item === "string");

      if (messages.length > 0) {
        fieldErrors.push(formatAuthFieldError(key, messages.join(" ")));
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
  if (responseStatus === 404 || responseStatus === 502 || responseStatus === 503) {
    return true;
  }

  if (!payload) {
    return responseStatus === 500;
  }

  const detail = readString(payload.detail)?.toLowerCase() ?? "";
  return responseStatus === 500 && (detail.includes("fetch failed") || detail.includes("failed to fetch"));
}

async function fetchThroughProxyThenDirect(
  _proxyPath: string,
  backendPath: string,
  init: RequestInit
) {
  const headers = new Headers(init.headers);
  headers.set("ngrok-skip-browser-warning", "true");
  headers.set("Accept", headers.get("Accept") ?? "application/json");

  const response = await fetch(buildApiUrl(backendPath), {
    ...init,
    headers,
  });

  const payload = response.ok ? null : await parseJsonSafely(response);

  return { response, payload };
}

function readStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [] as string[];
  }

  return value.filter((item): item is string => typeof item === "string");
}

function normalizeRoleToken(role: string) {
  return role.trim().toLowerCase().replace(/[\s-]+/g, "_");
}

function isAdminBackendRole(role: string | null | undefined) {
  if (!role?.trim()) {
    return false;
  }

  const normalized = normalizeRoleToken(role);

  if (
    ["platform_admin", "super_admin", "admin", "manager", "staff", "superuser"].includes(
      normalized
    )
  ) {
    return true;
  }

  return normalized.endsWith("_admin") || normalized.startsWith("admin_");
}

function readPrimaryRole(data: Record<string, unknown>) {
  const directRole =
    readString(data.role) ??
    readString(data.user_role) ??
    readString(data.userType) ??
    readString(data.user_type) ??
    readString(data.account_type) ??
    readString(data.type);

  if (directRole) {
    return directRole;
  }

  const nestedRoles = readStringArray(data.roles);
  return nestedRoles.find((role) => isAdminBackendRole(role) || role.trim().length > 0) ?? null;
}

function buildAuthSessionFromLogin(
  token: string,
  tokenPayload: TokenResponse,
  profilePayload: Record<string, unknown> | null,
  loginUserRecord: Record<string, unknown> | null
): AuthSession {
  const profileRecord = profilePayload ?? {};
  const loginRole = loginUserRecord ? readPrimaryRole(loginUserRecord) : null;
  const profileRole = readPrimaryRole(profileRecord);
  const loginRoleInference = loginUserRecord ? inferRole(loginUserRecord) : null;
  const profileRoleInference = profilePayload ? inferRole(profileRecord) : null;

  const mergedRecord = mergeAuthProfileRecords(loginUserRecord, profilePayload ?? {});

  if (isAdminBackendRole(loginRole)) {
    mergedRecord.role = loginRole;
    mergedRecord.is_staff = true;
  } else if (loginRoleInference === "admin") {
    mergedRecord.is_staff = readBoolean(loginUserRecord?.is_staff) ?? true;
    if (loginRole) {
      mergedRecord.role = loginRole;
    }
  } else if (isAdminBackendRole(profileRole)) {
    mergedRecord.role = profileRole;
  }

  const user = normalizeUser(mergedRecord);

  if (loginRoleInference === "admin" || isAdminBackendRole(loginRole)) {
    user.isStaff = true;
    user.adminRole = true;
    if (loginRole) {
      user.raw = { ...user.raw, role: loginRole };
    }
  }

  const role: UserRole =
    loginRoleInference === "admin" ||
    profileRoleInference === "admin" ||
    user.isStaff ||
    user.adminRole ||
    isAdminBackendRole(readString(user.raw.role)) ||
    isAdminBackendRole(loginRole) ||
    isAdminBackendRole(profileRole)
      ? "admin"
      : profileRoleInference ?? loginRoleInference ?? inferRole(mergedRecord) ?? "client";

  return {
    token,
    role,
    user,
  };
}

function hasAdminGroup(data: Record<string, unknown>) {
  const groups = [
    ...readStringArray(data.groups),
    ...readStringArray(data.group_names),
    ...readStringArray(data.permissions),
  ];

  return groups.some((group) => {
    const normalized = group.toLowerCase();
    return (
      isAdminBackendRole(normalized) ||
      normalized.includes("admin") ||
      normalized.includes("staff") ||
      normalized.includes("manager")
    );
  });
}

function inferRole(data: Record<string, unknown>): UserRole | null {
  const adminRoleValue = readString(data.admin_role);
  const hasAdminPrivilege =
    readBoolean(data.is_admin) === true ||
    readBoolean(data.is_staff) === true ||
    readBoolean(data.is_superuser) === true ||
    readBoolean(data.admin_role) === true ||
    hasAdminGroup(data) ||
    isAdminBackendRole(adminRoleValue) ||
    ["super_admin", "platform_admin", "admin", "manager"].includes(
      normalizeRoleToken(adminRoleValue ?? "")
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
  const backendRole = readString(data.role);
  const hasAdminRole =
    isAdminBackendRole(backendRole) ||
    readBoolean(data.is_admin) === true ||
    readBoolean(data.is_staff) === true ||
    readBoolean(data.is_superuser) === true ||
    readBoolean(data.admin_role) === true ||
    hasAdminGroup(data);

  const idValue =
    typeof data.id === "number" || typeof data.id === "string"
      ? data.id
      : typeof data.pk === "number" || typeof data.pk === "string"
        ? data.pk
        : undefined;

  const firstName = readString(data.first_name) ?? readString(data.firstName);
  const lastName = readString(data.last_name) ?? readString(data.lastName);
  const profileName = readString(data.name) ?? readString(data.username);
  const email = readString(data.email);
  const displayName =
    profileName ||
    [firstName, lastName].filter(Boolean).join(" ").trim() ||
    email?.split("@")[0] ||
    "Utilisateur";

  return {
    id: idValue,
    username: profileName ?? email?.split("@")[0],
    email,
    name: displayName,
    firstName,
    lastName,
    phoneNumber: readString(data.phone_number),
    profileImage: readString(data.profile_image),
    isActive: readBoolean(data.is_active),
    isVerified: readBoolean(data.is_verified),
    isStaff: hasAdminRole || readBoolean(data.is_staff),
    adminRole: hasAdminRole ? true : readBoolean(data.admin_role),
    raw: data,
  };
}

async function requestProfile(token: string) {
  for (const scheme of ["Token", "Bearer"] as const) {
    const { response } = await fetchThroughProxyThenDirect(
      PROFILE_ENDPOINT,
      PROFILE_ENDPOINT,
      {
        method: "GET",
        headers: getAuthHeaders(token, scheme),
      }
    );

    if (response.ok) {
      const mergedPayload = (await response.json()) as Record<string, unknown>;
      return mergedPayload;
    }

    if (response.status !== 401) {
      break;
    }
  }

  const [mePayload, userDetailsPayload] = await Promise.all([
    fetchProfileSource(token, PROFILE_ENDPOINT),
    fetchProfileSource(token, AUTH_USER_ENDPOINT),
  ]);

  if (!mePayload && !userDetailsPayload) {
    throw new Error("Impossible de recuperer le profil utilisateur.");
  }

  return mergeAuthProfileRecords(mePayload, userDetailsPayload);
}

async function fetchProfileSource(token: string, backendPath: string) {
  for (const scheme of ["Token", "Bearer"] as const) {
    const { response } = await fetchThroughProxyThenDirect(backendPath, backendPath, {
      method: "GET",
      headers: getAuthHeaders(token, scheme),
    });

    if (response.ok) {
      return (await response.json()) as Record<string, unknown>;
    }

    if (response.status !== 401) {
      return null;
    }
  }

  return null;
}

function normalizeLoginIdentifier(identifier: string) {
  return identifier
    .trim()
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .toLowerCase();
}

function isValidLoginEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function buildLoginPayload(identifier: string, password: string): LoginPayload {
  const normalizedIdentifier = normalizeLoginIdentifier(identifier);

  if (!isValidLoginEmail(normalizedIdentifier)) {
    throw new Error(
      "Utilise ton adresse email complete (ex. yan@gmail.com) pour te connecter."
    );
  }

  return {
    email: normalizedIdentifier,
    password,
  };
}

export async function login(
  identifier: string,
  password: string,
  options?: LoginOptions
): Promise<AuthSession> {
  const { response, payload } = await fetchThroughProxyThenDirect(
    TOKEN_ENDPOINT,
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
        "Identifiants invalides. Verifie le nom d'utilisateur et le mot de passe."
    );
  }

  const tokenPayload = (await response.json()) as TokenResponse;
  const token = readString(tokenPayload.key);

  if (!token) {
    throw new Error("L'API de connexion n'a pas renvoye de token exploitable.");
  }

  const loginUser = tokenPayload.user;
  const loginUserRecord =
    loginUser && typeof loginUser === "object" ? (loginUser as Record<string, unknown>) : null;

  const session = buildAuthSessionFromLogin(
    token,
    tokenPayload,
    loginUserRecord,
    loginUserRecord
  );

  if (options?.expectedRole && session.role !== options.expectedRole) {
    throw new AuthRoleMismatchError(session.role, options.expectedRole);
  }

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
  const loginUserRecord = session.user.raw;
  const mergedPayload = mergeAuthProfileRecords(profilePayload, loginUserRecord);
  const user = normalizeUser(mergedPayload);
  const profileRole = readString(mergedPayload.role);
  const existingAdmin = hasAdminAccess(session);

  if (existingAdmin && !user.isStaff && !user.adminRole && !isAdminBackendRole(profileRole)) {
    user.isStaff = session.user.isStaff ?? true;
    user.adminRole = session.user.adminRole ?? true;
    user.raw = {
      ...user.raw,
      role: readString(session.user.raw.role) ?? profileRole ?? user.raw.role,
    };
  }

  const inferredRole = inferRole(mergedPayload) ?? inferRole(user.raw);
  const role: UserRole =
    user.isStaff ||
    user.adminRole ||
    isAdminBackendRole(profileRole) ||
    isAdminBackendRole(readString(user.raw.role)) ||
    existingAdmin
      ? "admin"
      : inferredRole ?? session.role;

  const refreshedSession: AuthSession = {
    token: session.token,
    role,
    user,
  };

  persistSession(refreshedSession);
  return refreshedSession;
}

export async function updateUserProfile(session: AuthSession, payload: UserProfileUpdatePayload) {
  const requestBody: Record<string, string> = {};

  if (payload.name?.trim()) {
    requestBody.name = payload.name.trim();
  }

  if (payload.first_name !== undefined) {
    requestBody.first_name = payload.first_name.trim();
  }

  if (payload.last_name !== undefined) {
    requestBody.last_name = payload.last_name.trim();
  }

  if (Object.keys(requestBody).length === 0) {
    throw new Error("Aucun champ modifiable n'a ete fourni.");
  }

  const { response, payload: errorPayload } = await fetchThroughProxyThenDirect(
    AUTH_USER_ENDPOINT,
    AUTH_USER_ENDPOINT,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(session.token, "Token"),
      },
      body: JSON.stringify(requestBody),
    }
  );

  if (!response.ok) {
    throw new Error(
      (errorPayload ? readErrorMessage(errorPayload) : null) ??
        "Impossible de mettre a jour le profil utilisateur."
    );
  }

  return refreshSessionFromProfile(session);
}

export async function register(payload: RegisterPayload) {
  const { response, payload: errorPayload } = await fetchThroughProxyThenDirect(
    REGISTER_ENDPOINT,
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

export function getSessionRoleLabel(session: AuthSession | null | undefined) {
  if (!session) {
    return "inconnu";
  }

  const rawRole = readString(session.user.raw.role);
  return rawRole ?? session.role;
}

export function hasAdminAccess(session: AuthSession | null | undefined) {
  if (!session) {
    return false;
  }

  return Boolean(
    session.role === "admin" ||
      session.user.isStaff ||
      session.user.adminRole ||
      isAdminBackendRole(readString(session.user.raw.role))
  );
}

export async function validateSessionToken(session: AuthSession): Promise<boolean> {
  try {
    const { response } = await fetchThroughProxyThenDirect(
      PROFILE_ENDPOINT,
      PROFILE_ENDPOINT,
      {
        method: "GET",
        headers: getAuthHeaders(session.token, "Token"),
      }
    );

    if (response.ok) {
      return true;
    }

    const text = await response.text();

    if (response.status === 401) {
      clearSession();
      return false;
    }

    if (
      response.status === 403 &&
      /invalid token|token non valide|authentication credentials/i.test(text)
    ) {
      clearSession();
      return false;
    }

    return true;
  } catch {
    return true;
  }
}

export function getDashboardPath(role: UserRole) {
  return role === "admin" ? "/admin" : "/";
}

export function buildAdminReturnPath(section?: string | null) {
  if (!section || section === "overview") {
    return "/admin";
  }

  return `/admin?section=${encodeURIComponent(section)}`;
}

export function buildAdminLoginPath(section?: string | null) {
  return buildAdminReturnPath(section);
}

export function resolveAuthRedirectPath(session: AuthSession, requestedRedirect: string | null) {
  const safeRedirect =
    requestedRedirect && requestedRedirect.startsWith("/") ? requestedRedirect : null;

  if (hasAdminAccess(session)) {
    if (safeRedirect?.startsWith("/admin")) {
      return safeRedirect;
    }

    return "/admin";
  }

  if (safeRedirect?.startsWith("/admin")) {
    return "/";
  }

  if (safeRedirect) {
    return safeRedirect;
  }

  return "/dashboard";
}

export function applyPostLoginRedirect(session: AuthSession, requestedRedirect?: string | null) {
  if (typeof window === "undefined") {
    return;
  }

  window.location.assign(resolveAuthRedirectPath(session, requestedRedirect ?? null));
}

export function isRoleAllowed(session: AuthSession | null | undefined, allowedRole: UserRole) {
  return Boolean(session && session.role === allowedRole);
}

export function getLoginPath(_role?: UserRole) {
  return "/login";
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

  const role: UserRole =
    session.user.isStaff ||
    session.user.adminRole ||
    isAdminBackendRole(readString(rawUser.role))
      ? "admin"
      : inferredRole;

  return {
    ...session,
    role,
  } satisfies AuthSession;
}
