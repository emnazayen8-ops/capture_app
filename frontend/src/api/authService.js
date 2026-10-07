import axiosClient from "./axiosClient";

export const authService = {
  register: (username, password) =>
    axiosClient
      .post("/auth/register", { username, password })
      .then((res) => res.data),

  login: (username, password) =>
    axiosClient
      .post("/auth/login", { username, password })
      .then((res) => res.data),
};
