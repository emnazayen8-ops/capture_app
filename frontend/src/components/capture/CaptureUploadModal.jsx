import React, { useState } from "react";
import { captureService } from "../../api/captureService";

export default function CaptureUploadModal({ menuId, onClose, onUploaded }) {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Veuillez choisir une image.");
      return;
    }
    setUploading(true);
    setError(null);
    try {
      await captureService.create(menuId, file, description);
      onUploaded();
    } catch (err) {
      setError(
        err.response?.data?.message || "Échec de l'envoi de la capture."
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-800">Ajouter une capture</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <label className="block text-sm text-slate-600 mb-1">Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full text-sm mb-3"
          />

          {previewUrl && (
            <img
              src={previewUrl}
              alt="Aperçu"
              className="w-full rounded-md border border-slate-200 mb-3 max-h-48 object-contain bg-slate-50"
            />
          )}

          <label className="block text-sm text-slate-600 mb-1">
            Description (optionnelle)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 mb-2"
          />

          {error && <p className="text-sm text-red-600 mb-2">{error}</p>}

          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md border border-slate-300 text-slate-600 hover:bg-slate-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="px-4 py-2 rounded-md bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-60"
            >
              {uploading ? "Envoi..." : "Ajouter"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
