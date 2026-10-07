import React from "react";

const ACTIONS = [
  {
    type: "blur",
    label: "Flou",
    description: "Masque une partie de l'image (ex: données sensibles).",
  },
  {
    type: "cursor",
    label: "Curseur statique",
    description: "Ajoute l'image d'un curseur de souris immobile à un endroit précis.",
  },
  {
    type: "cursorWhite",
    label: "Curseur statique blanc",
    description: "Identique au curseur statique, mais en version blanche (fonds sombres).",
  },
  {
    type: "cursorClick",
    label: "Curseur click",
    description: "Montre que la souris a effectué un clic à cet endroit.",
  },
  {
    type: "focus",
    label: "Focus",
    description: "Attire l'attention sur une partie importante de l'image.",
  },
  {
    type: "rectangle",
    label: "Rectangle",
    description: "Dessine un rectangle autour d'un élément à mettre en évidence.",
  },
];

export const POINT_ACTIONS = ["cursor", "cursorWhite", "cursorClick"];

export default function ImageActionToolbar({
  onSelectAction,
  selectedType,
  onUndo,
  onReplaceImage,
  disabled,
}) {
  return (
    <div className="w-56 shrink-0 border-l border-slate-100 pl-4 flex flex-col gap-4">
      <div>
        <h4 className="text-sm font-semibold text-slate-700 mb-2">Actions</h4>
        <div className="flex flex-col gap-2">
          {ACTIONS.map((action) => (
            <button
              key={action.type}
              disabled={disabled}
              onClick={() => onSelectAction(action.type)}
              title={action.description}
              className={`px-3 py-2 rounded-md text-sm hover:bg-slate-800 disabled:opacity-50 text-left ${
                selectedType === action.type
                  ? "bg-brand-600 text-white ring-2 ring-brand-300"
                  : "bg-slate-700 text-white"
              }`}
            >
              {action.label}
            </button>
          ))}
          <button
            disabled={disabled}
            onClick={onUndo}
            className="px-3 py-2 rounded-md bg-slate-200 text-slate-700 text-sm hover:bg-slate-300 disabled:opacity-50 text-left"
          >
            Annuler
          </button>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-slate-700 mb-2">
          Remplacer l'image
        </h4>
        <input
          type="file"
          accept="image/*"
          disabled={disabled}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onReplaceImage(file);
          }}
          className="text-xs w-full"
        />
        <p className="text-xs text-slate-400 mt-1">
          Sélectionnez une nouvelle image si nécessaire.
        </p>
      </div>
    </div>
  );
}
