import React, { useEffect, useState } from "react";
import { captureService } from "../../api/captureService";
import VideoEditorModal from "../video/VideoEditorModal";

export default function CaptureDetailsModal({
  captureId,
  menuId,
  onClose,
  onChanged,
}) {
  const [currentId, setCurrentId] = useState(captureId);
  const [navigation, setNavigation] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadNavigation = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const data = await captureService.getNavigation(id, menuId);
      setNavigation(data);
    } catch (err) {
      setError("Impossible de charger cette capture.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNavigation(currentId);
  }, [currentId]);

  const capture = navigation?.current;

  const handleDelete = async () => {
    if (!window.confirm(`Supprimer la capture "${capture.name}" ?`)) return;
    await captureService.remove(capture.id);
    onChanged();
    onClose();
  };

  const handleDownload = async () => {
    const blob = await captureService.download(capture.id);
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${capture.name}.png`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800">Détails de la capture</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {loading && <p className="text-sm text-slate-400">Chargement...</p>}
          {error && <p className="text-sm text-red-600">{error}</p>}

          {capture && (
            <>
              <div className="flex items-center gap-3 mb-3">
                <button
                  disabled={!navigation.hasPrevious}
                  onClick={() => setCurrentId(navigation.previous.id)}
                  className="px-2 py-1 rounded border border-slate-200 disabled:opacity-30"
                  title="Capture précédente"
                >
                  ←
                </button>
                <span className="text-xs text-slate-400">
                  {navigation.currentPosition} / {navigation.totalCaptures}
                </span>
                <button
                  disabled={!navigation.hasNext}
                  onClick={() => setCurrentId(navigation.next.id)}
                  className="px-2 py-1 rounded border border-slate-200 disabled:opacity-30"
                  title="Capture suivante"
                >
                  →
                </button>
              </div>

              <div className="rounded-md border border-slate-200 bg-slate-50 mb-4">
                {capture.imageBase64 && (
                  <img
                    src={`data:image/png;base64,${capture.imageBase64}`}
                    alt={capture.name}
                    className="w-full max-h-96 object-contain"
                  />
                )}
              </div>

              <div className="mb-2">
                <p className="text-sm text-slate-500">
                  Créée le{" "}
                  {capture.dateCreate &&
                    new Date(capture.dateCreate).toLocaleString("fr-FR")}
                </p>
                <p className="text-sm text-slate-700 mt-1 whitespace-pre-wrap">
                  {capture.description || (
                    <span className="text-slate-400 italic">Aucune description.</span>
                  )}
                </p>
              </div>
            </>
          )}
        </div>

        {capture && (
          <div className="flex justify-end gap-2 px-5 py-3 border-t border-slate-100">
            <button
              onClick={handleDelete}
              className="px-4 py-2 rounded-md bg-red-500 text-white hover:bg-red-600"
            >
              Supprimer
            </button>
            <button
              onClick={handleDownload}
              className="px-4 py-2 rounded-md bg-sky-500 text-white hover:bg-sky-600"
            >
              Télécharger
            </button>
            <button
              onClick={() => setShowEditor(true)}
              className="px-4 py-2 rounded-md bg-amber-500 text-white hover:bg-amber-600"
            >
              Modifier
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-md border border-slate-300 text-slate-600 hover:bg-slate-50"
            >
              Fermer
            </button>
          </div>
        )}
      </div>

      {showEditor && capture && (
        <VideoEditorModal
          capture={capture}
          onClose={() => setShowEditor(false)}
          onSaved={() => {
            setShowEditor(false);
            loadNavigation(currentId);
            onChanged();
          }}
        />
      )}
    </div>
  );
}
