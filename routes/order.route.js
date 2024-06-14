import { Router } from "express";
import { verifyAccessToken } from "../middlewares/validation.middleware.js";
import {
  create_order_controller,
  get_razorpay_key_controller,
  update_transaction_controller,
  verfiy_payment_controller,
} from "../controllers/order.controller.js";
const router = Router();

router.get("/get-api", verifyAccessToken, get_razorpay_key_controller);

router.post("/create-order", verifyAccessToken, create_order_controller);

router.post("/verify-payment", verfiy_payment_controller);

router.post(
  "/update-transaction",
  verifyAccessToken,
  update_transaction_controller
);
export default router;

// http://localhost:3000/update-transaction
// http://localhost:3000/update-transaction
