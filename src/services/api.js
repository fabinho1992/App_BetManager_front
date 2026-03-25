import axios from "axios";
import { toast } from "react-hot-toast";

let logoutExecutado = false;

const api = axios.create({
  //baseURL: "https://apigest-obet.onrender.com"
  baseURL:"https://localhost:7243"
});

api.interceptors.request.use(config => {

  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;

});

api.interceptors.response.use(
  response => response,
  error => {

    if (error.response?.status === 401 && !logoutExecutado) {

      logoutExecutado = true;

      toast.error("Sessão expirada, faça login novamente");

      localStorage.removeItem("token");

      setTimeout(() => {
        window.location.href = "/";
      }, 2500);

    }

    return Promise.reject(error);
  }
);

export default api;