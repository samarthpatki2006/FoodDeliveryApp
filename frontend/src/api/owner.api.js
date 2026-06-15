import API from "./axios.js";

export const addRestaurantDetails=(data)=>{
  return API.post("/owner/add-basic-restaurant-info",data);
}

export const addLocationDetails=(restaurant_id,data)=>{
  return API.post(`/owner/add-restaurant-location/${restaurant_id}`,data);
}

export const getMyRestaurants=()=>{
  return API.get("/owner/get-my-restaurants");
}

export const addOperationDetails=(restaurant_id,data)=>{
  return API.post(`/owner/add-operation-details/${restaurant_id}`,data);
}

export const addBrandingDetails=(restaurant_id,data)=>{
  return API.post(`/owner/add-branding-details/${restaurant_id}`,data);
}

export const getMyRestaurantImages=(restaurant_id)=>{
  return API.get(`/owner/get-restaurant-images/${restaurant_id}`)
}

export const getAllCuisines=()=>{
  return API.get(`/owner/get-all-cuisines`);
}
export const getAllCategories=()=>{
  return API.get(`/owner/get-all-categories`);
}
export const addRestaurantCuisine=(cuisine_id,restaurant_id)=>{
  return API.post(`/owner/add-restaurant-cuisines/${restaurant_id}`,cuisine_id);
}
export const addMenuItem=(restaurant_id,formData)=>{
  return API.post(`/owner/add-menu-items/${restaurant_id}`,formData);
}
export const getOrders=(restaurant_id,order_status_id)=>{
  return API.get("/owner/get-orders",{params:{restaurant_id,order_status_id}});
}
export const getOrderStatuses=()=>{
  return API.get("/owner/get-order-statuses");
}
export const updateOrderStatus=(data)=>{
  return API.patch("/owner/update-order-status",data);
}
export const updateOpenStatus=(data)=>{
  return API.patch("/owner/update-open-status",data);
}