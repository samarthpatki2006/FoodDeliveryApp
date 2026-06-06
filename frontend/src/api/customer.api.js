import API from "./axios.js"

export const addAddressDetails=(data)=>{
  return API.post("/customer/add-address",data);
}

export const getAddresses=()=>{
  return API.get("/customer/get-my-addresses");
}