import express from "express";
import client from "./dbConn.js";
import bcrypt from "bcrypt";
import { config } from "dotenv";
import jwt from "jsonwebtoken";

const app = express();
const PORT = process.env.PORT || 3000;
config();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.disable("x-powered-by");

const authMiddleware = (req, res, next) => {
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

app.post("/register", async (req, res) => {
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

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await client.hGetAll(`users:${email}`);

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    return res.status(400).json({ error: "Wrong credential" });
  }

  const accessToken = jwt.sign(
    {
      email: user.email,
    },
    process.env.TOKEN,
    {
      expiresIn: "300s",
    },
  );

  res.status(200).json({ token: accessToken });
});

app.get("/", authMiddleware, async (req, res) => {
  try {
    const todo = await client.lRange(`users:${req.email}:todo`, 0, -1);

    res.status(200).json({ todo });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error });
  }
});

app.post("/create", authMiddleware, async (req, res) => {
  try {
    const { todo } = req.body;

    const r = await client.rPush(`users:${req.email}:todo`, todo);

    res.status(201).json({ r });
  } catch (error) {
    console.error(error);
    res.status(403).json({ error: error.message });
  }
});

app.put("/:index", authMiddleware, async (req, res) => {
  try {
    const { todo } = req.body;
    const { index } = req.params;

    const r = await client.lSet(`users:${req.email}:todo`, index, todo);

    res.json({ r });
  } catch (error) {
    res.status(500).json({ error: "Index out of range" });
  }
});

app.delete("/", authMiddleware, async (req, res) => {
  try {
    const { todo } = req.body;

    //const r = await client.lSet(`users:${req.email}:todo`, idx, todo);

    const r = await client.lRem(`users:${req.email}:todo`, 1, todo);

    if (r == 0) {
      return res.send({ message: "Element does not exist" });
    }
    res.status(200).json({ r });
  } catch (error) {
    console.error(error);
    res.json({ error });
  }
});

if (client) {
  app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
} else {
  console.log("Not connected to database");
}
