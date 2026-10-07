import axios from "axios";

const axiosClient = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

axiosClient.interceptors.request.use((config) => {
  const raw = localStorage.getItem("capture-app:credentials");
  if (raw) {
    const { username, password } = JSON.parse(raw);
    config.headers["Authorization"] = `Basic ${btoa(`${username}:${password}`)}`;
  }
  return config;
});


axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("capture-app:user");
      localStorage.removeItem("capture-app:credentials");
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
