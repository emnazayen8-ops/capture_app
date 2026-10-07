import React, { useRef, useState } from "react";
import { captureService } from "../../api/captureService";
import ImageActionToolbar, { POINT_ACTIONS } from "./ImageActionToolbar";

const DESCRIPTION_SOFT_LIMIT = 500;

export default function VideoEditorModal({ capture, onClose, onSaved }) {
  const [imageBase64, setImageBase64] = useState(capture.imageBase64);
  const [description, setDescription] = useState(capture.description || "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [clickPosition, setClickPosition] = useState(null);

  const [pendingType, setPendingType] = useState(null);
  const [dragStart, setDragStart] = useState(null);
  const [dragCurrent, setDragCurrent] = useState(null);

  const imgRef = useRef(null);

  const runAction = async (type, coords) => {
    setBusy(true);
    setError(null);
    try {
      const preview = await captureService.applyAction(capture.id, type, coords, imageBase64);
      setImageBase64(preview);
      setClickPosition(type === "cursorClick" ? { x: coords.x, y: coords.y } : null);
    } catch (err) {
      setError("L'action n'a pas pu être appliquée.");
    } finally {
      setBusy(false);
      setPendingType(null);
      setDragStart(null);
      setDragCurrent(null);
    }
  };

  const toImageCoords = (clientX, clientY) => {
    const img = imgRef.current;
    if (!img) return { x: 0, y: 0 };
    const rect = img.getBoundingClientRect();
    const scaleX = img.naturalWidth / rect.width;
    const scaleY = img.naturalHeight / rect.height;
    const x = Math.round((clientX - rect.left) * scaleX);
    const y = Math.round((clientY - rect.top) * scaleY);
    return {
      x: Math.max(0, Math.min(x, img.naturalWidth)),
      y: Math.max(0, Math.min(y, img.naturalHeight)),
    };
  };

  const handleImageMouseDown = (e) => {
    if (!pendingType) return;
    const point = toImageCoords(e.clientX, e.clientY);
    setDragStart(point);
    setDragCurrent(point);
  };

  const handleImageMouseMove = (e) => {
    if (!pendingType || !dragStart) return;
    setDragCurrent(toImageCoords(e.clientX, e.clientY));
  };

  const handleImageMouseUp = () => {
    if (!pendingType || !dragStart || !dragCurrent) return;

    if (POINT_ACTIONS.includes(pendingType)) {
      runAction(pendingType, { x: dragStart.x, y: dragStart.y });
      return;
    }

    const x = Math.min(dragStart.x, dragCurrent.x);
    const y = Math.min(dragStart.y, dragCurrent.y);
    const width = Math.abs(dragCurrent.x - dragStart.x);
    const height = Math.abs(dragCurrent.y - dragStart.y);

    if (width < 5 || height < 5) {
      setError("Sélectionnez une zone plus grande (cliquez-glissez sur l'image).");
      setDragStart(null);
      setDragCurrent(null);
      return;
    }

    runAction(pendingType, { x, y, width, height });
  };

  const handleUndo = async () => {
    setBusy(true);
    setError(null);
    setPendingType(null);
    setClickPosition(null);
    try {
      const original = await captureService.getOriginal(capture.id);
      setImageBase64(original);
    } finally {
      setBusy(false);
    }
  };

  const handleReplaceImage = async (file) => {
    setBusy(true);
    setError(null);
    setClickPosition(null);
    try {
      const updated = await captureService.replaceImage(capture.id, file);
      setImageBase64(updated.imageBase64);
    } catch (err) {
      setError("Le remplacement de l'image a échoué.");
    } finally {
      setBusy(false);
    }
  };

  const handleSave = async () => {
    setBusy(true);
    setError(null);
    try {
      await captureService.saveImage(capture.id, imageBase64, clickPosition);
      await captureService.update(capture.id, capture.name, description);
      onSaved();
    } catch (err) {
      setError("La sauvegarde a échoué.");
    } finally {
      setBusy(false);
    }
  };

  const selectionStyle = (() => {
    if (!dragStart || !dragCurrent || !imgRef.current) return null;
    if (POINT_ACTIONS.includes(pendingType)) return null;
    const img = imgRef.current;
    const rect = img.getBoundingClientRect();
    const containerRect = img.parentElement.getBoundingClientRect();
    const offsetLeft = rect.left - containerRect.left;
    const offsetTop = rect.top - containerRect.top;
    const scaleX = rect.width / img.naturalWidth;
    const scaleY = rect.height / img.naturalHeight;
    return {
      left: offsetLeft + Math.min(dragStart.x, dragCurrent.x) * scaleX,
      top: offsetTop + Math.min(dragStart.y, dragCurrent.y) * scaleY,
      width: Math.abs(dragCurrent.x - dragStart.x) * scaleX,
      height: Math.abs(dragCurrent.y - dragStart.y) * scaleY,
    };
  })();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800">Modifier la capture</h3>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={busy}
              className="px-4 py-2 rounded-md bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-60"
            >
              Sauvegarder
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-md border border-slate-300 text-slate-600 hover:bg-slate-50"
            >
              Fermer
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 flex gap-4">
          <div className="flex-1 min-w-0">
            {pendingType && (
              <p className="text-sm text-brand-700 bg-brand-50 border border-brand-200 rounded-md px-3 py-2 mb-2">
                {POINT_ACTIONS.includes(pendingType)
                  ? "Cliquez sur l'image à l'endroit où placer l'élément."
                  : "Cliquez-glissez sur l'image pour sélectionner la zone concernée."}
                <button
                  onClick={() => {
                    setPendingType(null);
                    setDragStart(null);
                    setDragCurrent(null);
                  }}
                  className="ml-3 underline"
                >
                  Annuler la sélection
                </button>
              </p>
            )}

            <div
              className="relative rounded-md border border-slate-200 bg-slate-50 flex items-center justify-center min-h-[20rem] select-none"
              style={{ cursor: pendingType ? "crosshair" : "default" }}
              onMouseDown={handleImageMouseDown}
              onMouseMove={handleImageMouseMove}
              onMouseUp={handleImageMouseUp}
            >
              {imageBase64 ? (
                <img
                  ref={imgRef}
                  src={`data:image/png;base64,${imageBase64}`}
                  alt={capture.name}
                  draggable={false}
                  className="max-w-full max-h-[28rem] object-contain"
                />
              ) : (
                <p className="text-sm text-slate-400">Chargement de l'image...</p>
              )}
              {selectionStyle && (
                <div
                  className="absolute border-2 border-brand-600 bg-brand-500/20 pointer-events-none"
                  style={selectionStyle}
                />
              )}
            </div>

            <div className="mt-3">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Ce texte sera lu à voix haute (voix de synthèse) pendant cette étape de la vidéo générée."
                className="w-full px-3 py-2 rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
              />
              <p className="text-xs text-slate-400 mt-1">
                Ce texte sera lu automatiquement par une voix de synthèse lors
                de la génération de la vidéo.
              </p>
              {description.length > DESCRIPTION_SOFT_LIMIT && (
                <p className="text-xs text-amber-600 mt-1">
                  Description assez longue : la narration de cette étape sera longue.
                </p>
              )}
            </div>

            {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
          </div>

          <ImageActionToolbar
            onSelectAction={setPendingType}
            selectedType={pendingType}
            onUndo={handleUndo}
            onReplaceImage={handleReplaceImage}
            disabled={busy}
          />
        </div>
      </div>
    </div>
  );
}
