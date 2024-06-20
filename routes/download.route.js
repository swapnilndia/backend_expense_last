import { Router } from "express";
import { verifyAccessToken } from "../middlewares/validation.middleware.js";
import { downloadMiddleware } from "../middlewares/user.middleware.js";
import {
  download_controller,
  download_list_controller,
} from "../controllers/download.controller.js";
const router = Router();
router.get(
  "/download",
  verifyAccessToken,
  downloadMiddleware,
  download_controller
);
router.get("/downloads", verifyAccessToken, download_list_controller);

export default router;
