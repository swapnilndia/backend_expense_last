import sequelize from "../configs/dbConfig.js";
import { DataTypes } from "sequelize";

const User = sequelize.define(
  "user",
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    reset_password_hash: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    reset_password_expiry_ms: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    },
    verify_email_hash: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    verify_email_expiry_ms: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    isPrimary: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    },
    access_token: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    refresh_token: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    refresh_token_expiry: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    total_amoount: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default User;
