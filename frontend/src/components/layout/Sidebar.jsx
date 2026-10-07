import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { menuService } from "../../api/menuService";
import { useModule } from "../../context/ModuleContext";
import MenuTree from "../menu/MenuTree";
import MenuForm from "../menu/MenuForm";

export default function Sidebar({ selectedMenuId, onSelectMenu }) {
  const [search, setSearch] = useState("");
  const [creatingRootMenu, setCreatingRootMenu] = useState(false);
  const { selectedModule: activeModule } = useModule();

  const {
    data: rootMenus,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["menus", "module", activeModule?.id],
    queryFn: () => menuService.getByModule(activeModule.id),
    enabled: !!activeModule?.id,
  });

  const filteredMenus = useMemo(() => {
    if (!rootMenus) return [];
    if (!search.trim()) return rootMenus;
    return rootMenus.filter((m) =>
      m.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [rootMenus, search]);

  return (
    <aside className="w-72 shrink-0 bg-white border-r border-slate-200 flex flex-col h-full">
      <div className="p-4 border-b border-slate-100">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-slate-800">Menus</h2>
          <button
            onClick={() => setCreatingRootMenu(true)}
            className="text-sm px-3 py-1.5 rounded-md bg-brand-600 text-white hover:bg-brand-700 transition"
          >
            Nouveau menu
          </button>
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un menu..."
          className="w-full text-sm px-3 py-2 rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {isLoading && (
          <p className="text-sm text-slate-400 px-2 py-4">Chargement...</p>
        )}
        {!isLoading && filteredMenus.length === 0 && (
          <p className="text-sm text-slate-400 px-2 py-4">Aucun menu.</p>
        )}
        {filteredMenus.map((menu) => (
          <MenuTree
            key={menu.id}
            menu={menu}
            depth={0}
            selectedMenuId={selectedMenuId}
            onSelectMenu={onSelectMenu}
          />
        ))}
      </div>

      {creatingRootMenu && activeModule && (
        <MenuForm
          moduleId={activeModule.id}
          parentId={null}
          onClose={() => setCreatingRootMenu(false)}
          onSaved={() => {
            setCreatingRootMenu(false);
            refetch();
          }}
        />
      )}
    </aside>
  );
}
