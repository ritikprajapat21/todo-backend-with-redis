import express from "express";
import client from "./dbConn.js";
import { config } from "dotenv";
import authRouter from "./router/authRouter.js";
import todoRouter from "./router/todoRouter.js";

const app = express();
const PORT = process.env.PORT || 3000;
config();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.disable("x-powered-by");

app.use("/auth", authRouter);
app.use("/", todoRouter);

if (client) {
  app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
} else {
  console.log("Not connected to database");
}
