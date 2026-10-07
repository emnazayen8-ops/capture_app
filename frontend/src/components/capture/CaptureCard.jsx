import React from "react";

export default function CaptureCard({
  capture,
  selected,
  onToggleSelect,
  onOpen,
  onMove,
  isFirst,
  isLast,
}) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden hover:shadow-md transition">
      <div className="relative">
        <input
          type="checkbox"
          checked={selected}
          onChange={(e) => {
            e.stopPropagation();
            onToggleSelect(capture.id);
          }}
          className="absolute top-2 left-2 w-4 h-4 accent-brand-600 z-10"
        />
        <button
          onClick={() => onOpen(capture)}
          className="block w-full aspect-video bg-slate-100"
          title="Voir les détails"
        >
          {capture.imageBase64 ? (
            <img
              src={`data:image/png;base64,${capture.imageBase64}`}
              alt={capture.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-300 text-xs">
              Aucun aperçu
            </div>
          )}
        </button>
      </div>

      <div className="flex items-center justify-between px-2 py-1.5 border-t border-slate-100">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onMove(capture.id, "left");
          }}
          disabled={isFirst}
          title="Déplacer vers la gauche"
          className="w-7 h-7 flex items-center justify-center rounded border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          ←
        </button>
        <button
          onClick={() => onOpen(capture)}
          className="flex-1 text-center text-sm text-slate-700 truncate hover:text-brand-700 px-2"
        >
          {capture.name}
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onMove(capture.id, "right");
          }}
          disabled={isLast}
          title="Déplacer vers la droite"
          className="w-7 h-7 flex items-center justify-center rounded border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          →
        </button>
      </div>
    </div>
  );
}
