import api from './axios';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
}

export const login = async (
  data: LoginRequest,
): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>(
    '/auth/login',
    data,
  );

  return response.data;
};

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt?: string;
  updatedAt?: string;
}

export const register = async (
  data: RegisterRequest,
): Promise<RegisterResponse> => {
  const response = await api.post<RegisterResponse>(
    '/auth/register',
    data,
  );

  return response.data;
};