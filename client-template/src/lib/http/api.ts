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

export const retailerDetailsAPI = (data: any) =>
  api.post(`/api/auth/retailer-details`, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const updateAddress = (data: any) =>
  api.patch(`/api/auth/add-address`, data);

export const getUsersByForDashboard = () => api.get(`/api/auth/all`);

export const searchUserDash = (search: string) =>
  api.get(`/api/auth/search/dash?q=${search}`);

export const getCategories = () => api.get(`/api/category`);

export const getCategoriesAdmin = () => api.get(`/api/category/admin/all`);

export const getCategoryById = (id: string) => api.get(`/api/category/${id}`);

export const deleteCategory = (id: string) =>
  api.get(`/api/category/delete/${id}`);

export const creatCategory = (data: any) =>
  api.post(`/api/category`, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const updateCategory = (data: any, id: string) =>
  api.patch(`/api/category/${id}`, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const changeCategoryStatus = (id: string) =>
  api.get(`/api/category/change-status/${id}`);

export const getSubCategories = (id?: string | number) => {
  const url = id ? `/api/sub-category?id=${id}` : "/api/sub-category";
  return api.get(url);
};

export const getSubCategoriesAdmin = (id?: string | number) => {
  const url = id ? `/api/sub-category?id=${id}` : "/api/sub-category/admin/all";
  return api.get(url);
};

export const creatSubCategory = (data: any) =>
  api.post(`/api/sub-category`, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const updateSubCategory = (data: any, id: string) =>
  api.patch(`/api/sub-category/${id}`, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const getSubCategoryById = (id: string) =>
  api.get(`/api/sub-category/${id}`);

export const deleteSubCategory = (id: string) =>
  api.get(`/api/sub-category/delete/${id}`);

export const changeSubCategoryStatus = (id: string) =>
  api.get(`/api/sub-category/change-status/${id}`);

export const createProduct = (data: any) =>
  api.post(`/api/product`, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const getProducts = () => api.get(`/api/product`);

export const searchProductsForOrder = (search: string) =>
  api.get(`/api/product/search/order?q=${search}`);

export const getProductsWithPadination = (page = 1, limit = 20) => {
  return api.get(`/api/product/pagination/user?page=${page}&limit=${limit}`);
};

export const getProductsDash = (page: number, rowsPerPage: number) =>
  api.get(`/api/product/pagination?page=${page}&limit=${rowsPerPage}`);

export const searchProducts = (search: string, filter: string) =>
  api.get(`/api/product/search/dash?q=${search}&filter=${filter}`);

export const searchProductsLanding = (search: string) =>
  api.post(`/api/product/search-landing?q=${search}`);

export const getFeatureProducts = () => api.get(`/api/product/feature`);

export const getProductsByCategory = (id: string) =>
  api.post(`/api/product/category?id=${id}`);

export const getAdminProducts = () => api.post(`/api/product/all`);

export const getProductById = (id: string) => api.get(`/api/product/${id}`);

export const updateProduct = (data: any, id: string) =>
  api.patch(`/api/product/${id}`, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const deleteProduct = (id: string) =>
  api.get(`/api/product/delete/${id}`);

export const approvedProduct = (id: string) =>
  api.get(`/api/product/approved/${id}`);

export const changeProductStatus = (id: string) =>
  api.get(`/api/product/change-status/${id}`);

// Draft APIs
export const getProductDraft = (id: string) =>
  api.get(`/api/product/${id}/draft`);
export const saveProductDraft = (id: string, data: any) =>
  api.post(`/api/product/${id}/draft`, data);
export const publishProductDraft = (id: string) =>
  api.post(`/api/product/${id}/draft/publish`);

export const getVendors = () => api.get(`/api/vendor`);

export const addVendors = (data: any) => api.post(`/api/vendor`, data);

export const deleteVendor = (id: string) =>
  api.post(`/api/vendor/delete/${id}`);

export const changeVendorStatus = (id: string) =>
  api.get(`/api/vendor/change-status/${id}`);

export const getVendorById = (id: string) => api.get(`/api/vendor/${id}`);

export const updateVendor = (data: any, id: string) =>
  api.patch(`/api/vendor/${id}`, data);

export const getTransectionsAPi = (status: string) =>
  api.get(`/api/payment?status=${status}`);

export const createRefund = (data: any) =>
  api.post(`/api/payment/refund`, data);

export const getReturn = () => api.get(`/api/order/return/get`);

export const changeReturnOrderStatus = (data: any) =>
  api.post(`/api/order/return/status`, data);

export const createReturn = (data: any) =>
  api.post(`/api/order/return/request`, data);

export const createOrder = (data: any) => api.post(`/api/order`, data);

export const createOrderUser = (data: any, idempotencyKey: string) =>
  api.post(`/api/order/user-landing`, data, {
    headers: {
      "Idempotency-Key": idempotencyKey,
    },
  });

export const getAllOrders = (status?: string) =>
  api.get(status ? `/api/order?status=${status}` : `/api/order`);

export const getOrderById = (id: string) => api.get(`/api/order/${id}`);

export const assignDeliveryPerson = (data: any) =>
  api.post(`/api/order/assign/delivery`, data);

export const addOrderNote = (data: any) =>
  api.post(`/api/order/add-note`, data);

export const getOrdersCount = (data: any) =>
  api.post(`/api/order/dash/counts`, data);

export const requestDeliveryPerson = (data: any) =>
  api.post(`/api/order/vendor/request`, data);

export const getRevenue = () => api.get(`/api/order/dash/revenue`);

export const updateOrder = (data: any, id: string) =>
  api.patch(`/api/order/${id}`, data);

export const changeOrderStatus = (data: { orderId: string; status: string }) =>
  api.post(`/api/order/${data.orderId}`, data);

export const getRecentOrders = () => api.get(`/api/order/dash/recent-orders`);

export const getdeliveryPersons = () => api.get(`/api/delivery`);

export const addDeliveryPerson = (data: any) => api.post(`/api/delivery`, data);

export const changeDeliveryStatus = (id: string) =>
  api.get(`/api/delivery/change-status/${id}`);

export const deleteDelivery = (id: any) =>
  api.get(`/api/delivery/delete/${id}`);

export const getDeliveryById = (id: string) => api.get(`/api/delivery/${id}`);

export const getDeliveryBoyDetails = (id: string) =>
  api.get(`/api/delivery/detail/${id}`);

export const updateDelivery = (data: any, id: string) =>
  api.patch(`/api/delivery/${id}`, data);

export const getBrands = () => api.get(`/api/brand`);

export const changeBrandStatus = (id: string) =>
  api.get(`/api/brand/change-status/${id}`);

export const creatBrand = (data: any) =>
  api.post(`/api/brand`, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const getBrandById = (id: string) => api.get(`/api/brand/${id}`);

export const deleteBrand = (id: string) => api.get(`/api/brand/delete/${id}`);

export const updateBrand = (data: any, id: string) =>
  api.patch(`/api/brand/${id}`, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const createAttribute = (data: any) => api.post(`/api/attribute`, data);

export const getAttributes = () => api.get(`/api/attribute`);

export const getAttributeById = (id: string) => api.get(`/api/attribute/${id}`);

export const updateAttribute = (data: any, id: string) =>
  api.patch(`/api/attribute/${id}`, data);

export const deleteAttribute = (id: string) =>
  api.get(`/api/attribute/delete/${id}`);

export const createLocation = (data: any) => api.post(`/api/location`, data);

export const getLocations = (id?: string) =>
  api.get(id ? `/api/location?id=${id}` : "/api/location");

export const getLocationById = (id: string) => api.get(`/api/location/${id}`);

export const updateLocation = (data: any, id: string) =>
  api.patch(`/api/location/${id}`, data);

export const deleteLocation = (id: string) =>
  api.get(`/api/location/delete/${id}`);

export const getUsers = (role?: string) => api.get(`/api/user`);

export const getUsersRetailer = (
  roles?: string,
  page = 1,
  pageSize = 10,
  search?: string
) => {
  let url = `/api/user/user-retailer?page=${page}&pageSize=${pageSize}`;
  if (roles) {
    url += `&roles=${roles}`;
  }
  if (search && search.trim()) {
    url += `&search=${encodeURIComponent(search.trim())}`;
  }
  return api.get(url);
};

export const getRetailerDetails = () =>
  api.get(`/api/user/get-retailer/details`);

export const addUser = (data: any) => api.post(`/api/user`, data);

export const verifyUser = (data: any) => api.post(`/api/user/verify`, data);

export const verifyRetailerDetails = (data: any) =>
  api.post(`/api/user//verify-retailer/details`, data);

export const changeUserStatus = (id: string) =>
  api.get(`/api/user/change-status/${id}`);

export const deleteUser = (id: any) => api.get(`/api/user/delete/${id}`);

export const getUserById = (id: string) => api.get(`/api/user/${id}`);

export const updateUser = (data: any, id: string) =>
  api.patch(`/api/user/${id}`, data);

export const addSlider = (data: any) =>
  api.post(`/api/landing`, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const updateSlider = (data: any, id: string) =>
  api.patch(`/api/landing/${id}`, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const getSliders = (data: any) => api.post(`/api/landing/all`, data);

export const getActiveSliders = (data: any) =>
  api.post(`/api/landing/active`, data);

export const getActiveBanner = (data: any) =>
  api.post(`/api/landing/active/banner`, data);

export const deleteslider = (id: any) => api.get(`/api/landing/delete/${id}`);

export const getSlidersById = (id: string) => api.get(`/api/landing/${id}`);

export const changeLandingStatus = (id: string) =>
  api.get(`/api/landing/change-status/${id}`);

export const getAllNotifications = () => api.get(`/api/notification`);

export const markNotification = (data: any) =>
  api.post(`/api/notification/mark`, data);

// Settings import/export
export const exportSettings = () => {
  // return a full response so caller can trigger file download
  return api.get(`/api/settings/export`, { responseType: "blob" });
};

export const importSettings = (payload: any[]) => {
  return api.post(`/api/settings/import`, payload);
};

// Product versions
export const getProductVersions = (productId: string) =>
  api.get(`/api/product/${productId}/versions`);
export const rollbackProductVersion = (productId: string, versionId: string) =>
  api.post(`/api/product/${productId}/versions/${versionId}/rollback`);

// Audit APIs
export const listAudit = (params: {
  entityType?: string;
  entityId?: string;
  userId?: string;
  action?: string;
  page?: number;
  limit?: number;
}) => {
  const query = new URLSearchParams();
  if (params.entityType) query.set("entityType", params.entityType);
  if (params.entityId) query.set("entityId", params.entityId);
  if (params.userId) query.set("userId", params.userId);
  if (params.action) query.set("action", params.action);
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  const qs = query.toString();
  return api.get(`/api/audit${qs ? `?${qs}` : ""}`);
};

export const exportAudit = (params: {
  entityType?: string;
  entityId?: string;
  userId?: string;
  action?: string;
}) => {
  const query = new URLSearchParams();
  if (params.entityType) query.set("entityType", params.entityType);
  if (params.entityId) query.set("entityId", params.entityId);
  if (params.userId) query.set("userId", params.userId);
  if (params.action) query.set("action", params.action);
  const qs = query.toString();
  return api.get(`/api/audit/export${qs ? `?${qs}` : ""}`, {
    responseType: "blob",
  });
};
