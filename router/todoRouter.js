import { Router } from "express";
import { authMiddleware } from "./authRouter.js";
import client from "../dbConn.js";
import mail from "@sendgrid/mail";

async function sendMail(deadline, todo, email) {
  mail.setApiKey(process.env.API_KEY);
  const date = new Date(deadline * 1000);
  const msg = {
    to: email,
    from: process.env.EMAIL,
    subject: "Your todo is reaching deadline",
    text: `Your todo "${todo} is reaching its deadline. It is set to expire on ${date.toDateString()} at ${date.toTimeString()}`,
    sendAt: deadline - 10 * 60,
  };

  await mail.send(msg);
}

const todoRouter = Router();

// To get all todos
todoRouter.get("/", authMiddleware, async (req, res) => {
  try {
    const todos = await client.lRange(`users:${req.email}:todo`, 0, -1);

    const arr = todos.map((todo) => {
      const el = JSON.parse(todo);

      if (el.deadline < Math.floor(new Date() / 1000)) {
        client.lRem(`users:${req.email}:todo`, 1, todo);
        return;
      }

      return el;
    });

    res.status(200).json({ todo: arr });
  } catch (error) {
    res.status(500).json({ error });
  }
});

/* To create a todo
 * @body todo: string
 * @body deadline: unixtimestamp
 */
todoRouter.post("/create", authMiddleware, async (req, res) => {
  try {
    const { todo, deadline } = req.body;

    if (deadline < Math.floor(new Date() / 1000)) {
      throw new Error("Enter future timestamp");
    }

    const r = await client.rPush(
      `users:${req.email}:todo`,
      JSON.stringify({
        todo,
        deadline: deadline,
      }),
    );

    sendMail(deadline, todo, req.email);

    res.status(201).json({ r });
  } catch (error) {
    res.status(403).json({ error: error.message });
  }
});

/* To update a todo
 * @body todo: string
 * @body deadline: unix timestamp
 */
todoRouter.put("/:index", authMiddleware, async (req, res) => {
  try {
    const { todo, deadline } = req.body;
    const { index } = req.params;

    if (deadline < Math.floor(new Date() / 1000)) {
      throw new Error("Enter future timestamp");
    }

    const el = await client.lRange(`users:${req.email}:todo`, index, index);
    const oldTodo = JSON.parse(el[0]);

    const r = await client.lSet(
      `users:${req.email}:todo`,
      index,
      JSON.stringify({ todo, deadline: deadline || oldTodo.deadline }),
    );

    res.json({ r });
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

/* To delete todos
 * @body todo: string
 */
todoRouter.delete("/", authMiddleware, async (req, res) => {
  try {
    const { todo } = req.body;

    const r = await client.lRem(`users:${req.email}:todo`, 1, todo);

    if (r == 0) {
      throw new Error("Element does not exist");
    }

    res.status(200).json({ r });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default todoRouter;
