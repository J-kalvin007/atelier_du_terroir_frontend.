"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Tag,
  Zap,
  Plus,
  Percent,
  Clock,
  Loader2,
  X,
  Save,
  Trash2,
  ImageIcon,
  RefreshCw,
} from "lucide-react";
import { AdminAccessNotice } from "@/components/admin/AdminAccessNotice";
import { useAuthSession } from "@/components/auth/useAuthSession";
import { hasAdminAccess } from "@/lib/auth";
import {
  createAdminBanner,
  createAdminFlashSale,
  createAdminPromoCode,
  deactivateExpiredPromoCodes,
  deleteAdminBanner,
  deleteAdminFlashSale,
  deleteAdminPromoCode,
  getAdminBanners,
  getAdminFlashSales,
  getAdminProducts,
  getAdminPromoCodes,
  patchAdminBanner,
  patchAdminFlashSale,
  patchAdminPromoCode,
  type AdminBanner,
  type AdminCatalogProduct,
  type AdminFlashSale,
  type AdminPromoCode,
} from "@/lib/ecommerce-api";
import { cn, formatCurrency, readApiError } from "@/lib/utils";

type TabKey = "coupons" | "flash" | "banners";

interface PromoFormState {
  code: string;
  description: string;
  type: "percentage" | "fixed_amount" | "free_shipping";
  value: string;
  starts_at: string;
  expires_at: string;
  is_active: boolean;
}

interface FlashFormState {
  product: string;
  sale_price: string;
  quota_stock_limit: string;
  starts_at: string;
  ends_at: string;
  is_active: boolean;
}

interface BannerFormState {
  title: string;
  subtitle: string;
  image: string;
  cta_label: string;
  cta_url: string;
  banner_type: "carousel" | "popup" | "hero" | "side_banner";
  position: string;
  starts_at: string;
  ends_at: string;
  is_active: boolean;
}

const INITIAL_PROMO_FORM: PromoFormState = {
  code: "",
  description: "",
  type: "percentage",
  value: "",
  starts_at: "",
  expires_at: "",
  is_active: true,
};

const INITIAL_FLASH_FORM: FlashFormState = {
  product: "",
  sale_price: "",
  quota_stock_limit: "",
  starts_at: "",
  ends_at: "",
  is_active: true,
};

const INITIAL_BANNER_FORM: BannerFormState = {
  title: "",
  subtitle: "",
  image: "",
  cta_label: "",
  cta_url: "",
  banner_type: "carousel",
  position: "0",
  starts_at: "",
  ends_at: "",
  is_active: true,
};

