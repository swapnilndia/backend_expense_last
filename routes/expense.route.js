import { Router } from "express";
import {
  validateExpense,
  verifyAccessToken,
} from "../middlewares/validation.middleware.js";
import {
  create_expense_controller,
  delete_expense_controller,
  expense_list_controller,
  leaderboard_controller,
  search_expense_controller,
  specific_expense_controller,
  update_expense_controller,
} from "../controllers/expense.controller.js";

const router = Router();

router.post(
  "/expense",
  verifyAccessToken,
  validateExpense,
  create_expense_controller
);
router.get("/expenses", verifyAccessToken, expense_list_controller);
router.get(
  "/expenses/:expenseId",
  verifyAccessToken,
  specific_expense_controller
);
router.delete(
  "/expenses/:expenseId",
  verifyAccessToken,
  delete_expense_controller
);
router.put(
  "/expenses/:expenseId",
  verifyAccessToken,
  validateExpense,
  update_expense_controller
);
router.get("/search/expenses", verifyAccessToken, search_expense_controller);
router.get("/leaderboard", verifyAccessToken, leaderboard_controller);

export default router;
