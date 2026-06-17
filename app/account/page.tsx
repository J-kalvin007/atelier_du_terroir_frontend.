import { UserProfileForm } from "@/components/auth/UserProfileForm";
import { StorefrontPage } from "@/components/layout/StorefrontPage";

export default function AccountPage() {
  return (
    <StorefrontPage>
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <h1 className="text-3xl font-bold text-[#1f241c]">Mon compte</h1>
        <p className="mt-2 text-sm text-[#5c6a59]">
          Espace client : consulte et modifie ton profil via l&apos;API utilisateur.
        </p>
        <div className="mt-8">
          <UserProfileForm />
        </div>
      </div>
    </StorefrontPage>
  );
}
