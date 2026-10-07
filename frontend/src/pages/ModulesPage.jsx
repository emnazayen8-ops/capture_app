import React from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { moduleService } from "../api/moduleService";
import { useAuth } from "../context/AuthContext";
import { useModule } from "../context/ModuleContext";

const MODULE_ICONS = ["🗂️", "🩺", "📋", "⚙️"];

export default function ModulesPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { selectModule } = useModule();

  const { data: modules, isLoading, error } = useQuery({
    queryKey: ["modules"],
    queryFn: moduleService.getAll,
  });

  const handleChoose = (module) => {
    selectModule(module);
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-3xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-slate-800">Choisissez un module</h1>
            <p className="text-sm text-slate-500">
              Connecté en tant que{" "}
              <span className="font-medium text-slate-700">{user?.username}</span>
            </p>
          </div>
          <button
            onClick={logout}
            className="px-3 py-1.5 rounded-md border border-slate-300 text-slate-600 hover:bg-slate-50 transition text-sm"
          >
            Déconnexion
          </button>
        </div>

        {isLoading && <p className="text-sm text-slate-400">Chargement des modules...</p>}
        {error && (
          <p className="text-sm text-red-600">
            Impossible de charger la liste des modules.
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {modules?.map((module, index) => (
            <button
              key={module.id}
              onClick={() => handleChoose(module)}
              className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 flex flex-col items-center gap-3 hover:border-brand-500 hover:shadow-md transition text-center"
            >
              <span className="text-4xl">
                {MODULE_ICONS[index % MODULE_ICONS.length]}
              </span>
              <span className="font-semibold text-slate-800">{module.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
