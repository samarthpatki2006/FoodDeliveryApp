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

export const getOrderSummaryForCart = (cart_id, delivery_address_id) => {
  return API.get(`/customer/get-cart-summary/${cart_id}/${delivery_address_id}`);
};
 
export const placeOrderFromCart = (data) => {
  return API.post("/customer/place-order-cart", data);
};
 
export const getMyPaymentMethods = () => {
  return API.get("/customer/get-payment-methods");
};

export const getMyOrders = (order_status_id) => {
  const params = order_status_id ? `?order_status_id=${order_status_id}` : "";
  return API.get(`/customer/get-my-orders${params}`);
};

export const getMyPaymentHistory = (payment_status_id) => {
  const params = payment_status_id ? `?payment_status_id=${payment_status_id}` : "";
  return API.get(`/customer/get-my-payments${params}`);
};