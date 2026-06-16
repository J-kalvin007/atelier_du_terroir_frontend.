"use client";

import { useEffect, useState } from "react";
import { ImageIcon, Loader2, Megaphone, Plus, ExternalLink, Calendar } from "lucide-react";
import { useAuthSession } from "@/components/auth/useAuthSession";
import { getActiveBanners, type PublicBanner } from "@/lib/ecommerce-api";

export default function BannersSection() {
  const session = useAuthSession();
  const [banners, setBanners] = useState<PublicBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBanners = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getActiveBanners();
      setBanners(data);
    } catch (err) {
      console.error("Error loading banners:", err);
      setError("Impossible de charger les bannieres actives.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadBanners();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8b5e34]">
            Marketing
          </p>
          <h1 className="mt-2 flex items-center gap-2 text-2xl font-bold text-slate-900">
            <Megaphone className="h-6 w-6 text-[#8b5e34]" /> Bannieres & Recommandations
          </h1>
          <p className="text-sm text-slate-500">
            Visualise les campagnes promotionnelles et publicitaires actuellement affichees en vitrine.
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {banners.length === 0 ? (
            <div className="col-span-full rounded-2xl border border-dashed border-slate-200 bg-white py-12 text-center text-slate-400">
              Aucune banniere active trouvee.
            </div>
          ) : (
            banners.map((banner) => (
              <div key={banner.id} className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                {banner.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={banner.image_url}
                    alt={banner.title || "Banniere"}
                    className="h-48 w-full object-cover"
                  />
                ) : (
                  <div className="h-48 bg-slate-100 flex items-center justify-center text-slate-400">
                    <ImageIcon className="h-10 w-10" />
                  </div>
                )}
                <div className="p-5">
                  <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                    Actif
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 mt-3">{banner.title || "Sans titre"}</h3>
                  <p className="text-sm text-slate-600 mt-2">
                    {banner.subtitle || "Aucune description fournie pour cette banniere."}
                  </p>
                  <div className="mt-5 flex justify-between items-center text-xs text-slate-400">
                    <span>Position: {banner.position ?? 0}</span>
                    {banner.cta_url ? (
                      <a
                        href={banner.cta_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#8b5e34] font-semibold flex items-center gap-1 hover:underline"
                      >
                        Lien cible <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : null}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
