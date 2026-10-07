import axiosClient from "./axiosClient";

// Correspond à CaptureController: /api/captures
export const captureService = {
  getByMenu: (menuId) =>
    axiosClient.get(`/captures/menu/${menuId}`).then((res) => res.data),

  getById: (id) => axiosClient.get(`/captures/${id}`).then((res) => res.data),

  getNavigation: (id, menuId) =>
    axiosClient
      .get(`/captures/${id}/navigation`, { params: { menuId } })
      .then((res) => res.data),

  create: (menuId, file, description) => {
    const formData = new FormData();
    formData.append("menuId", menuId);
    formData.append("image", file);
    if (description) formData.append("description", description);

    return axiosClient
      .post("/captures", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((res) => res.data);
  },

  update: (id, name, description) =>
    axiosClient
      .put(`/captures/${id}`, { name, description })
      .then((res) => res.data),

  remove: (id) => axiosClient.delete(`/captures/${id}`),

  removeBulk: (ids) =>
    axiosClient.delete("/captures/bulk", { data: { ids } }),

  download: (id) =>
    axiosClient
      .get(`/captures/${id}/download`, { responseType: "blob" })
      .then((res) => res.data),

    applyAction: (id, type, coords = {}, baseImageBase64) =>
    axiosClient
      .post(`/captures/${id}/actions`, {
        type,
        x: coords.x ?? 0,
        y: coords.y ?? 0,
        width: coords.width ?? 0,
        height: coords.height ?? 0,
        baseImageBase64,
      })
      .then((res) => res.data.imageBase64),

  getOriginal: (id) =>
    axiosClient
      .get(`/captures/${id}/original`)
      .then((res) => res.data.imageBase64),

 
  saveImage: (id, imageBase64, clickPosition) =>
    axiosClient
      .put(`/captures/${id}/save-image`, {
        imageBase64,
        clickX: clickPosition?.x ?? null,
        clickY: clickPosition?.y ?? null,
      })
      .then((res) => res.data),

  replaceImage: (id, file) => {
    const formData = new FormData();
    formData.append("image", file);
    return axiosClient
      .put(`/captures/${id}/replace-image`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((res) => res.data);
  },

  move: (id, direction) =>
    axiosClient
      .put(`/captures/${id}/move`, null, { params: { direction } })
      .then((res) => res.data),
};
