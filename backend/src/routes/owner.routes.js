import {Router} from "express";
import { addRestaurantDetails,addLocationDetails,addOperationDetails,addBrandingDetails,getMyRestaurants,getRestaurantImages,addRestaurantCuisines,addMenuItems, getAllCuisines,getAllCategories} from "../controllers/owner.controller.js";
import {verifyJWT} from "../middlewares/auth.middleware.js";
import {upload} from "../middlewares/multer.middleware.js";

const router=Router();
router.route("/add-basic-restaurant-info").post(verifyJWT,addRestaurantDetails);
router.route("/add-restaurant-location/:restaurant_id").post(verifyJWT,addLocationDetails);
router.route("/add-operation-details/:restaurant_id").post(verifyJWT,addOperationDetails);
router.route("/add-branding-details/:restaurant_id").post(verifyJWT,upload.fields([{name:"logo",maxCount:1},{name:"banner",maxCount:1}]),addBrandingDetails);
router.route("/get-my-restaurants").get(verifyJWT,getMyRestaurants)
router.route("/get-restaurant-images/:restaurant_id").get(verifyJWT,getRestaurantImages);

router.route("/add-restaurant-cuisines/:restaurant_id").post(verifyJWT,addRestaurantCuisines);
router.route("/add-menu-items/:restaurant_id").post(verifyJWT,upload.fields([{name:"menu_image",maxCount:1}]),addMenuItems);
router.route("/get-all-cuisines").get(verifyJWT,getAllCuisines);
router.route("/get-all-categories").get(verifyJWT,getAllCategories);
export default router;