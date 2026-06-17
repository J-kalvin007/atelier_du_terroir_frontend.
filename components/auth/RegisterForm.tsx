"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Leaf, Lock, Mail, UserRound } from "lucide-react";
import { logoImage } from "@/assets/images";
import { register } from "@/lib/auth";

export function RegisterForm({
  redirectPath,
  onSwitchToLogin,
  loginHref = "/login",
}: {
  redirectPath?: string;
  onSwitchToLogin?: () => void;
  loginHref?: string;
} = {}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password1, setPassword1] = useState("");
  const [password2, setPassword2] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function validatePassword(password: string) {
    if (password.length < 8) {
      return "Le mot de passe doit contenir au moins 8 caracteres.";
    }

    if (/^\d+$/.test(password)) {
      return "Le mot de passe ne peut pas contenir uniquement des chiffres.";
    }

    const commonPasswords = ["password", "12345678", "123456789", "max12345", "password1"];
    if (commonPasswords.includes(password.trim().toLowerCase())) {
      return "Ce mot de passe est trop courant. Ajoutez un symbole ou des mots uniques (ex. Max@Terroir2026!).";
    }

    return null;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (password1 !== password2) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    const passwordError = validatePassword(password1);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    startTransition(async () => {
      try {
        await register({
          name,
          email,
          password1,
          password2,
        });

        const params = new URLSearchParams({ registered: "1" });
        if (redirectPath) {
          params.set("redirect", redirectPath);
        }
        router.push(`${loginHref}?${params.toString()}`);
      } catch (submissionError) {
        setError(
          submissionError instanceof Error
            ? submissionError.message
            : "Une erreur est survenue pendant l'inscription."
        );
      }
    });
  }

  return (
    <div className="relative w-full max-w-md">
      <Leaf className="pointer-events-none absolute -left-5 top-10 h-9 w-9 rotate-[-18deg] text-[#8b5e34]/25" />
      <Leaf className="pointer-events-none absolute -right-6 bottom-20 h-11 w-11 rotate-[22deg] text-[#1f4d3f]/20" />

      <div className="overflow-hidden rounded-[2rem] border border-[#d6dfd2] bg-white/95 shadow-[0_28px_80px_rgba(24,37,24,0.14)] backdrop-blur-sm">
        <div className="relative bg-gradient-to-r from-[#1f4d3f] to-[#8b5e34] px-8 py-8 text-center text-white">
          <div className="pointer-events-none absolute -left-8 -top-8 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
          <div className="relative mx-auto mb-3 flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border border-white/25 bg-white/15 backdrop-blur-sm">
            <Image src={logoImage} alt="Atelier du Terroir" fill className="object-contain p-2" sizes="64px" />
          </div>
          <h1 className="text-2xl font-bold">Creer un compte</h1>
          <p className="mt-1 text-sm text-white/82">
            Rejoignez la communaute Atelier du Terroir
          </p>
        </div>

        <form className="space-y-4 p-8" onSubmit={handleSubmit}>
          {error ? (
            <div className="rounded-xl border border-[#f0b7b7] bg-[#fff4f4] px-4 py-3 text-sm text-[#9a2f2f]">
              {error}
            </div>
          ) : null}

          <label className="block space-y-2">
            <span className="text-sm font-medium text-[#2a3528]">Nom</span>
            <div className="relative">
              <UserRound className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7c8978]" />
              <input
                className="w-full rounded-xl border border-[#d7ddcf] bg-[#fbfcf7] py-3 pl-11 pr-4 text-sm text-[#1c241b] outline-none transition focus:border-[#1f4d3f] focus:ring-2 focus:ring-[#dce8d8]"
                value={name}
                onChange={(event) => setName(event.target.value)}
                autoComplete="name"
                placeholder="Votre nom"
                required
              />
            </div>
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-[#2a3528]">Adresse email</span>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7c8978]" />
              <input
                className="w-full rounded-xl border border-[#d7ddcf] bg-[#fbfcf7] py-3 pl-11 pr-4 text-sm text-[#1c241b] outline-none transition focus:border-[#1f4d3f] focus:ring-2 focus:ring-[#dce8d8]"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                placeholder="nom@email.com"
                required
              />
            </div>
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-[#2a3528]">Mot de passe</span>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7c8978]" />
              <input
                className="w-full rounded-xl border border-[#d7ddcf] bg-[#fbfcf7] py-3 pl-11 pr-12 text-sm text-[#1c241b] outline-none transition focus:border-[#1f4d3f] focus:ring-2 focus:ring-[#dce8d8]"
                type={showPassword ? "text" : "password"}
                value={password1}
                onChange={(event) => setPassword1(event.target.value)}
                autoComplete="new-password"
                placeholder="Votre mot de passe"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[#7c8978] hover:text-[#1f4d3f]"
              >
                {showPassword ? "Masquer" : "Voir"}
              </button>
            </div>
            <p className="text-xs leading-5 text-[#667260]">
              Minimum 8 caracteres. Evitez les mots courants comme Max12345. Preferez lettres +
              chiffres + symbole, ex. <strong>Max@Terroir2026!</strong>
            </p>
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-[#2a3528]">Confirmer le mot de passe</span>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7c8978]" />
              <input
                className="w-full rounded-xl border border-[#d7ddcf] bg-[#fbfcf7] py-3 pl-11 pr-12 text-sm text-[#1c241b] outline-none transition focus:border-[#1f4d3f] focus:ring-2 focus:ring-[#dce8d8]"
                type={showPassword ? "text" : "password"}
                value={password2}
                onChange={(event) => setPassword2(event.target.value)}
                autoComplete="new-password"
                placeholder="Retapez votre mot de passe"
                required
              />
            </div>
          </label>

          <button
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#1f4d3f] to-[#17392f] px-4 py-3.5 text-sm font-semibold text-white shadow-[0_16px_34px_rgba(31,77,63,0.24)] transition hover:shadow-[0_20px_40px_rgba(31,77,63,0.3)] disabled:cursor-not-allowed disabled:opacity-70"
            type="submit"
            disabled={isPending}
          >
            {isPending ? "Inscription en cours..." : "Creer mon compte"}
            {isPending ? null : <span aria-hidden="true">→</span>}
          </button>

          {onSwitchToLogin ? (
            <p className="text-center text-sm text-[#667260]">
              Deja un compte ?{" "}
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="font-semibold text-[#1f4d3f] hover:underline"
              >
                Se connecter
              </button>
            </p>
          ) : (
            <p className="text-center text-sm text-[#667260]">
              Deja un compte ?{" "}
              <Link className="font-semibold text-[#1f4d3f] hover:underline" href={loginHref}>
                Se connecter
              </Link>
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
