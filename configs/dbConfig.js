import { Sequelize } from "sequelize";

const sequelize = new Sequelize("expenseTracker", "root", "Node@12345", {
  dialect: "mysql",
  host: "localhost",
  timezone: "+05:30", // Set timezone option to IST
});

export default sequelize;
