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