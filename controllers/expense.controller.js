import sequelize from "../configs/dbConfig.js";
import Expense from "../models/expense.model.js";
import User from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { Op } from "sequelize";

export const create_expense_controller = async (req, res) => {
  const { price, description, category } = req.body;
  const { email, userId } = req.user;

  try {
    const createExpense = await Expense.create({
      price,
      description,
      category,
      userId,
    });
    if (!createExpense) {
      return res
        .status(500)
        .json(new ApiError(500, "Internal Server Error", { createExpense }));
    }
    const getUser = await User.findByPk(userId);
    if (getUser) {
      const newAmount = getUser.dataValues.total_amoount + price;
      const [updatedUser] = await User.update(
        { total_amoount: newAmount },
        {
          where: {
            id: userId,
          },
        }
      );
      if (updatedUser) {
        return res
          .status(201)
          .json(
            new ApiResponse(201, `New expense created by ${email}`, updatedUser)
          );
      }
    }
  } catch (error) {
    res.status(500).json(new ApiError(500, "Internal Server Error", { error }));
  }
};

export const expense_list_controller = async (req, res) => {
  const { limit, offset } = req.query;
  const limitExpense = parseInt(limit);
  const offsetExpense = parseInt(offset);
  const { userId } = req.user;

  try {
    const { rows: listOfExpense, count: countOfExpense } =
      await Expense.findAndCountAll({
        where: {
          userId,
        },
        limit: limitExpense, // Convert limit to integer
        offset: offsetExpense, // Convert offset to integer
      });
    console.log(listOfExpense);
    if (!listOfExpense) {
      return res
        .status(500)
        .json(new ApiError(500, "Internal Server Error", {}));
    }
    return res.status(200).json(
      new ApiResponse(200, `Fetched list of Expenses`, {
        listOfExpense,
        limit: limitExpense,
        offset: offsetExpense,
        count: countOfExpense,
      })
    );
  } catch (error) {
    res.status(500).json(new ApiError(500, "Internal Server Error", { error }));
  }
};

export const specific_expense_controller = async (req, res) => {
  const { expenseId } = req.params;
  try {
    const expense = await Expense.findByPk(expenseId);
    if (!expense) {
      return res
        .status(404)
        .json(
          new ApiError(
            404,
            `Expense with expenseId:- ${expenseId} was not found`,
            { expense }
          )
        );
    }
    return res.status(200).json(
      new ApiResponse(200, `Fetched expense with expenseId:- ${expenseId}`, {
        expense,
      })
    );
  } catch (error) {
    res
      .status(500)
      .json(new ApiError(500, "Internal Server Error 2", { error }));
  }
};
export const delete_expense_controller = async (req, res) => {
  const { expenseId } = req.params;
  const { userId } = req.user;
  try {
    const expense = await Expense.findByPk(expenseId);
    if (!expense) {
      return res
        .status(404)
        .json(
          new ApiError(
            404,
            `Expense with expenseId:- ${expenseId} was not found`,
            { expense }
          )
        );
    }
    const deleteExpense = await Expense.destroy({
      where: {
        id: expenseId,
      },
    });
    if (deleteExpense === 0) {
      return res
        .status(404)
        .json(
          new ApiError(
            404,
            `Cannot Delete expense with expenseId:- ${expenseId}`,
            { expense }
          )
        );
    }

    const getUser = await User.findByPk(userId);
    if (getUser) {
      const newAmount =
        getUser.dataValues.total_amoount - expense.dataValues.price;
      const [updatedUser] = await User.update(
        { total_amoount: newAmount },
        {
          where: {
            id: userId,
          },
        }
      );
      if (updatedUser) {
        return res.status(200).json(
          new ApiResponse(
            200,
            `Deleted expense with expenseId:- ${expenseId}`,
            {
              expense,
            }
          )
        );
      }
    }
  } catch (error) {
    res
      .status(500)
      .json(new ApiError(500, "Internal Server Error 2", { error }));
  }
};
export const update_expense_controller = async (req, res) => {
  const { expenseId } = req.params;
  const { price, description, category } = req.body;
  const { email, userId } = req.user;
  try {
    const expense = await Expense.findByPk(expenseId);
    if (!expense) {
      return res
        .status(404)
        .json(
          new ApiError(
            404,
            `Expense with expenseId:- ${expenseId} was not found`,
            { expense }
          )
        );
    }
    const [updateCount] = await Expense.update(
      { price, description, category },
      {
        where: {
          id: expenseId,
        },
      }
    );
    if (updateCount === 0) {
      return res.status(404).json(new ApiError(404, "Expense not found", {}));
    }
    const getUser = await User.findByPk(userId);
    if (getUser) {
      const newAmount =
        getUser.dataValues.total_amoount - expense.dataValues.price + price;
      const [updatedUser] = await User.update(
        { total_amoount: newAmount },
        {
          where: {
            id: userId,
          },
        }
      );
      if (updatedUser) {
        return res.status(200).json(
          new ApiResponse(
            200,
            `Deleted expense with expenseId:- ${expenseId}`,
            {
              expense,
            }
          )
        );
      }
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, `Expense updated by ${email}`, { updateCount })
      );
  } catch (error) {
    return res
      .status(500)
      .json(new ApiError(500, "Internal Server Error", { error }));
  }
};

