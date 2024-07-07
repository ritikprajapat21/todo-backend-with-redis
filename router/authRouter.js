import { Router } from "express";
import bcrypt from "bcrypt";
import client from "../dbConn.js";

const authRouter = Router();

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
  console.log(user);

  return res.status(201).json({ message: "User Created" });
});

authRouter.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(401).json({ error: "Credentials required" });
  }

  // Validating the user
});

export default authRouter;
