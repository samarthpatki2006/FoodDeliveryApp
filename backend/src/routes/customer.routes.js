import {Router} from "express"
import { addAddressDetails, addItemToCart, addReview, deleteCart, deleteCartItem, getMenuItems, getMyOrders, getMyPaymentHistory, getRestaurantsInMyCity, placeOrder, placeOrderFromCart, updateCartQuantity,getAddresses, getMyCarts, getOrderSummaryForCart, getOrderSummary, getPaymentMethods } from "../controllers/customer.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router=Router();
router.route("/add-address").post(verifyJWT,addAddressDetails);
router.route("/get-restaurants").get(verifyJWT,getRestaurantsInMyCity);
router.route("/get-my-orders").get(verifyJWT,getMyOrders);
router.route("/get-my-payments").get(verifyJWT,getMyPaymentHistory);
router.route("/add-item-to-cart").post(verifyJWT,addItemToCart);
router.route("/update-cart-quantity").patch(verifyJWT,updateCartQuantity);
router.route("/delete-cart-item/:cart_id/:cart_item_id").delete(verifyJWT,deleteCartItem);
router.route("/delete-cart/:cart_id").delete(verifyJWT,deleteCart);
router.route("/place-order-cart").post(verifyJWT,placeOrderFromCart);
router.route("/place-order").post(verifyJWT,placeOrder);
router.route("/get-menu-items").get(verifyJWT,getMenuItems)
router.route("/give-review").post(verifyJWT,addReview);
router.route("/get-my-addresses").get(verifyJWT,getAddresses);
router.route("/get-my-carts").get(verifyJWT,getMyCarts);
router.route("/get-cart-summary/:cart_id/:delivery_address_id").get(verifyJWT,getOrderSummaryForCart);
router.route("/get-order-summary/:menu_item_id/:quantity/:delivery_address_id").get(verifyJWT,getOrderSummary);
router.route("/get-payment-methods").get(verifyJWT,getPaymentMethods)
export default router;