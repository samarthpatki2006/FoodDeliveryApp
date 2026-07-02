import API from "./axios.js";

export const getUserCount = () => {
  return API.get("/admin/get-user-count");
};

export const getTotalRestaurants = () => {
  return API.get("/admin/get-total-restaurants");
};

export const getTotalRestaurantRevenue = () => {
  return API.get("/admin/get-total-restaurant-revenue");
};

export const getRevenueSummary = () => {
  return API.get("/admin/get-revenue-summary");
};

export const getOrderStatuses = () => {
  return API.get("/admin/get-order-statuses");
};

export const getAllUsers = () =>{
  return API.get("/admin/get-all-users");
}
export const getAllRestaurants = () => {
  return API.get("/admin/get-all-restaurants");
}