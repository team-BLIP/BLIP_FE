import axios from "axios";

/* if (import.meta.env.DEV) {
  console.log("환경 변수 확인:", {
    VITE_USER_BASE_URL: import.meta.env.VITE_USER_BASE_URL,
    MODE: import.meta.env.MODE,
    DEV: import.meta.env.DEV,
  });
} */

const instance = axios.create({
  baseURL: import.meta.env.VITE_USER_BASE_URL,
});

/* instance.interceptors.request.use(
  (config) => {
    if (import.meta.env.DEV) {
      console.log(
        `Making ${config.method.toUpperCase()} request to: ${config.baseURL}${
          config.url
        }`
      );
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
); */

instance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error("API Error:", {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
    });
    return Promise.reject(error);
  }
);

export { instance };
