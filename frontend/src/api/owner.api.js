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

