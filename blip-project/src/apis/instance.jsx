import axios from "axios";

/* export const instance = axios.create({
  baseURL: "http://192.168.1.25:8080", 
  headers: {
    "User-Agent": "Mozilla/5.0",
    "Content-Type": "application/json",
  },
}); */

export const instance = axios.create({
  baseURL: import.meta.env.VITE_USER_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});
