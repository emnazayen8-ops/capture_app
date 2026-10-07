import axiosClient from "./axiosClient";

// Correspond à ModuleController: /api/modules
export const moduleService = {
  getAll: () => axiosClient.get("/modules").then((res) => res.data),
  getById: (id) => axiosClient.get(`/modules/${id}`).then((res) => res.data),
};
