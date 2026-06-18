"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Award,
  Coins,
  Edit3,
  Loader2,
  Plus,
  Save,
  Trash2,
  X,
  History,
  TrendingUp,
} from "lucide-react";
import { useAuthSession } from "@/components/auth/useAuthSession";
import { useConfirmDialog } from "@/components/admin/useConfirmDialog";
import {
  adjustAdminLoyaltyPoints,
  createAdminLoyaltyProfile,
  deleteAdminLoyaltyProfile,
  getAdminLoyaltyProfiles,
  getLoyaltyTiers,
  patchAdminLoyaltyProfile,
  type AdminLoyaltyProfile,
  type LoyaltyTier,
} from "@/lib/ecommerce-api";
import { formatCurrency, readApiError } from "@/lib/utils";

export default function LoyaltySection() {
  const session = useAuthSession();
  const { confirm, confirmDialog } = useConfirmDialog();
  const [tab, setTab] = useState<"profiles" | "tiers">("profiles");
  const [profiles, setProfiles] = useState<AdminLoyaltyProfile[]>([]);
  const [tiers, setTiers] = useState<LoyaltyTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal States
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form States
  const [selectedProfile, setSelectedProfile] = useState<AdminLoyaltyProfile | null>(null);
  const [pointsDelta, setPointsDelta] = useState("");
  const [adjustReason, setAdjustReason] = useState("");
  const [saving, setSaving] = useState(false);

  // Edit/Create Profile Form States
  const [editTierId, setEditTierId] = useState("");
  const [createUserId, setCreateUserId] = useState("");

  const loadData = async () => {
    if (!session?.token) return;
    setLoading(true);
    setError(null);
    try {
      const [profilesData, tiersData] = await Promise.all([
        getAdminLoyaltyProfiles(session.token),
        getLoyaltyTiers(session.token),
      ]);
      setProfiles(profilesData);
      setTiers(tiersData);
    } catch (err) {
      console.error("Error loading loyalty data:", err);
      setError(readApiError(err, "Impossible de charger les donnees de fidelite."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [session?.token]);

  const handleAdjustPoints = async () => {
    if (!session?.token || !selectedProfile) return;
    setSaving(true);
    setError(null);
    try {
      const delta = parseInt(pointsDelta, 10);
      if (isNaN(delta)) {
        throw new Error("Le montant de points doit etre un nombre valide.");
      }

      await adjustAdminLoyaltyPoints(session.token, {
        user_id: selectedProfile.id,
        points: delta,
        reason: adjustReason.trim() || "Ajustement administrateur",
      });

      setShowAdjustModal(false);
      setPointsDelta("");
      setAdjustReason("");
      setSelectedProfile(null);
      await loadData();
    } catch (err) {
      console.error("Error adjusting points:", err);
      setError(readApiError(err, "Impossible d'ajuster les points de fidelite."));
    } finally {
      setSaving(false);
    }
  };

  const handleEditProfile = async () => {
    if (!session?.token || !selectedProfile) return;
    setSaving(true);
    setError(null);
    try {
      await patchAdminLoyaltyProfile(session.token, selectedProfile.id, {
        tier_name: editTierId, // or pass nested tier parameters as API accepts
      });

      setShowEditModal(false);
      setSelectedProfile(null);
      await loadData();
    } catch (err) {
      console.error("Error patching profile:", err);
      setError(readApiError(err, "Impossible de modifier le profil de fidelite."));
    } finally {
      setSaving(false);
    }
  };

  const handleCreateProfile = async () => {
    if (!session?.token) return;
    setSaving(true);
    setError(null);
    try {
      if (!createUserId.trim()) {
        throw new Error("L'identifiant de l'utilisateur est requis.");
      }

      await createAdminLoyaltyProfile(session.token, {
        id: createUserId.trim(), // Or adjust structure based on backend expectation
      });

      setShowCreateModal(false);
      setCreateUserId("");
      await loadData();
    } catch (err) {
      console.error("Error creating loyalty profile:", err);
      setError(readApiError(err, "Impossible de creer le profil de fidelite."));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProfile = async (id: string) => {
    if (!session?.token) return;

    const confirmed = await confirm({
      title: "Supprimer le profil fidélité",
      description: "Voulez-vous vraiment supprimer ce profil de fidélité ? Cette action est définitive.",
      confirmLabel: "Supprimer",
      variant: "danger",
    });
    if (!confirmed) return;

    setError(null);
    try {
      await deleteAdminLoyaltyProfile(session.token, id);
      await loadData();
    } catch (err) {
      console.error("Error deleting loyalty profile:", err);
      setError(readApiError(err, "Impossible de supprimer le profil de fidelite."));
    }
  };

  // Stats computation
  const stats = {
    totalProfiles: profiles.length,
    totalPoints: profiles.reduce((sum, p) => sum + (p.points_balance || 0), 0),
    avgPoints: profiles.length ? Math.round(profiles.reduce((sum, p) => sum + (p.points_balance || 0), 0) / profiles.length) : 0,
    totalEarned: profiles.reduce((sum, p) => sum + (p.total_points_earned || 0), 0),
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8b5e34]">
            Fidelisation
          </p>
          <h1 className="mt-2 flex items-center gap-2 text-2xl font-bold text-slate-900">
            <Coins className="h-6 w-6 text-[#8b5e34]" /> Programme de Fidelite
          </h1>
          <p className="text-sm text-slate-500">
            Gere les points, les grades et les recompenses de tes clients.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 rounded-xl bg-[#1f4d3f] px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-[#17392f]"
          >
            <Plus className="h-4 w-4" /> Activer un profil
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Stats Dashboard */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Profils actifs", value: stats.totalProfiles, icon: Award, desc: "Membres enregistres" },
          { label: "Points en circulation", value: stats.totalPoints, icon: Coins, desc: "Solde des clients" },
          { label: "Moyenne par client", value: `${stats.avgPoints} pts`, icon: TrendingUp, desc: "Fidelite moyenne" },
          { label: "Points gagnes (lifetime)", value: stats.totalEarned, icon: History, desc: "Cumul historique" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{stat.label}</span>
              <stat.icon className="h-5 w-5 text-[#8b5e34]" />
            </div>
            <p className="mt-3 text-2xl font-bold text-slate-900">{stat.value}</p>
            <p className="mt-1 text-xs text-slate-400">{stat.desc}</p>
          </div>
        ))}
      </div>

      {/* Navigation tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-px">
        {[
          { key: "profiles" as const, label: "Membres du programme" },
          { key: "tiers" as const, label: "Grades & Paliers" },
        ].map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setTab(item.key)}
            className={`border-b-2 px-4 py-2.5 text-sm font-semibold transition-all ${
              tab === item.key
                ? "border-[#8b5e34] text-[#8b5e34]"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12 text-slate-500">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : tab === "profiles" ? (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <th className="px-6 py-3">ID Client</th>
                  <th className="px-6 py-3">Palier Actuel</th>
                  <th className="px-6 py-3 text-right">Points Actifs</th>
                  <th className="px-6 py-3 text-right">Points Cumules</th>
                  <th className="px-6 py-3 text-right">Total Depenses</th>
                  <th className="px-6 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {profiles.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      Aucun profil de fidelite trouve.
                    </td>
                  </tr>
                ) : (
                  profiles.map((profile) => (
                    <tr key={profile.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4 font-mono text-xs text-slate-500">
                        {profile.id}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2.5 py-1 text-xs font-bold text-orange-700">
                          <Award className="h-3.5 w-3.5" />
                          {profile.tier_name || profile.tier?.name || "Bronze"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-slate-900">
                        {profile.points_balance} pts
                      </td>
                      <td className="px-6 py-4 text-right text-slate-500">
                        {profile.total_points_earned} pts
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-slate-600">
                        {formatCurrency(profile.total_solde, "FCFA")}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedProfile(profile);
                              setShowAdjustModal(true);
                            }}
                            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:border-[#8b5e34] hover:text-[#8b5e34]"
                          >
                            Ajuster points
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedProfile(profile);
                              setEditTierId(profile.tier_name || "");
                              setShowEditModal(true);
                            }}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                            aria-label="Modifier profil"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleDeleteProfile(profile.id)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                            aria-label="Supprimer profil"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tiers.length === 0 ? (
            <div className="col-span-full rounded-2xl border border-dashed border-slate-200 bg-white py-12 text-center text-slate-400">
              Aucun grade configure dans le programme.
            </div>
          ) : (
            tiers.map((tier, index) => (
              <div
                key={tier.id}
                className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
              >
                <div className="absolute -right-8 -top-8 flex h-24 w-24 items-center justify-center rounded-full bg-slate-50 text-slate-200 font-bold text-4xl">
                  {index + 1}
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-700">
                    <Award className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{tier.name}</h3>
                    <p className="text-xs text-slate-400">Palier de fidelite</p>
                  </div>
                </div>

                <div className="mt-6 space-y-3 border-t border-slate-100 pt-4 text-sm text-slate-600">
                  <div className="flex justify-between">
                    <span>Points requis (Lifetime)</span>
                    <span className="font-semibold text-slate-900">{tier.min_points} pts</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Depenses minimum</span>
                    <span className="font-semibold text-slate-900">
                      {formatCurrency(tier.min_solde, "FCFA")}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-slate-100 pt-3">
                    <span className="font-semibold text-slate-900">Reduction automatique</span>
                    <span className="text-base font-bold text-emerald-600">-{tier.discount_percent}%</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Point Adjustment Modal */}
      <AnimatePresence>
        {showAdjustModal && selectedProfile && (
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
                <h3 className="text-lg font-bold text-slate-900">Ajuster le solde de points</h3>
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
                  <label className="mb-1 block text-xs font-semibold text-slate-500">Client ID</label>
                  <input
                    disabled
                    value={selectedProfile.id}
                    className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-xs font-mono text-slate-500 outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-500">
                    Nombre de points *
                  </label>
                  <input
                    type="number"
                    value={pointsDelta}
                    onChange={(e) => setPointsDelta(e.target.value)}
                    placeholder="Ex: 50 ou -30"
                    className="h-10 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-[#8b5e34]"
                  />
                  <p className="mt-1 text-xs text-slate-400">
                    Met un nombre positif pour crediter ou negatif pour debiter.
                  </p>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-500">Motif *</label>
                  <input
                    type="text"
                    value={adjustReason}
                    onChange={(e) => setAdjustReason(e.target.value)}
                    placeholder="Ex: Bonus anniversaire, Correction erreur..."
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
                  Valider
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {showEditModal && selectedProfile && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowEditModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
            >
              <div className="mb-5 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900">Modifier le profil de fidelite</h3>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="text-slate-400 hover:text-slate-950"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-500">Palier de fidelite</label>
                  <select
                    value={editTierId}
                    onChange={(e) => setEditTierId(e.target.value)}
                    className="h-10 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-[#8b5e34]"
                  >
                    <option value="">(Aucun palier force)</option>
                    {tiers.map((tier) => (
                      <option key={tier.id} value={tier.name}>
                        {tier.name} (-{tier.discount_percent}%)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-500 hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={() => void handleEditProfile()}
                  disabled={saving}
                  className="flex items-center gap-2 rounded-xl bg-[#8b5e34] px-5 py-2 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Enregistrer
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Create Profile Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowCreateModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
            >
              <div className="mb-5 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900">Activer le programme de fidelite</h3>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="text-slate-400 hover:text-slate-950"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-500">
                    ID Utilisateur (UUID) *
                  </label>
                  <input
                    type="text"
                    value={createUserId}
                    onChange={(e) => setCreateUserId(e.target.value)}
                    placeholder="Saisis l'UUID de l'utilisateur"
                    className="h-10 w-full rounded-xl border border-slate-200 px-4 text-sm font-mono outline-none focus:border-[#8b5e34]"
                  />
                  <p className="mt-1 text-xs text-slate-400">
                    Initialise et active un profil de fidelite pour l&apos;utilisateur donne.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-500 hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={() => void handleCreateProfile()}
                  disabled={saving || !createUserId.trim()}
                  className="flex items-center gap-2 rounded-xl bg-[#1f4d3f] px-5 py-2 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Activer
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
