import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { menuService } from "../../api/menuService";
import MenuForm from "./MenuForm";

export default function MenuTree({ menu, depth, selectedMenuId, onSelectMenu }) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [addingChild, setAddingChild] = useState(false);
  const queryClient = useQueryClient();

  const { data: subMenus, refetch } = useQuery({
    queryKey: ["menus", "submenus", menu.id],
    queryFn: () => menuService.getSubMenus(menu.id),
    enabled: expanded,
  });

  const isSelected = selectedMenuId === menu.id;

  const invalidateParentList = () => {
    queryClient.invalidateQueries({ queryKey: ["menus"] });
  };

  return (
    <div>
      <div
        className={`group flex items-center gap-1 rounded-md px-2 py-1.5 cursor-pointer transition ${
          isSelected ? "bg-brand-600 text-white" : "hover:bg-slate-50 text-slate-700"
        }`}
        style={{ paddingLeft: 8 + depth * 16 }}
      >
        <button
          onClick={() => setExpanded((e) => !e)}
          className={`w-4 text-xs ${isSelected ? "text-white/80" : "text-slate-400"}`}
          title="Développer / réduire"
        >
          {expanded ? "▾" : "▸"}
        </button>

        <span
          onClick={() => onSelectMenu(menu.id)}
          className="flex-1 text-sm truncate min-w-0"
        >
          {menu.name}
        </span>

        <div className="hidden group-hover:flex items-center gap-1 shrink-0">
          {!(menu.canHaveChildren ?? depth === 0) && (
            <button
              onClick={() => onSelectMenu(menu.id)}
              title="Ouvrir"
              className={`w-5 h-5 rounded flex items-center justify-center text-[10px] shrink-0 ${
                isSelected ? "bg-white/20 text-white" : "bg-emerald-500 text-white"
              }`}
            >
              ▶
            </button>
          )}
          <button
            onClick={() => setEditing(true)}
            title="Éditer"
            className={`w-5 h-5 rounded flex items-center justify-center text-[10px] shrink-0 ${
              isSelected ? "bg-white/20 text-white" : "bg-amber-500 text-white"
            }`}
          >
            ✎
          </button>
          {(menu.canHaveChildren ?? depth === 0) && (
            <button
              onClick={() => {
                setExpanded(true);
                setAddingChild(true);
              }}
              title="Ajouter un sous-menu"
              className={`w-5 h-5 rounded flex items-center justify-center text-[10px] shrink-0 ${
                isSelected ? "bg-white/20 text-white" : "bg-brand-500 text-white"
              }`}
            >
              +
            </button>
          )}
        </div>
      </div>

      {expanded && (
        <div>
          {subMenus?.map((sub) => (
            <MenuTree
              key={sub.id}
              menu={sub}
              depth={depth + 1}
              selectedMenuId={selectedMenuId}
              onSelectMenu={onSelectMenu}
            />
          ))}
        </div>
      )}

      {editing && (
        <MenuForm
          menu={menu}
          moduleId={menu.moduleId}
          parentId={menu.parentId}
          onClose={() => setEditing(false)}
          onSaved={() => {
            setEditing(false);
            invalidateParentList();
          }}
        />
      )}

      {addingChild && (
        <MenuForm
          moduleId={menu.moduleId}
          parentId={menu.id}
          onClose={() => setAddingChild(false)}
          onSaved={() => {
            setAddingChild(false);
            refetch();
          }}
        />
      )}
    </div>
  );
}
