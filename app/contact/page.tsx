"use client";

import { useState } from "react";
import { Mail, MapPin, Phone } from "lucide-react";
import { StorefrontPage } from "@/components/layout/StorefrontPage";

export default function ContactPage() {
  const [sent, setSent] = useState(false);

  return (
    <StorefrontPage hideFooter>
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#8b5e34]">Contact</p>
            <h1 className="mt-3 text-4xl font-extrabold text-[#1f241c]">Parlons de votre projet</h1>
            <p className="mt-4 text-sm leading-7 text-[#5c6a59]">
              Support client, partenariats agrobusiness et commandes professionnelles.
            </p>

            <div className="mt-8 space-y-4">
              <div className="flex items-start gap-3 rounded-2xl border border-[#eadcca] bg-white p-4">
                <Mail className="mt-0.5 h-5 w-5 text-[#ef8219]" />
                <div>
                  <p className="font-semibold text-[#1f241c]">Email</p>
                  <p className="text-sm text-[#5c6a59]">agrobusiness@dealandconsulting.com</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-2xl border border-[#eadcca] bg-white p-4">
                <Phone className="mt-0.5 h-5 w-5 text-[#ef8219]" />
                <div>
                  <p className="font-semibold text-[#1f241c]">Telephone</p>
                  <p className="text-sm text-[#5c6a59]">+228 72318393 · +228 92226399 · +228 97014471</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-2xl border border-[#eadcca] bg-white p-4">
                <MapPin className="mt-0.5 h-5 w-5 text-[#ef8219]" />
                <div>
                  <p className="font-semibold text-[#1f241c]">Adresse</p>
                  <p className="text-sm text-[#5c6a59]">Lome, Togo</p>
                </div>
              </div>
            </div>
          </div>

          <form
            className="rounded-[2rem] border border-[#eadcca] bg-white p-6 shadow-sm"
            onSubmit={(event) => {
              event.preventDefault();
              setSent(true);
            }}
          >
            <h2 className="text-xl font-bold text-[#1f241c]">Envoyer un message</h2>
            <div className="mt-6 space-y-4">
              <input required placeholder="Nom complet" className="h-11 w-full rounded-xl border border-[#eadcca] px-4 text-sm outline-none focus:border-[#ef8219]" />
              <input required type="email" placeholder="Email" className="h-11 w-full rounded-xl border border-[#eadcca] px-4 text-sm outline-none focus:border-[#ef8219]" />
              <input placeholder="Telephone" className="h-11 w-full rounded-xl border border-[#eadcca] px-4 text-sm outline-none focus:border-[#ef8219]" />
              <textarea required rows={5} placeholder="Votre message" className="w-full rounded-xl border border-[#eadcca] px-4 py-3 text-sm outline-none focus:border-[#ef8219]" />
            </div>
            <button type="submit" className="mt-6 w-full rounded-xl bg-[#ef8219] py-3 text-sm font-semibold text-white hover:bg-[#d86d14]">
              Envoyer
            </button>
            {sent ? (
              <p className="mt-4 text-sm font-medium text-[#1f4d3f]">
                Message enregistre localement. Branchez un endpoint backend pour l&apos;envoi reel.
              </p>
            ) : null}
          </form>
        </div>
      </div>
    </StorefrontPage>
  );
}
