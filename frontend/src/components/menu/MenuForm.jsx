import React, { useState } from "react";
import { menuService } from "../../api/menuService";

export default function MenuForm({ menu, moduleId, parentId, onClose, onSaved }) {
  const isEditing = !!menu;
  const [name, setName] = useState(menu?.name ?? "");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Le nom du menu est requis.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      if (isEditing) {
        await menuService.update(menu.id, { name, moduleId, parentId });
      } else {
        await menuService.create({ name, moduleId, parentId });
      }
      onSaved();
    } catch (err) {
      const raw = err.response?.data?.message || "";
      setError(
         raw.includes("Duplicate entry")
               ? "Ce menu existe déjà dans ce module."
               : raw || "Impossible d'enregistrer ce menu."
      );
} finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (
      !window.confirm(
        `Supprimer définitivement le menu "${menu.name}" ?`
      )
    )
      return;
    setDeleting(true);
    setError(null);
    try {
      await menuService.remove(menu.id);
      onSaved();
    } catch (err) {
      setError(
        err.response?.data?.message || "Impossible de supprimer ce menu."
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-5">
        <h3 className="font-semibold text-slate-800 mb-4">
          {isEditing ? "Éditer le menu" : "Nouveau menu"}
        </h3>
        <form onSubmit={handleSubmit}>
          <label className="block text-sm text-slate-600 mb-1">Nom du menu</label>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 mb-2"
            placeholder="Ex: Entête feuille de soin"
          />
          {error && <p className="text-sm text-red-600 mb-2">{error}</p>}

          <div className="flex justify-between items-center gap-2 mt-4">
            {isEditing ? (
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 rounded-md bg-red-500 text-white hover:bg-red-600 disabled:opacity-60"
              >
                {deleting ? "Suppression..." : "Supprimer"}
              </button>
            ) : (
              <span />
            )}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-md border border-slate-300 text-slate-600 hover:bg-slate-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 rounded-md bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-60"
              >
                {saving ? "Enregistrement..." : "Enregistrer"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
