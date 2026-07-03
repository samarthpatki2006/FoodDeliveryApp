import API from "./axios.js"

export const addAddressDetails = (data) => {
  return API.post("/customer/add-address", data);
}

export const getAddresses = () => {
  return API.get("/customer/get-my-addresses");
}

export const getRestaurantsInMyCity = () => {
  return API.get("/customer/get-restaurants");
}

export const getMyCarts = () => {
  return API.get("/customer/get-my-carts");
}

export const deleteCart = (cart_id) => {
  return API.delete(`/customer/delete-cart/${cart_id}`);
}

export const deleteCartItem = (data) => {
  return API.delete(`/customer/delete-cart-item/${data.cart_id}/${data.cart_item_id}`)
}

export const updateCartQuantity = (data) => {
  return API.patch(`/customer/update-cart-quantity`, data);
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

export const getRestaurantMenu = (restaurant_id) => {
  return API.get(`/customer/get-restaurant-menu/${restaurant_id}`);
}

export const getNearbyRestaurants = (latitude, longitude, radius = 5) => {
  return API.get("/customer/nearby-restaurants", { params: { latitude, longitude, radius, } });
};
export const getInitialRestaurants=()=>{
  return API.get("/customer/get-initial-restaurants");
}

export const getMenuItems=(address_id)=>{
  return API.get("/customer/get-menu-items",{params:{address_id}});
}

export const getOrderSummary=(data)=>{
  console.log(data)
  return API.get(`/customer/get-order-summary/${data.menu_item_id}/${data.quantity}/${data.delivery_address_id}`);
}

export const placeOrder=(data)=>{
  return API.post("/customer/place-order",data);
}

export const addItemToCart=(data)=>{
  return API.post("/customer/add-item-to-cart",data);
}

export const getOrderStats = () => {
  return API.get("/customer/get-order-stats");
};

export const getMoneyStats = () => {
  return API.get("/customer/get-money-stats");
};

export const getRestaurantStats = () => {
  return API.get("/customer/get-restaurant-stats");
};

export const getItemStats = () => {
  return API.get("/customer/get-item-stats");
};

export const getCuisineStats = () => {
  return API.get("/customer/get-cuisine-stats");
};