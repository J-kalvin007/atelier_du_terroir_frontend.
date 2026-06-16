export function mergeAuthProfileRecords(
  me: Record<string, unknown> | null,
  userDetails: Record<string, unknown> | null
) {
  if (!me && !userDetails) {
    return {};
  }

  const merged: Record<string, unknown> = {
    ...(userDetails ?? {}),
    ...(me ?? {}),
  };

  const pk = merged.pk ?? merged.id;
  if (pk !== undefined && pk !== null) {
    merged.id = pk;
  }

  if (me?.role !== undefined) {
    merged.role = me.role;
  }

  if (me?.is_staff !== undefined) {
    merged.is_staff = me.is_staff;
  }

  if (me?.is_admin !== undefined) {
    merged.is_admin = me.is_admin;
  }

  if (me?.admin_role !== undefined) {
    merged.admin_role = me.admin_role;
  }

  if (me?.phone_number !== undefined) {
    merged.phone_number = me.phone_number;
  }

  if (me?.profile_image !== undefined) {
    merged.profile_image = me.profile_image;
  }

  if (me?.is_active !== undefined) {
    merged.is_active = me.is_active;
  }

  if (me?.is_verified !== undefined) {
    merged.is_verified = me.is_verified;
  }

  if (typeof me?.name === "string" && me.name.trim()) {
    merged.name = me.name;
  }

  const firstName = typeof merged.first_name === "string" ? merged.first_name.trim() : "";
  const lastName = typeof merged.last_name === "string" ? merged.last_name.trim() : "";
  const profileName =
    (typeof merged.name === "string" ? merged.name.trim() : "") ||
    (typeof merged.username === "string" ? merged.username.trim() : "");
  const email = typeof merged.email === "string" ? merged.email.trim() : "";
  const currentName = typeof merged.name === "string" ? merged.name.trim() : "";

  if (!currentName) {
    merged.name =
      [firstName, lastName].filter(Boolean).join(" ").trim() ||
      profileName ||
      email.split("@")[0] ||
      "Utilisateur";
  }

  return merged;
}
