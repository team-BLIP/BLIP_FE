import axios from "axios";

export const instance = axios.create({
  baseURL: import.meta.env.VITE_USER_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});
