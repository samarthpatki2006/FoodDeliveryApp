import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {getUserCount,getTotalRestaurants,getTotalRestaurantRevenue,getRevenueSummary,getOrderByStatuses, getAllUsers, getAllRestaurants} from "../controllers/admin.controller.js";

const router = Router();

router.route("/get-user-count").get(verifyJWT, getUserCount);
router.route("/get-total-restaurants").get(verifyJWT, getTotalRestaurants);
router.route("/get-total-restaurant-revenue").get(verifyJWT, getTotalRestaurantRevenue);
router.route("/get-revenue-summary").get(verifyJWT, getRevenueSummary);
router.route("/get-order-statuses").get(verifyJWT, getOrderByStatuses);
router.route("/get-all-users").get(verifyJWT,getAllUsers);
router.route("/get-all-restaurants").get(verifyJWT,getAllRestaurants);

export default router;