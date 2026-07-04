import API from "./axios.js";

export const togglePartnerAvailability = (is_active) => {
  return API.patch("/partner/toggle-availability", { is_active });
};

export const getDashboardStats = () => {
  return API.get("/partner/dashboard-stats");
};

export const getNewAssignments = () => {
  return API.get("/partner/new-assignments");
};

export const acceptOrder = (order_id) => {
  return API.patch("/partner/accept-order", { order_id });
};

export const getCurrentOrderDetails = () => {
  return API.get("/partner/current-order");
};

export const updateOrderStatus = (order_id, status) => {
  return API.patch("/partner/update-order-status", {
    order_id,
    status,
  });
};

export const getDeliveryHistory = () => {
  return API.get("/partner/delivery-history");
};