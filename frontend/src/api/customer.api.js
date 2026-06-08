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

export const deleteCart=(cart_id)=>{
  return API.delete(`/customer/delete-cart/${cart_id}`);
}

export const deleteCartItem=(data)=>{
  return API.delete(`/customer/delete-cart-item/${data.cart_id}/${data.cart_item_id}`)
}

export const updateCartQuantity=(data)=>{
  return API.patch(`/customer/update-cart-quantity`,data);
}