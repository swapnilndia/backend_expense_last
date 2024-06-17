import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import helmet from "helmet";
import { fileURLToPath } from "url";
import morgan from "morgan";
import "dotenv/config";
import sequelize from "./configs/dbConfig.js";
import UserRouter from "./routes/user.route.js";
import ExpenseRouter from "./routes/expense.route.js";
import OrderRouter from "./routes/order.route.js";
import User from "./models/user.model.js";
import Expense from "./models/expense.model.js";
import ApiError from "./utils/ApiError.js";
import Order from "./models/order.model.js";
import fs from "fs";
import path from "path";

const app = express();
const PORT = process.env.PORT || 5002;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "access.log"),
  { flags: "a" }
);

// Middleware setup
app.use(helmet());
app.use(morgan("combined", { stream: accessLogStream }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  cors({
    origin: true,
    optionsSuccessStatus: 200,
    credentials: true,
  })
);
app.options(
  "*",
  cors({
    origin: true,
    optionsSuccessStatus: 200,
    credentials: true,
  })
);

// JSON Syntax Error Handling Middleware
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res
      .status(400)
      .json(new ApiError(400, "Bad Request - Invalid JSON", req.body));
  }
  next();
});
app.get("/", (req, res) => {
  res.status(200).send("<h1>hello</h1>");
});

// API routes
app.use("/", UserRouter);
app.use("/", ExpenseRouter);
app.use("/", OrderRouter);

// Model associations
User.hasMany(Expense);
Expense.belongsTo(User);

User.hasMany(Order);
Order.belongsTo(User);

// Sync database and start server
sequelize
  // .sync({ force: true })
  .sync()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running at port ${PORT}`);
    });
  })
  .catch((err) => console.log(err));

// General error handling middleware (should be last)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res
    .status(err.status || 500)
    .json(
      new ApiError(err.status || 500, err.message || "Internal Server Error")
    );
});
