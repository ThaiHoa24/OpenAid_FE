import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { tokenStorage } from "./tokenStorage";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Attach JWT Bearer token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenStorage.get();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Unwrap BE TransformInterceptor format and standardize errors
apiClient.interceptors.response.use(
  (response) => {
    // BE TransformInterceptor wraps response into { success: true, statusCode: 200, data: ..., timestamp: ... }
    if (
      response.data &&
      typeof response.data === "object" &&
      "success" in response.data &&
      "data" in response.data
    ) {
      return response.data.data;
    }
    return response.data;
  },
  (error: AxiosError<{ success?: boolean; message?: string | string[]; statusCode?: number }>) => {
    let errorMessage = "Đã có lỗi xảy ra. Vui lòng thử lại.";

    if (error.code === "ERR_NETWORK" || error.message?.includes("Network Error")) {
      errorMessage = `Không thể kết nối đến máy chủ Backend (${API_BASE_URL}). Vui lòng đảm bảo Backend đang chạy.`;
    } else if (error.response?.data?.message) {
      const msg = error.response.data.message;
      if (Array.isArray(msg)) {
        errorMessage = msg.join("; ");
      } else if (typeof msg === "string") {
        errorMessage = msg;
      }
    } else if (error.message) {
      errorMessage = error.message;
    }

    // Auto-clear invalid token on 401 Unauthorized
    if (error.response?.status === 401) {
      tokenStorage.clear();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("openaid-auth-changed"));
      }
    }

    return Promise.reject(new Error(errorMessage));
  }
);

export default apiClient;
