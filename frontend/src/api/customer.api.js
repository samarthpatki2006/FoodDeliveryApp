import API from "./axios.js"

export const addAddressDetails=(data)=>{
  return API.post("/customer/add-address",data);
}

export const getAddresses=()=>{
  return API.get("/customer/get-my-addresses");
}

export const getRestaurants=()=>{
  return API.get("/customer/get-restaurants");
}

export const getMyCarts=()=>{
  return API.get("/customer/get-my-carts");
}