export default function PromotionsSection() {
  const session = useAuthSession();
  const [tab, setTab] = useState<TabKey>("coupons");
  const [promos, setPromos] = useState<AdminPromoCode[]>([]);
  const [flashSales, setFlashSales] = useState<AdminFlashSale[]>([]);
  const [banners, setBanners] = useState<AdminBanner[]>([]);
  const [products, setProducts] = useState<AdminCatalogProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deactivating, setDeactivating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [showFlashModal, setShowFlashModal] = useState(false);
  const [showBannerModal, setShowBannerModal] = useState(false);
  const [promoForm, setPromoForm] = useState<PromoFormState>(INITIAL_PROMO_FORM);
  const [flashForm, setFlashForm] = useState<FlashFormState>(INITIAL_FLASH_FORM);
  const [bannerForm, setBannerForm] = useState<BannerFormState>(INITIAL_BANNER_FORM);

  const loadData = async () => {
    if (!session?.token) return;

    setLoading(true);
    setError(null);

    const [promoResult, flashResult, bannerResult, productResult] = await Promise.allSettled([
      getAdminPromoCodes(session.token),
      getAdminFlashSales(session.token),
      getAdminBanners(session.token),
      getAdminProducts(session.token),
    ]);

    if (promoResult.status === "fulfilled") setPromos(promoResult.value);
    else setPromos([]);

    if (flashResult.status === "fulfilled") setFlashSales(flashResult.value);
    else setFlashSales([]);

    if (bannerResult.status === "fulfilled") setBanners(bannerResult.value);
    else setBanners([]);

    if (productResult.status === "fulfilled") setProducts(productResult.value);
    else setProducts([]);

    if (
      promoResult.status === "rejected" &&
      flashResult.status === "rejected" &&
      bannerResult.status === "rejected"
    ) {
      setError(readApiError(promoResult.reason, "Impossible de charger les promotions."));
    }

    setLoading(false);
  };

  useEffect(() => {
    void loadData();
  }, [session?.token]);

  const stats = useMemo(
    () => ({
      activePromos: promos.filter((promo) => promo.is_active).length,
      totalUses: promos.reduce((total, promo) => total + (promo.number_times_used ?? 0), 0),
      activeFlash: flashSales.filter((flash) => flash.is_active).length,
      activeBanners: banners.filter((banner) => banner.is_active).length,
    }),
    [banners, flashSales, promos]
  );

  const productNameById = useMemo(() => {
    const map = new Map<string, string>();
    products.forEach((product) => map.set(product.id, product.name));
    return map;
  }, [products]);

  const handleDeactivateExpired = async () => {
    if (!session?.token) return;

    setDeactivating(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await deactivateExpiredPromoCodes(session.token);
      setSuccess(`${result.deactivated} code(s) expire(s) desactive(s).`);
      await loadData();
    } catch (err) {
      setError(readApiError(err, "Impossible de desactiver les codes expires."));
    } finally {
      setDeactivating(false);
    }
  };

  const handleSavePromo = async () => {
    if (!session?.token) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await createAdminPromoCode(session.token, {
        is_active: promoForm.is_active,
        code: promoForm.code.trim().toUpperCase(),
        description: promoForm.description.trim(),
        type: promoForm.type,
        value: promoForm.value.trim(),
        starts_at: promoForm.starts_at || undefined,
        expires_at: promoForm.expires_at || null,
      });
      setShowPromoModal(false);
      setPromoForm(INITIAL_PROMO_FORM);
      setSuccess("Code promo cree.");
      await loadData();
    } catch (err) {
      setError(readApiError(err, "Impossible de creer le code promo."));
    } finally {
      setSaving(false);
    }
  };

  const handleSaveFlash = async () => {
    if (!session?.token) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await createAdminFlashSale(session.token, {
        is_active: flashForm.is_active,
        product: flashForm.product,
        sale_price: flashForm.sale_price.trim(),
        ends_at: flashForm.ends_at,
        starts_at: flashForm.starts_at || undefined,
        quota_stock_limit: flashForm.quota_stock_limit
          ? Number(flashForm.quota_stock_limit)
          : null,
      });
      setShowFlashModal(false);
      setFlashForm(INITIAL_FLASH_FORM);
      setSuccess("Vente flash creee.");
      await loadData();
    } catch (err) {
      setError(readApiError(err, "Impossible de creer la vente flash."));
    } finally {
      setSaving(false);
    }
  };

  const handleSaveBanner = async () => {
    if (!session?.token) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await createAdminBanner(session.token, {
        is_active: bannerForm.is_active,
        title: bannerForm.title.trim(),
        subtitle: bannerForm.subtitle.trim() || undefined,
        image: bannerForm.image.trim(),
        cta_label: bannerForm.cta_label.trim() || undefined,
        cta_url: bannerForm.cta_url.trim() || undefined,
        banner_type: bannerForm.banner_type,
        position: Number(bannerForm.position || "0"),
        starts_at: bannerForm.starts_at || undefined,
        ends_at: bannerForm.ends_at || null,
      });
      setShowBannerModal(false);
      setBannerForm(INITIAL_BANNER_FORM);
      setSuccess("Banniere creee.");
      await loadData();
    } catch (err) {
      setError(readApiError(err, "Impossible de creer la banniere."));
    } finally {
      setSaving(false);
    }
  };

  const togglePromoActive = async (promo: AdminPromoCode) => {
    if (!session?.token) return;
    try {
      await patchAdminPromoCode(session.token, promo.id, { is_active: !promo.is_active });
      await loadData();
    } catch (err) {
      setError(readApiError(err, "Impossible de mettre a jour le code promo."));
    }
  };

  const toggleFlashActive = async (flash: AdminFlashSale) => {
    if (!session?.token) return;
    try {
      await patchAdminFlashSale(session.token, flash.id, { is_active: !flash.is_active });
      await loadData();
    } catch (err) {
      setError(readApiError(err, "Impossible de mettre a jour la vente flash."));
    }
  };

  const toggleBannerActive = async (banner: AdminBanner) => {
    if (!session?.token) return;
    try {
      await patchAdminBanner(session.token, banner.id, { is_active: !banner.is_active });
      await loadData();
    } catch (err) {
      setError(readApiError(err, "Impossible de mettre a jour la banniere."));
    }
  };

  const handleDeletePromo = async (id: string) => {
    if (!session?.token || !window.confirm("Supprimer ce code promo ?")) return;
    try {
      await deleteAdminPromoCode(session.token, id);
      setSuccess("Code promo supprime.");
      await loadData();
    } catch (err) {
      setError(readApiError(err, "Impossible de supprimer le code promo."));
    }
  };

  const handleDeleteFlash = async (id: string) => {
    if (!session?.token || !window.confirm("Supprimer cette vente flash ?")) return;
    try {
      await deleteAdminFlashSale(session.token, id);
      setSuccess("Vente flash supprimee.");
      await loadData();
    } catch (err) {
      setError(readApiError(err, "Impossible de supprimer la vente flash."));
    }
  };

  const handleDeleteBanner = async (id: string) => {
    if (!session?.token || !window.confirm("Supprimer cette banniere ?")) return;
    try {
      await deleteAdminBanner(session.token, id);
      setSuccess("Banniere supprimee.");
      await loadData();
    } catch (err) {
      setError(readApiError(err, "Impossible de supprimer la banniere."));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Promotions</h1>
          <p className="text-sm text-slate-500">Codes promo, ventes flash et bannieres admin</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {tab === "coupons" ? (
            <>
              <button
                type="button"
                onClick={() => void handleDeactivateExpired()}
                disabled={deactivating}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
              >
                {deactivating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                Desactiver expires
              </button>
              <button
                type="button"
                onClick={() => setShowPromoModal(true)}
                className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-200 hover:bg-primary-hover"
              >
                <Plus className="h-4 w-4" />
                Nouveau code
              </button>
            </>
          ) : null}
          {tab === "flash" ? (
            <button
              type="button"
              onClick={() => setShowFlashModal(true)}
              className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-200 hover:bg-primary-hover"
            >
              <Plus className="h-4 w-4" />
              Nouvelle vente flash
            </button>
          ) : null}
          {tab === "banners" ? (
            <button
              type="button"
              onClick={() => setShowBannerModal(true)}
              className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-200 hover:bg-primary-hover"
            >
              <Plus className="h-4 w-4" />
              Nouvelle banniere
            </button>
          ) : null}
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {success}
        </div>
      ) : null}

      {!hasAdminAccess(session) ? (
        <AdminAccessNotice
          title="Acces admin requis pour les promotions"
          description="Les codes promo, ventes flash et bannieres admin ne sont accessibles qu'avec un compte platform_admin."
        />
      ) : null}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: "Codes actifs", value: stats.activePromos, icon: Tag },
          { label: "Utilisations", value: stats.totalUses, icon: Percent },
          { label: "Flash actives", value: stats.activeFlash, icon: Zap },
          { label: "Bannieres actives", value: stats.activeBanners, icon: ImageIcon },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <stat.icon className="h-4 w-4 text-primary" />
            <p className="mt-2 text-xl font-bold text-slate-900">{stat.value}</p>
            <p className="text-[11px] text-slate-500">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          { key: "coupons" as const, label: "Codes promo" },
          { key: "flash" as const, label: "Ventes flash" },
          { key: "banners" as const, label: "Bannieres" },
        ].map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setTab(item.key)}
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-medium transition-all",
              tab === item.key
                ? "bg-primary text-white"
                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
          <Loader2 className="mx-auto mb-2 h-6 w-6 animate-spin" />
          Chargement...
        </div>
      ) : tab === "coupons" ? (
        <div className="grid gap-3 md:grid-cols-2">
          {promos.length === 0 ? (
            <div className="col-span-full rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-slate-500">
              Aucun code promo.
            </div>
          ) : (
            promos.map((promo) => (
              <div key={promo.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-lg font-bold text-slate-900">{promo.code}</p>
                    <p className="mt-1 text-sm text-slate-500">{promo.description || "Sans description"}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => void togglePromoActive(promo)}
                      className={cn(
                        "rounded-full px-2.5 py-1 text-[10px] font-semibold",
                        promo.is_active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                      )}
                    >
                      {promo.is_active ? "Actif" : "Inactif"}
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDeletePromo(promo.id)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-500">
                  <span>
                    {promo.type === "percentage"
                      ? `${promo.value}%`
                      : promo.type === "free_shipping"
                        ? "Livraison gratuite"
                        : formatCurrency(promo.value, "FCFA")}
                  </span>
                  <span>{promo.number_times_used ?? 0} utilisation(s)</span>
                  {promo.expires_at ? (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(promo.expires_at).toLocaleDateString("fr-FR")}
                    </span>
                  ) : null}
                </div>
              </div>
            ))
          )}
        </div>
      ) : tab === "flash" ? (
        <div className="grid gap-3 md:grid-cols-2">
          {flashSales.length === 0 ? (
            <div className="col-span-full rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-slate-500">
              Aucune vente flash.
            </div>
          ) : (
            flashSales.map((flash) => (
              <div key={flash.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-900">
                    {productNameById.get(flash.product) || `Produit ${flash.product.slice(0, 8)}...`}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => void toggleFlashActive(flash)}
                      className={cn(
                        "rounded-full px-2.5 py-1 text-[10px] font-semibold",
                        flash.is_active ? "bg-orange-50 text-orange-700" : "bg-slate-100 text-slate-500"
                      )}
                    >
                      {flash.is_active ? "Active" : "Inactive"}
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDeleteFlash(flash.id)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-xl font-bold text-primary">
                    {formatCurrency(flash.sale_price, "FCFA")}
                  </span>
                  <span className="text-sm text-slate-400 line-through">
                    {formatCurrency(flash.original_price, "FCFA")}
                  </span>
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  {flash.product_sold_count}
                  {flash.quota_stock_limit != null ? `/${flash.quota_stock_limit}` : ""} vendus
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Fin : {new Date(flash.ends_at).toLocaleString("fr-FR")}
                </p>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {banners.length === 0 ? (
            <div className="col-span-full rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-slate-500">
              Aucune banniere.
            </div>
          ) : (
            banners.map((banner) => (
              <div key={banner.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                {banner.image ? (
                  <div
                    className="h-32 bg-cover bg-center"
                    style={{ backgroundImage: `url(${banner.image})` }}
                  />
                ) : (
                  <div className="flex h-32 items-center justify-center bg-slate-100 text-slate-400">
                    <ImageIcon className="h-8 w-8" />
                  </div>
                )}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">{banner.title}</p>
                      <p className="mt-1 text-sm text-slate-500">{banner.subtitle || "Sans sous-titre"}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => void toggleBannerActive(banner)}
                        className={cn(
                          "rounded-full px-2.5 py-1 text-[10px] font-semibold",
                          banner.is_active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                        )}
                      >
                        {banner.is_active ? "Active" : "Inactive"}
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDeleteBanner(banner.id)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                    <span>{banner.banner_type || "carousel"}</span>
                    <span>Position {banner.position ?? 0}</span>
                    {banner.cta_label ? <span>CTA : {banner.cta_label}</span> : null}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <AnimatePresence>
        {showPromoModal ? (
          <ModalShell title="Nouveau code promo" onClose={() => setShowPromoModal(false)}>
            <input
              value={promoForm.code}
              onChange={(event) => setPromoForm((prev) => ({ ...prev, code: event.target.value }))}
              placeholder="CODE PROMO"
              className="h-10 w-full rounded-xl border border-slate-200 px-4 text-sm uppercase outline-none focus:border-primary"
            />
            <textarea
              rows={3}
              value={promoForm.description}
              onChange={(event) =>
                setPromoForm((prev) => ({ ...prev, description: event.target.value }))
              }
              placeholder="Description"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-primary"
            />
            <div className="grid grid-cols-2 gap-3">
              <select
                value={promoForm.type}
                onChange={(event) =>
                  setPromoForm((prev) => ({
                    ...prev,
                    type: event.target.value as PromoFormState["type"],
                  }))
                }
                className="h-10 rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-primary"
              >
                <option value="percentage">Pourcentage</option>
                <option value="fixed_amount">Montant fixe</option>
                <option value="free_shipping">Livraison gratuite</option>
              </select>
              <input
                value={promoForm.value}
                onChange={(event) => setPromoForm((prev) => ({ ...prev, value: event.target.value }))}
                placeholder="Valeur"
                className="h-10 rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-primary"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="datetime-local"
                value={promoForm.starts_at}
                onChange={(event) =>
                  setPromoForm((prev) => ({ ...prev, starts_at: event.target.value }))
                }
                className="h-10 rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-primary"
              />
              <input
                type="datetime-local"
                value={promoForm.expires_at}
                onChange={(event) =>
                  setPromoForm((prev) => ({ ...prev, expires_at: event.target.value }))
                }
                className="h-10 rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-primary"
              />
            </div>
            <ModalActions
              saving={saving}
              disabled={!promoForm.code.trim() || !promoForm.value.trim()}
              onCancel={() => setShowPromoModal(false)}
              onSave={() => void handleSavePromo()}
            />
          </ModalShell>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {showFlashModal ? (
          <ModalShell title="Nouvelle vente flash" onClose={() => setShowFlashModal(false)}>
            <select
              value={flashForm.product}
              onChange={(event) => setFlashForm((prev) => ({ ...prev, product: event.target.value }))}
              className="h-10 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-primary"
            >
              <option value="">Selectionner un produit</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
            <div className="grid grid-cols-2 gap-3">
              <input
                value={flashForm.sale_price}
                onChange={(event) =>
                  setFlashForm((prev) => ({ ...prev, sale_price: event.target.value }))
                }
                placeholder="Prix solde"
                className="h-10 rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-primary"
              />
              <input
                value={flashForm.quota_stock_limit}
                onChange={(event) =>
                  setFlashForm((prev) => ({ ...prev, quota_stock_limit: event.target.value }))
                }
                placeholder="Quota stock (optionnel)"
                className="h-10 rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-primary"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="datetime-local"
                value={flashForm.starts_at}
                onChange={(event) =>
                  setFlashForm((prev) => ({ ...prev, starts_at: event.target.value }))
                }
                className="h-10 rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-primary"
              />
              <input
                type="datetime-local"
                value={flashForm.ends_at}
                onChange={(event) =>
                  setFlashForm((prev) => ({ ...prev, ends_at: event.target.value }))
                }
                className="h-10 rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-primary"
              />
            </div>
            <ModalActions
              saving={saving}
              disabled={!flashForm.product || !flashForm.sale_price.trim() || !flashForm.ends_at}
              onCancel={() => setShowFlashModal(false)}
              onSave={() => void handleSaveFlash()}
            />
          </ModalShell>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {showBannerModal ? (
          <ModalShell title="Nouvelle banniere" onClose={() => setShowBannerModal(false)}>
            <input
              value={bannerForm.title}
              onChange={(event) => setBannerForm((prev) => ({ ...prev, title: event.target.value }))}
              placeholder="Titre *"
              className="h-10 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-primary"
            />
            <input
              value={bannerForm.subtitle}
              onChange={(event) =>
                setBannerForm((prev) => ({ ...prev, subtitle: event.target.value }))
              }
              placeholder="Sous-titre"
              className="h-10 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-primary"
            />
            <input
              value={bannerForm.image}
              onChange={(event) => setBannerForm((prev) => ({ ...prev, image: event.target.value }))}
              placeholder="URL de l'image *"
              className="h-10 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-primary"
            />
            <div className="grid grid-cols-2 gap-3">
              <select
                value={bannerForm.banner_type}
                onChange={(event) =>
                  setBannerForm((prev) => ({
                    ...prev,
                    banner_type: event.target.value as BannerFormState["banner_type"],
                  }))
                }
                className="h-10 rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-primary"
              >
                <option value="carousel">Carrousel</option>
                <option value="popup">Popup</option>
                <option value="hero">Hero</option>
                <option value="side_banner">Banniere laterale</option>
              </select>
              <input
                value={bannerForm.position}
                onChange={(event) =>
                  setBannerForm((prev) => ({ ...prev, position: event.target.value }))
                }
                placeholder="Position"
                className="h-10 rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-primary"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input
                value={bannerForm.cta_label}
                onChange={(event) =>
                  setBannerForm((prev) => ({ ...prev, cta_label: event.target.value }))
                }
                placeholder="Texte CTA"
                className="h-10 rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-primary"
              />
              <input
                value={bannerForm.cta_url}
                onChange={(event) =>
                  setBannerForm((prev) => ({ ...prev, cta_url: event.target.value }))
                }
                placeholder="URL CTA"
                className="h-10 rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-primary"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="datetime-local"
                value={bannerForm.starts_at}
                onChange={(event) =>
                  setBannerForm((prev) => ({ ...prev, starts_at: event.target.value }))
                }
                className="h-10 rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-primary"
              />
              <input
                type="datetime-local"
                value={bannerForm.ends_at}
                onChange={(event) =>
                  setBannerForm((prev) => ({ ...prev, ends_at: event.target.value }))
                }
                className="h-10 rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-primary"
              />
            </div>
            <ModalActions
              saving={saving}
              disabled={!bannerForm.title.trim() || !bannerForm.image.trim()}
              onCancel={() => setShowBannerModal(false)}
              onSave={() => void handleSaveBanner()}
            />
          </ModalShell>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function ModalShell({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-full max-w-xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
      >
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">{title}</h3>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-900">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-4">{children}</div>
      </motion.div>
    </>
  );
}

function ModalActions({
  saving,
  disabled,
  onCancel,
  onSave,
}: {
  saving: boolean;
  disabled: boolean;
  onCancel: () => void;
  onSave: () => void;
}) {
  return (
    <div className="flex justify-end gap-3 pt-2">
      <button
        type="button"
        onClick={onCancel}
        className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-500 hover:bg-slate-50"
      >
        Annuler
      </button>
      <button
        type="button"
        onClick={onSave}
        disabled={saving || disabled}
        className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-white disabled:opacity-60"
      >
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        Enregistrer
      </button>
    </div>
  );
}
