import api from "./api";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

export interface AuthResponse {
  accessToken: string;
  user: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
}

export const loginApi = (data: LoginRequest) => {
  return api.post<AuthResponse>("/auth/login", data);
};

export const registerApi = (data: RegisterRequest) => {
  return api.post("/auth/register", data);
};

export const verifyotpApi = (data: VerifyOtpRequest) => {
  return api.post("/auth/verify-otp", data);
};

export const logoutApi = () => {
  return api.post("/auth/logout");
};