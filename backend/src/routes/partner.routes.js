import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {togglePartnerAvailability,getDeliveryHistory,getDashBoardStats,getCurrentOrderDetails,updateOrderStatus,acceptOrder,getNewAssignments} from "../controllers/partner.controller.js";
const router=Router();

router.route("/toggle-availability").patch(verifyJWT, togglePartnerAvailability);
router.route("/dashboard-stats").get(verifyJWT, getDashBoardStats);
router.route("/new-assignments").get(verifyJWT, getNewAssignments);
router.route("/accept-order").patch(verifyJWT, acceptOrder);
router.route("/current-order").get(verifyJWT, getCurrentOrderDetails);
router.route("/update-order-status").patch(verifyJWT, updateOrderStatus);
router.route("/delivery-history").get(verifyJWT, getDeliveryHistory);

export default router;