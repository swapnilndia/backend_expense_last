import sequelize from "../configs/dbConfig.js";
import { DataTypes } from "sequelize";
const Order = sequelize.define(
  "order",
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    order_amount: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    order_created_at: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    razorpay_order_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    order_currency: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isSuccess: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    timestamps: true,
  }
);

export default Order;
