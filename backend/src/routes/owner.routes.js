import {Router} from "express";
import { addRestaurantDetails,addLocationDetails,addOperationDetails,addBrandingDetails,getMyRestaurants,getRestaurantImages} from "../controllers/owner.controller.js";
import {verifyJWT} from "../middlewares/auth.middleware.js";
import {upload} from "../middlewares/multer.middleware.js";

const router=Router();
router.route("/add-basic-restaurant-info").post(verifyJWT,addRestaurantDetails);
router.route("/add-restaurant-location/:restaurant_id").post(verifyJWT,addLocationDetails);
router.route("/add-operation-details/:restaurant_id").post(verifyJWT,addOperationDetails);
router.route("/add-branding-details/:restaurant_id").post(verifyJWT,upload.fields([{name:"logo",maxCount:1},{name:"banner",maxCount:1}]),addBrandingDetails);
router.route("/get-my-restaurants").get(verifyJWT,getMyRestaurants)
router.route("/get-restaurant-images/:restaurant_id").get(verifyJWT,getRestaurantImages);
export default router;