export const leaderboard_controller = async (req, res) => {
  try {
    const allExpenses = await User.findAll({
      attributes: [
        "id",
        "name",
        "email",
        "isPrimary",
        [
          sequelize.fn("SUM", sequelize.col("expenses.price")),
          "total_expenses",
        ],
      ],
      include: [
        {
          model: Expense,
          as: "expenses",
          attributes: [],
        },
      ],
      group: ["User.id"],
      order: sequelize.literal("total_expenses DESC"), // Ordering by the alias
    });
    if (!allExpenses) {
      return res
        .status(404)
        .json(new ApiError(404, `Unable to fetch expenses`, { allExpenses }));
    }
    return res
      .status(200)
      .json(new ApiResponse(200, `List of Expenses`, { allExpenses }));
  } catch (error) {
    return res
      .status(500)
      .json(new ApiError(500, "Internal Server Error", { error }));
  }
};

export const search_expense_controller = async (req, res) => {
  const { userId } = req.user;
  const { description, category } = req.query;
  try {
    const whereClause = {
      userId,
    };
    // Add description filter if provided
    if (description) {
      whereClause.description = {
        [Op.like]: `%${description}%`,
      };
    }

    // Add category filter if provided
    if (category) {
      whereClause.category = category;
    }

    const { rows: listOfExpense, count: countOfExpense } =
      await Expense.findAndCountAll({
        where: whereClause,
        offset: 0,
        limit: 10,
      });
    return res.status(200).json(
      new ApiResponse(200, `Fetched list of Expenses`, {
        listOfExpense,
        limit: 10,
        offset: 0,
        count: countOfExpense,
      })
    );
  } catch (error) {
    return res
      .status(500)
      .json(new ApiError(500, "Internal Server Error", { error }));
  }
};
// Monthly Summary
export const expenses_monthly_controller = async (req, res) => {
  const { userId } = req.user;
  try {
    const listOfExpense = await Expense.findAll({
      attributes: [
        [
          sequelize.fn("DATE_FORMAT", sequelize.col("createdAt"), "%Y-%m"),
          "month",
        ],
        [sequelize.fn("SUM", sequelize.col("price")), "total_amount"],
        [sequelize.fn("COUNT", sequelize.col("id")), "transaction_count"],
      ],
      group: ["month"],
      order: [["month", "ASC"]],
      where: {
        userId: userId,
      },
    });

    if (!listOfExpense) {
      return res.status(404).json(
        new ApiError(404, `Unable to fetch Monthly expenses`, {
          listOfExpense,
        })
      );
    }
    return res
      .status(200)
      .json(
        new ApiResponse(200, `List of Monthly Expenses`, { listOfExpense })
      );
  } catch (error) {
    console.error("Error fetching monthly summary:", error);
    return res
      .status(500)
      .json(new ApiError(500, "Internal Server Error", { error }));
  }
};

export const expenses_weekly_controller = async (req, res) => {
  const { userId } = req.user;
  try {
    const listOfExpense = await Expense.findAll({
      attributes: [
        [sequelize.fn("YEAR", sequelize.col("createdAt")), "year"],
        [sequelize.fn("WEEK", sequelize.col("createdAt"), 1), "week"],
        [sequelize.fn("SUM", sequelize.col("price")), "total_amount"],
        [sequelize.fn("COUNT", sequelize.col("id")), "transaction_count"],
      ],
      group: ["year", "week"],
      order: [
        ["year", "ASC"],
        ["week", "ASC"],
      ],
      where: {
        userId: userId,
      },
    });
    if (!listOfExpense) {
      return res.status(404).json(
        new ApiError(404, `Unable to fetch Monthly expenses`, {
          listOfExpense,
        })
      );
    }
    return res
      .status(200)
      .json(
        new ApiResponse(200, `List of Monthly Expenses`, { listOfExpense })
      );
  } catch (error) {
    console.error("Error fetching weekly summary:", error);
    return res
      .status(500)
      .json(new ApiError(500, "Internal Server Error", { error }));
  }
};
