import axiosClient from "./axiosClient";

// Correspond à VideoController: /api/videos
export const videoService = {
  getByMenu: (menuId) =>
    axiosClient.get(`/videos/menu/${menuId}`).then((res) => res.data),

    generate: (menuId) =>
    axiosClient.post(`/videos/generate/${menuId}`).then((res) => res.data),

  savePreview: (menuId) =>
    axiosClient.post(`/videos/menu/${menuId}/save-preview`).then((res) => res.data),

  validate: (menuId, isValidated) =>
    axiosClient
      .post("/videos/validate", { menuId, isValidated })
      .then((res) => res.data),

  remove: (menuId) => axiosClient.delete(`/videos/menu/${menuId}`),

  download: (menuId) =>
    axiosClient
      .get(`/videos/menu/${menuId}/download`, { responseType: "blob" })
      .then((res) => res.data),
};
