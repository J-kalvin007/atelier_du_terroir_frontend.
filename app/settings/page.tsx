import { UserProfileForm } from "@/components/auth/UserProfileForm";
import { ClientAccountShell } from "@/components/dashboard/ClientAccountShell";

export default function SettingsPage() {
  return (
    <ClientAccountShell>
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <h1 className="text-3xl font-bold text-[#1f241c]">Parametres</h1>
        <p className="mt-2 text-sm text-[#5c6a59]">
          Modifiez votre profil et vos informations de compte.
        </p>
        <div className="mt-8">
          <UserProfileForm />
        </div>
      </div>
    </ClientAccountShell>
  );
}
