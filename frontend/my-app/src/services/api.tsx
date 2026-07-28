import axios, {
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";

const BACKEND_URL = "http://localhost:5000/api";

/* -------------------- PUBLIC AXIOS INSTANCE -------------------- */

const api = axios.create({
  baseURL: BACKEND_URL,
  withCredentials: true,
});

export default api;

/* -------------------- PRIVATE AXIOS INSTANCE -------------------- */

export const apiprivate = axios.create({
  baseURL: BACKEND_URL,
  withCredentials: true,
});

/* -------------------- TYPES -------------------- */

interface RefreshResponse {
  accessToken: string;
}

interface RetryAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

type FailedRequest = {
  resolve: (token: string) => void;
  reject: (error: AxiosError | Error) => void;
};

/* -------------------- REFRESH LOGIC -------------------- */

let isRefreshing = false;
let failedQueue: FailedRequest[] = [];

const processQueue = (
  error: AxiosError | Error | null,
  token: string | null = null
) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

const handleLogout = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("user");

  delete apiprivate.defaults.headers.common.Authorization;

  window.dispatchEvent(new CustomEvent("auth:logout"));

  setTimeout(() => {
    if (
      window.location.pathname !== "/" &&
      window.location.pathname !== "/login"
    ) {
      window.location.href = "/login";
    }
  }, 100);
};

/* -------------------- REQUEST INTERCEPTOR -------------------- */

apiprivate.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const accessToken = localStorage.getItem("accessToken");

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

/* -------------------- RESPONSE INTERCEPTOR -------------------- */

apiprivate.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (!error.response) {
      console.error("Network error:", error.message);
      return Promise.reject(error);
    }

    const originalRequest =
      error.config as RetryAxiosRequestConfig;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    const isAuthError =
      error.response.status === 401 ||
      error.response.status === 403;

    const isAuthEndpoint =
      originalRequest.url?.includes("/login") ||
      originalRequest.url?.includes("/auth/access-token") ||
      originalRequest.url?.includes("/auth/refresh") ||
      originalRequest.url?.includes("/auth/generate-token");

    if (
      isAuthError &&
      !originalRequest._retry &&
      !isAuthEndpoint
    ) {
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiprivate(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await apiprivate.get<RefreshResponse>(
          "/auth/generate-token"
        );

        const { accessToken } = response.data;

        if (!accessToken) {
          throw new Error("No access token received from refresh");
        }

        localStorage.setItem("accessToken", accessToken);

        apiprivate.defaults.headers.common.Authorization = `Bearer ${accessToken}`;

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        processQueue(null, accessToken);

        return apiprivate(originalRequest);
      } catch (err) {
        const refreshError =
          err instanceof Error
            ? err
            : new Error("Token refresh failed");

        console.error(refreshError.message);

        processQueue(refreshError, null);

        handleLogout();

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);