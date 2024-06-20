import sequelize from "../configs/dbConfig.js";
import { DataTypes } from "sequelize";

const Download = sequelize.define(
  "download",
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    fileName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    downloadURL: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: true,
    paranoid: true,
  }
);

export default Download;
