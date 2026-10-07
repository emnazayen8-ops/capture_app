import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { captureService } from "../../api/captureService";
import { videoService } from "../../api/videoService";
import { menuService } from "../../api/menuService";
import CaptureCard from "./CaptureCard";
import CaptureUploadModal from "./CaptureUploadModal";
import CaptureDetailsModal from "./CaptureDetailsModal";
import VideoWorkspaceModal from "../video/VideoWorkspaceModal";

export default function CaptureGrid({ menuId }) {
  const queryClient = useQueryClient();
  const [selectedIds, setSelectedIds] = useState([]);
  const [showUpload, setShowUpload] = useState(false);
  const [openCaptureId, setOpenCaptureId] = useState(null);
  const [videoBusy, setVideoBusy] = useState(false);
  const [showVideoWorkspace, setShowVideoWorkspace] = useState(false);

  const { data: menu, isLoading: menuLoading } = useQuery({
    queryKey: ["menus", "detail", menuId],
    queryFn: () => menuService.getById(menuId),
    enabled: !!menuId,
  });

  const isLeafMenu = !!menu && !menu.hasChildren;

  const {
    data: captures,
    isLoading,
    refetch: refetchCaptures,
  } = useQuery({
    queryKey: ["captures", "menu", menuId],
    queryFn: () => captureService.getByMenu(menuId),
    enabled: !!menuId && isLeafMenu,
  });

  const { data: video, refetch: refetchVideo } = useQuery({
    queryKey: ["videos", "menu", menuId],
    queryFn: () => videoService.getByMenu(menuId),
    enabled: !!menuId && isLeafMenu,
  });

  const invalidateAll = () => {
    refetchCaptures();
    refetchVideo();
    queryClient.invalidateQueries({ queryKey: ["menus"] });
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Supprimer ${selectedIds.length} capture(s) ?`)) return;
    await captureService.removeBulk(selectedIds);
    setSelectedIds([]);
    invalidateAll();
  };

  const handleMove = async (captureId, direction) => {
    await captureService.move(captureId, direction);
    refetchCaptures();
  };

  const handleGenerateVideo = () => {
    setShowVideoWorkspace(true);
  };

  const handleDeleteVideo = async () => {
    if (!window.confirm("Supprimer définitivement cette vidéo ?")) return;
    setVideoBusy(true);
    try {
      await videoService.remove(menuId);
      invalidateAll();
    } finally {
      setVideoBusy(false);
    }
  };

  const handleWatchVideo = async () => {
    const blob = await videoService.download(menuId);
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  };

  if (!menuId) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
        Sélectionnez un menu dans la liste à gauche.
      </div>
    );
  }

  if (menuLoading) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
        Chargement...
      </div>
    );
  }

  if (!isLeafMenu) {
    return (
      <div className="flex-1 overflow-y-auto p-6">
        <h2 className="text-lg font-bold text-slate-800 mb-2">{menu?.name}</h2>
        <p className="text-sm text-slate-400">
          Ce menu contient des sous-menus. Sélectionnez un sous-menu dans la
          liste à gauche pour voir ou ajouter ses captures.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex gap-2">
          <button
            onClick={() => setShowUpload(true)}
            className="px-4 py-2 rounded-md bg-brand-600 text-white text-sm hover:bg-brand-700"
          >
            Ajouter une capture
          </button>
          <button
            onClick={handleDeleteSelected}
            disabled={selectedIds.length === 0}
            className="px-4 py-2 rounded-md bg-red-400 text-white text-sm hover:bg-red-500 disabled:opacity-50"
          >
            Supprimer sélectionnés
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleGenerateVideo}
            disabled={videoBusy || !captures?.length || video?.exists}
            title={
              video?.exists
                ? "Une vidéo existe déjà : dévalidez-la (suppression) d'abord pour en régénérer une nouvelle."
                : "Génère la vidéo à partir des captures de ce menu."
            }
            className="px-4 py-2 rounded-md bg-sky-500 text-white text-sm hover:bg-sky-600 disabled:opacity-50"
          >
            Générer la vidéo
          </button>
          <button
            onClick={handleDeleteVideo}
            disabled={videoBusy || !video?.exists}
            title="Supprime définitivement la vidéo générée."
            className="px-4 py-2 rounded-md bg-red-500 text-white text-sm hover:bg-red-600 disabled:opacity-50"
          >
            dévalider la vidéo
          </button>
          {video?.hasData && (
            <button
              onClick={handleWatchVideo}
              title="Ouvre la vidéo générée dans un nouvel onglet."
              className="px-4 py-2 rounded-md border border-slate-300 text-slate-600 text-sm hover:bg-slate-50"
            >
              Voir la vidéo
            </button>
          )}
        </div>
      </div>

      <h2 className="text-lg font-bold text-slate-800 mb-4">{menu?.name}</h2>

      {isLoading && <p className="text-sm text-slate-400">Chargement...</p>}
      {!isLoading && captures?.length === 0 && (
        <p className="text-sm text-slate-400">
          Aucune capture pour ce menu. Cliquez sur "Ajouter une capture" pour commencer.
        </p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {captures?.map((capture, index) => (
          <CaptureCard
            key={capture.id}
            capture={capture}
            selected={selectedIds.includes(capture.id)}
            onToggleSelect={toggleSelect}
            onOpen={(c) => setOpenCaptureId(c.id)}
            onMove={handleMove}
            isFirst={index === 0}
            isLast={index === captures.length - 1}
          />
        ))}
      </div>

      {showUpload && (
        <CaptureUploadModal
          menuId={menuId}
          onClose={() => setShowUpload(false)}
          onUploaded={() => {
            setShowUpload(false);
            invalidateAll();
          }}
        />
      )}

      {openCaptureId && (
        <CaptureDetailsModal
          captureId={openCaptureId}
          menuId={menuId}
          onClose={() => setOpenCaptureId(null)}
          onChanged={invalidateAll}
        />
      )}

      {showVideoWorkspace && (
        <VideoWorkspaceModal
          menuId={menuId}
          onClose={() => setShowVideoWorkspace(false)}
          onSaved={() => {
            setShowVideoWorkspace(false);
            invalidateAll();
          }}
        />
      )}
    </div>
  );
}
