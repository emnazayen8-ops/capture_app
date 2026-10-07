import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useModule } from "../../context/ModuleContext";

export default function TopBar() {
  const { user, logout } = useAuth();
  const { selectedModule, clearModule } = useModule();
  const navigate = useNavigate();

  const handleLogout = () => {
    clearModule();
    logout();
  };

  const handleChangeModule = () => {
    clearModule();
    navigate("/modules");
  };

  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 shrink-0">
      <div className="flex items-center gap-3">
        <span className="font-semibold text-slate-700">Capture App</span>
        {selectedModule && (
          <span className="text-xs px-2 py-1 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
            {selectedModule.name}
          </span>
        )}
      </div>
      <div className="flex items-center gap-3 text-sm">
        <span className="text-slate-500">
          Connecté en tant que <span className="font-medium text-slate-700">{user?.username}</span>
        </span>
        <button
          onClick={handleChangeModule}
          className="px-3 py-1.5 rounded-md border border-slate-300 text-slate-600 hover:bg-slate-50 transition"
        >
          Changer de module
        </button>
        <button
          onClick={handleLogout}
          className="px-3 py-1.5 rounded-md border border-slate-300 text-slate-600 hover:bg-slate-50 transition"
        >
          Déconnexion
        </button>
      </div>
    </header>
  );
}
