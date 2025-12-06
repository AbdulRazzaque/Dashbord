import axios, { AxiosError } from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Track ongoing refresh requests to prevent multiple simultaneous refreshes
let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

const onRefreshed = (token: string) => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

const addRefreshSubscriber = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback);
};

// Response interceptor to handle token expiration and refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    // Only retry if it's a 401 error and we haven't already retried this request
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, wait for the refresh to complete
        return new Promise((resolve) => {
          addRefreshSubscriber(() => {
            if (originalRequest.headers) {
              originalRequest.headers["Authorization"] = `Bearer ${api.defaults.headers.common["Authorization"]}`;
            }
            resolve(api(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Call refresh endpoint with refresh token (in cookies)
        const refreshResponse = await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const { accessToken } = refreshResponse.data;

        // Update authorization header for future requests
        api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;

        // Notify all waiting requests
        onRefreshed(accessToken);

        isRefreshing = false;

        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed - user needs to login again
        isRefreshing = false;
        refreshSubscribers = [];

        // Redirect to login or handle logout
        try {
          const { useAuthStore } = await import("@/store");
          useAuthStore.getState().logoutSession();
        } catch {
          // If import fails, just let the error propagate
        }

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);


export const getProfile = () => api.get(`/api/auth/me`);

export const registerApi = (data: any) => api.post(`/api/auth/register`, data);

export const updateProfile = (data: any) =>
  api.patch(`/api/auth/`, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const updateAddress = (data: any) =>
  api.patch(`/api/auth/address`, data);

/* 
  Notifications API
*/
export const getAllNotifications = () => api.get(`/api/notifications`);

export const markNotification = (id: string) =>
  api.patch(`/api/notifications/${id}/read`);

/* 
  Revenue API
*/
export const getRevenue = () => api.get(`/api/revenue`);

/* 
  Search API
*/
export const searchProductsLanding = (query: string) =>
  api.get(`/api/search/products?q=${query}`);

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

export const getTodayAttendanceSummary = (

) => {return api.get(`/api/hours`);
}

export const searchEmployee = (search: string, filter: string) =>
  api.get(`/api/search/dash?q=${search}&filter=${filter}`);

/* 
  Employee API
*/

export const getEmployees = async () => api.get(`/api/employees`);

export const getSingleEmployee = (id: string) => api.get(`/api/singleEmployee/${id}`);

export const isExclude = (id: number) =>
  api.get(`/api/isExclude/${id}`);


/* 
  Delete/CRUD operations
*/
export const deleteUser = (id: string) => api.delete(`/api/users/${id}`);

export const deleteslider = (id: string) => api.delete(`/api/sliders/${id}`);

export const deleteBrand = (id: string) => api.delete(`/api/brands/${id}`);

export const changeLandingStatus = (id: string) =>
  api.patch(`/api/sliders/${id}/status`);

export const deleteSubCategory = (id: string) =>
  api.delete(`/api/subcategories/${id}`);

export const changeSubCategoryStatus = (id: string) =>
  api.patch(`/api/subcategories/${id}/status`);

export const verifyRetailerDetails = (data: { userId: string }) =>
  api.patch(`/api/retailers/verify`, data);

export const changeUserStatus = (id: string) =>
  api.patch(`/api/users/${id}/status`);

export const verifyUser = (data: { userId: string }) =>
  api.patch(`/api/users/verify`, data);
