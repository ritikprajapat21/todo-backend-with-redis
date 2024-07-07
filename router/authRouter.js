import { Router } from "express";
import bcrypt from "bcrypt";
import client from "../dbConn.js";
import jwt from "jsonwebtoken";

const authRouter = Router();

export const authMiddleware = (req, res, next) => {
  try {
    const header = req.headers["authorization"];

    if (!header) {
      return res.status(401).json({ error: "Please sign in" });
    }

    const token = header.split(" ")[1];

    const user = jwt.verify(token, process.env.TOKEN);

    if (!user) {
      return res.status(400).json({ error: "Please sign in again" });
    }

    req.email = user.email;
    next();
  } catch (error) {
    res.status(498).json({ error: error.message });
  }
};

authRouter.post("/register", async (req, res) => {
  const { email, password, repassword } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Credentials required" });
  }

  if (password !== repassword) {
    return res.status(401).json({ error: "Password does not match" });
  }

  const hashPassword = await bcrypt.hash(password, 10);

  // store the email
  const user = await client.hSet(`users:${email}`, {
    email,
    password: hashPassword,
  });

  return res.status(201).json({ message: "User Created", user });
});

authRouter.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await client.hGetAll(`users:${email}`);

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    return res.status(400).json({ error: "Wrong credential" });
  }

  const accessToken = jwt.sign({ email: user.email }, process.env.TOKEN, {
    //expiresIn: "300s",
  });

  res.status(200).json({ token: accessToken });
});

export default authRouter;
