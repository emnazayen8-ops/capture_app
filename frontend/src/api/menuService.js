import axiosClient from "./axiosClient";

// Correspond à MenuController: /api/menus
export const menuService = {
  getByModule: (moduleId) =>
    axiosClient.get(`/menus/module/${moduleId}`).then((res) => res.data),

  getSubMenus: (menuId) =>
    axiosClient.get(`/menus/${menuId}/submenus`).then((res) => res.data),

  getById: (id) => axiosClient.get(`/menus/${id}`).then((res) => res.data),

  create: (payload) =>
    axiosClient.post("/menus", payload).then((res) => res.data),

  update: (id, payload) =>
    axiosClient.put(`/menus/${id}`, payload).then((res) => res.data),

  remove: (id) => axiosClient.delete(`/menus/${id}`),
};
