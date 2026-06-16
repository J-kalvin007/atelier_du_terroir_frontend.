import Link from "next/link";
import { UserProfileForm } from "@/components/auth/UserProfileForm";

export default function AccountPage() {
  return (
    <main className="min-h-screen bg-[#f7f3eb] px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <Link href="/" className="text-sm font-semibold text-[#8b5e34] hover:underline">
            ← Retour boutique
          </Link>
          <h1 className="mt-4 text-3xl font-bold text-slate-900">Mon compte</h1>
          <p className="mt-2 text-sm text-slate-600">
            Espace client : consulte et modifie ton profil via l&apos;API utilisateur.
          </p>
        </div>

        <UserProfileForm />
      </div>
    </main>
  );
}
