import Razorpay from "razorpay";
import crypto from "crypto";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import User from "../models/user.model.js";
import Order from "../models/order.model.js";
import { or } from "sequelize";

export const get_razorpay_key_controller = async (req, res) => {
  const apiKey = process.env.RAZORPAY_KEY_ID;
  return res.status(200).json({ apiKey });
};
export const create_order_controller = async (req, res) => {
  const { userId } = req.user;
  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

  const { amount, currency } = req.body;
  const options = {
    amount: amount * 100,
    currency,
  };
  try {
    const order = await razorpay.orders.create(options);
    console.log(order);
    if (!order) {
      return res
        .status(400)
        .json(
          new ApiError(
            400,
            "Something went wrong while creating order",
            {}
          ).toJSON()
        );
    }
    const createOrder = await Order.create({
      order_amount: order.amount,
      order_created_at: order.created_at,
      razorpay_order_id: order.id,
      order_currency: order.currency,
      isSuccess: false,
      userId,
    });
    if (!createOrder) {
      return res
        .status(400)
        .json(
          new ApiError(
            400,
            "Something went wrong while creating order",
            {}
          ).toJSON()
        );
    }
    return res
      .status(200)
      .json(new ApiResponse(200, "Order created successfully", createOrder));
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
};

export const verfiy_payment_controller = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;
  console.log("Verify Payment Called");
  const generated_signature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");
  const baseUrl = process.env.FRONTEND_BASE_URL;
  if (generated_signature === razorpay_signature) {
    const redirectUrl = `${baseUrl}/payment-status-success/${razorpay_order_id}`;
    const updateOrder = await Order.update(
      { isSuccess: true },
      {
        where: {
          razorpay_order_id,
        },
      }
    );
    console.log(updateOrder);
    res.status(200).redirect(redirectUrl);
  } else {
    const redirectUrl = `${baseUrl}/payment-status-failed/${razorpay_order_id}`;
    res.status(400).redirect(redirectUrl);
  }
};

export const update_transaction_controller = async (req, res) => {
  const { razorpay_order_id } = req.body;
  const { userId } = req.user;
  try {
    const [updateUser] = await User.update(
      { isPrimary: true },
      {
        where: {
          id: userId,
        },
      }
    );
    if (updateUser === 0) {
      return res
        .status(404)
        .json(new ApiError(404, "User not found", {}).toJSON());
    }
    return res.status(200).json(
      new ApiResponse(200, `User upgraded to premium`, {
        updateUser,
      }).toJSON()
    );
  } catch (error) {
    return res
      .status(500)
      .json(new ApiError(500, "Internal Server Error", { error }).toJSON());
  }
};
// http://localhost:3000/payment-status-success/order_OJp5u7JRufGeR7
// http://localhost:5173/payment-status-success/12929
// http://localhost:5173/payment-status-success/order_OK0FjKSMzKtcLC
