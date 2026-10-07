import React, { useEffect, useState } from "react";
import { videoService } from "../../api/videoService";

export default function VideoWorkspaceModal({ menuId, onClose, onSaved }) {
  const [preview, setPreview] = useState(null); // { videoBase64, contentType }
  const [generating, setGenerating] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      setGenerating(true);
      setError(null);
      try {
        const result = await videoService.generate(menuId);
        setPreview(result);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Une vidéo existe déjà : dévalidez-la avant d'en régénérer une nouvelle."
        );
      } finally {
        setGenerating(false);
      }
    })();
  }, [menuId]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await videoService.savePreview(menuId);
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || "La sauvegarde de la vidéo a échoué.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800">Visualisation de la Vidéo</h3>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving || !preview}
              className="px-4 py-2 rounded-md bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-60"
            >
              {saving ? "Sauvegarde..." : "Sauvegarder"}
            </button>
            <button
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 rounded-md border border-slate-300 text-slate-600 hover:bg-slate-50 disabled:opacity-60"
            >
              Fermer
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {generating && (
            <p className="text-sm text-slate-400">Génération de la vidéo en cours...</p>
          )}
          {error && <p className="text-sm text-red-600">{error}</p>}

          {preview && (
            <>
              <video
                src={`data:${preview.contentType || "video/mp4"};base64,${preview.videoBase64}`}
                controls
                autoPlay
                className="w-full rounded-md bg-black max-h-[70vh]"
              />
              <p className="text-xs text-slate-400 mt-2">
                Cette vidéo n'est pas encore sauvegardée. Cliquez "Sauvegarder"
                pour la rendre définitive, ou "Fermer" pour l'abandonner.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
