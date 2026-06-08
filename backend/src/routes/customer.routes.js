import {Router} from "express"
import { addAddressDetails, addItemToCart, addReview, deleteCart, deleteCartItem, getMenuItems, getMyOrders, getMyPaymentHistory, getRestaurantsInMyCity, placeOrder, placeOrderFromCart, updateCartQuantity,getMyAddresses, getMyCarts } from "../controllers/customer.controller.js";
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
router.route("/get-my-addresses").get(verifyJWT,getMyAddresses);
router.route("/get-my-carts").get(verifyJWT,getMyCarts);
export default router;