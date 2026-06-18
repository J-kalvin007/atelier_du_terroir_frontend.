"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Users,
  Search,
  Award,
  Coins,
  Wallet,
  Loader2,
  TrendingUp,
  X,
  Save,
  ShieldAlert,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { AdminAccessNotice } from "@/components/admin/AdminAccessNotice";
import { useConfirmDialog } from "@/components/admin/useConfirmDialog";
import { useAuthSession } from "@/components/auth/useAuthSession";
import { hasAdminAccess } from "@/lib/auth";
import {
  adjustAdminLoyaltyPoints,
  getAdminAllWallets,
  getAdminLoyaltyProfiles,
  updateAdminWalletStatus,
  type AdminWallet,
  type AdminLoyaltyProfile,
} from "@/lib/ecommerce-api";
import { formatCurrency, readApiError } from "@/lib/utils";

type UnifiedClient = {
  email: string;
  name: string;
  walletId: string | null;
  walletBalance: string;
  walletStatus: "active" | "suspendu" | "blocked" | "inactif";
  loyaltyId: string | null;
  loyaltyPoints: number;
  loyaltyTotalEarned: number;
  loyaltyTotalSpent: string;
  loyaltyTier: string;
};

export default function ClientsSection() {
  const session = useAuthSession();
  const { confirm, confirmDialog } = useConfirmDialog();
  const [wallets, setWallets] = useState<AdminWallet[]>([]);
  const [profiles, setProfiles] = useState<AdminLoyaltyProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Point Adjustment modal state
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<UnifiedClient | null>(null);
  const [pointsDelta, setPointsDelta] = useState("");
  const [adjustReason, setAdjustReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);

  const loadData = async () => {
    if (!session?.token) return;
    setLoading(true);
    setError(null);

    const [walletsResult, profilesResult] = await Promise.allSettled([
      getAdminAllWallets(session.token),
      getAdminLoyaltyProfiles(session.token),
    ]);

    if (walletsResult.status === "fulfilled") {
      setWallets(walletsResult.value);
    } else {
      console.error("Error loading wallets:", walletsResult.reason);
      setWallets([]);
    }

    if (profilesResult.status === "fulfilled") {
      setProfiles(profilesResult.value);
    } else {
      console.error("Error loading loyalty profiles:", profilesResult.reason);
      setProfiles([]);
    }

    if (walletsResult.status === "rejected" && profilesResult.status === "rejected") {
      setError(
        readApiError(
          walletsResult.reason,
          "Impossible de charger l'annuaire des clients (wallets et fidelite)."
        )
      );
    } else if (profilesResult.status === "rejected" && walletsResult.status === "fulfilled") {
      setError(
        readApiError(
          profilesResult.reason,
          "Wallets charges, mais les profils fidelite sont indisponibles."
        )
      );
    } else if (walletsResult.status === "rejected" && profilesResult.status === "fulfilled") {
      setError(
        readApiError(
          walletsResult.reason,
          "Profils fidelite charges, mais les wallets sont indisponibles."
        )
      );
    }

    setLoading(false);
  };

  useEffect(() => {
    void loadData();
  }, [session?.token]);

  // Merge wallets and loyalty profiles by email
  const unifiedClients = useMemo(() => {
    const clientsMap = new Map<string, UnifiedClient>();

    // 1. Process wallets
    wallets.forEach((wallet) => {
      const email = wallet.user_email.toLowerCase().trim();
      clientsMap.set(email, {
        email,
        name: wallet.user_name || "Client",
        walletId: wallet.id,
        walletBalance: wallet.balance,
        walletStatus: wallet.status,
        loyaltyId: null,
        loyaltyPoints: 0,
        loyaltyTotalEarned: 0,
        loyaltyTotalSpent: "0.00",
        loyaltyTier: "Bronze",
      });
    });

    // 2. Process loyalty profiles and merge
    profiles.forEach((profile) => {
      // Note: If profile ID contains the email (sometimes Django stores UUID, sometimes it is linked to user username/email)
      // Let's look for matching emails or match by ID if it maps directly or guess if there's user email in profile metadata.
      // Since Django LoyaltyProfile schema might not expose user_email directly, we can check if there's username/email in profile.id or raw fields.
      const rawUser = profile.id; // Or profile.user_email if it exists in API
      // If we don't have user_email directly in LoyaltyProfile schema, we can look at profile.id or raw metadata.
      // Usually, profile has `user_email` or `user` details, let's check profile.id which might match.
      // For fallback/merging, let's look if profile ID maps or we can list loyalty profiles as clients directly.
      const emailMatch = (profile as any).user_email || profile.id;
      if (!emailMatch) return;

      const email = emailMatch.toLowerCase().trim();
      const existing = clientsMap.get(email);

      if (existing) {
        existing.loyaltyId = profile.id;
        existing.loyaltyPoints = profile.points_balance;
        existing.loyaltyTotalEarned = profile.total_points_earned;
        existing.loyaltyTotalSpent = profile.total_solde;
        existing.loyaltyTier = profile.tier_name || profile.tier?.name || "Bronze";
      } else {
        clientsMap.set(email, {
          email,
          name: (profile as any).user_name || "Membre fidelite",
          walletId: null,
          walletBalance: "0.00",
          walletStatus: "inactif",
          loyaltyId: profile.id,
          loyaltyPoints: profile.points_balance,
          loyaltyTotalEarned: profile.total_points_earned,
          loyaltyTotalSpent: profile.total_solde,
          loyaltyTier: profile.tier_name || profile.tier?.name || "Bronze",
        });
      }
    });

    return Array.from(clientsMap.values());
  }, [wallets, profiles]);

  // Filter client list based on search
  const filteredClients = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return unifiedClients;
    return unifiedClients.filter(
      (c) => c.name.toLowerCase().includes(query) || c.email.toLowerCase().includes(query)
    );
  }, [unifiedClients, searchQuery]);

  const handleAdjustPoints = async () => {
    if (!session?.token || !selectedClient || !selectedClient.loyaltyId) return;
    setSaving(true);
    setError(null);
    try {
      const delta = parseInt(pointsDelta, 10);
      if (isNaN(delta)) {
        throw new Error("Le montant de points doit etre un nombre valide.");
      }

      await adjustAdminLoyaltyPoints(session.token, {
        user_id: selectedClient.loyaltyId,
        points: delta,
        reason: adjustReason.trim() || "Ajustement administrateur CRM",
      });

      setShowAdjustModal(false);
      setPointsDelta("");
      setAdjustReason("");
      setSelectedClient(null);
      await loadData();
    } catch (err) {
      console.error("Error adjusting points in CRM:", err);
      setError(readApiError(err, "Impossible d'ajuster les points de fidelite."));
    } finally {
      setSaving(false);
    }
  };

  const handleWalletStatusToggle = async (walletId: string, currentBalance: string, newStatus: "active" | "suspendu" | "blocked") => {
    if (!session?.token) return;
    const balanceNum = parseFloat(currentBalance);
    if (newStatus !== "active" && balanceNum > 0) {
      const confirmed = await confirm({
        title: "Restreindre le wallet",
        description:
          "Le solde du client est supérieur à 0. Voulez-vous quand même appliquer cette restriction ?",
        confirmLabel: "Continuer",
        variant: "default",
      });
      if (!confirmed) {
        return;
      }
    }

    setUpdatingStatusId(walletId);
    setError(null);
    try {
      await updateAdminWalletStatus(session.token, walletId, newStatus);
      await loadData();
    } catch (err) {
      console.error("Error toggling wallet status in CRM:", err);
      setError(readApiError(err, "Impossible d'ajuster le statut du wallet."));
    } finally {
      setUpdatingStatusId(null);
    }
  };

  // Stats
  const activeWallets = wallets.filter((w) => w.status === "active").length;
  const averageBalance = wallets.length
    ? Math.round(wallets.reduce((sum, w) => sum + parseFloat(w.balance), 0) / wallets.length)
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8b5e34]">
            Annuaire CRM
          </p>
          <h1 className="mt-2 flex items-center gap-2 text-2xl font-bold text-slate-900">
            <Users className="h-6 w-6 text-[#8b5e34]" /> Repertoire des Clients
          </h1>
          <p className="text-sm text-slate-500">
            Consulte la liste unifiee des clients avec leur solde de portefeuille, points de fidelite et statut de compte.
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {!hasAdminAccess(session) ? (
        <AdminAccessNotice
          title="Acces admin requis pour l'annuaire CRM"
          description="Les wallets et profils fidelite ne sont accessibles qu'avec un compte platform_admin."
        />
      ) : null}

      {/* CRM Highlight Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Total Clients Enregistres
            </span>
            <Users className="h-5 w-5 text-slate-400" />
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900">{unifiedClients.length}</p>
          <p className="mt-1 text-xs text-slate-400">Wallets & profils fidelite</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Wallets Actifs
            </span>
            <Wallet className="h-5 w-5 text-emerald-600" />
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900">{activeWallets}</p>
          <p className="mt-1 text-xs text-slate-400">Comptes prets a l&apos;achat</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Solde Moyen Client
            </span>
            <TrendingUp className="h-5 w-5 text-[#8b5e34]" />
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900">
            {formatCurrency(averageBalance, "FCFA")}
          </p>
          <p className="mt-1 text-xs text-slate-400">Moyenne par portefeuille</p>
        </div>
      </div>

      {/* Search Filter */}
      <div className="relative">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
          <Search className="h-4 w-4" />
        </span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Rechercher un client par nom ou adresse email..."
          className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-[#8b5e34]"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <th className="px-6 py-3">Client / Email</th>
                  <th className="px-6 py-3 text-right">Solde Portefeuille</th>
                  <th className="px-6 py-3 text-center">Statut Wallet</th>
                  <th className="px-6 py-3 text-right">Points Fidelite</th>
                  <th className="px-6 py-3">Palier de fidelite</th>
                  <th className="px-6 py-3 text-center">Actions rapides</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {filteredClients.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      Aucun client ne correspond a la recherche.
                    </td>
                  </tr>
                ) : (
                  filteredClients.map((client) => (
                    <tr key={client.email} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-900">{client.name}</p>
                        <p className="font-mono text-xs text-slate-400 mt-0.5">{client.email}</p>
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-emerald-700">
                        {formatCurrency(client.walletBalance, "FCFA")}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {updatingStatusId === client.walletId ? (
                          <Loader2 className="mx-auto h-4 w-4 animate-spin text-slate-400" />
                        ) : client.walletId ? (
                          <select
                            value={client.walletStatus}
                            onChange={(e) =>
                              void handleWalletStatusToggle(
                                client.walletId!,
                                client.walletBalance,
                                e.target.value as any
                              )
                            }
                            className={`rounded-lg border border-slate-200 bg-white px-2 py-0.5 text-xs font-bold outline-none focus:border-[#8b5e34] ${
                              client.walletStatus === "active"
                                ? "text-emerald-700"
                                : client.walletStatus === "suspendu"
                                  ? "text-amber-700"
                                  : "text-red-700"
                            }`}
                          >
                            <option value="active">Actif</option>
                            <option value="suspendu">Suspendu</option>
                            <option value="blocked">Bloque</option>
                          </select>
                        ) : (
                          <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-500">
                            Non cree
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-slate-900">
                        {client.loyaltyPoints} pts
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2 py-0.5 text-xs font-bold text-orange-700">
                          <Award className="h-3 w-3" />
                          {client.loyaltyTier}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {client.loyaltyId ? (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedClient(client);
                              setShowAdjustModal(true);
                            }}
                            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:border-[#8b5e34] hover:text-[#8b5e34]"
                          >
                            Ajuster points
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400 flex items-center justify-center gap-1">
                            <ShieldAlert className="h-3.5 w-3.5" /> Fidelite inactive
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Point Adjustment Modal */}
      <AnimatePresence>
        {showAdjustModal && selectedClient && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowAdjustModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
            >
              <div className="mb-5 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900">Ajuster points de fidelite</h3>
                <button
                  type="button"
                  onClick={() => setShowAdjustModal(false)}
                  className="text-slate-400 hover:text-slate-950"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-500">Client</label>
                  <p className="text-sm font-semibold text-slate-900">{selectedClient.name}</p>
                  <p className="font-mono text-xs text-slate-400">{selectedClient.email}</p>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-500">
                    Solde actuel de points
                  </label>
                  <p className="text-sm font-bold text-slate-900">{selectedClient.loyaltyPoints} pts</p>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-500">
                    Variation de points *
                  </label>
                  <input
                    type="number"
                    value={pointsDelta}
                    onChange={(e) => setPointsDelta(e.target.value)}
                    placeholder="Ex: 50 ou -20"
                    className="h-10 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-[#8b5e34]"
                  />
                  <p className="mt-1 text-xs text-slate-400">
                    Positif pour ajouter, negatif pour soustraire.
                  </p>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-500">Motif *</label>
                  <input
                    type="text"
                    value={adjustReason}
                    onChange={(e) => setAdjustReason(e.target.value)}
                    placeholder="Ex: Geste commercial, Reclamation..."
                    className="h-10 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-[#8b5e34]"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAdjustModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-500 hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={() => void handleAdjustPoints()}
                  disabled={saving || !pointsDelta.trim() || !adjustReason.trim()}
                  className="flex items-center gap-2 rounded-xl bg-[#8b5e34] px-5 py-2 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Valider l&apos;ajustement
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {confirmDialog}
    </div>
  );
}
