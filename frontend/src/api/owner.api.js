import API from "./axios.js";

export const addRestaurantDetails=(data)=>{
  return API.post("/owner/add-basic-restaurant-info",data);
}