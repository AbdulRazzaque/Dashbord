import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export const getProfile = () => api.get(`/api/auth/me`);

export const registerApi = (data: any) => api.post(`/api/auth/register`, data);

export const updateProfile = (data: any) =>
  api.patch(`/api/auth/`, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });



/* 
  attendance API
*/

export const getTodayAttendance = (
  page: number,
  limit: number,
  search?: string,
  state?: string
) => {
  return api.get(`/api/fetch-today`, {
    params: {
      page,
      limit,
      ...(search ? { search } : {}),
      ...(state ? { state } : {}),
    },
  });
};

export const searchEmployee = (search: string, filter: string) =>
  api.post(`/api/employee/search/?q=${search}&filter=${filter}`);