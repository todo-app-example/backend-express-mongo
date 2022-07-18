require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");

const PORT = process.env.PORT || 5050;
const MONGODB_URL = process.env.MONGODB_URL || "";
mongoose.connect(MONGODB_URL);

const app = express();
app.use(express.json());

const todoSchema = new mongoose.Schema({
  title: { type: String, require: true },
  createTime: { type: Date, require: true, default: Date.now() },
  finishedTime: { type: Date, require: false },
});

const todoModel = mongoose.model("todos", todoSchema);

const todoRouter = express.Router();

todoRouter.get("/", async (req, res) => {
  try {
    const result = await todoModel.find().lean();
    res.status(200).json(result);
  } catch {
    res.status(400).json([]);
  }
});

todoRouter.post("/", async (req, res) => {
  try {
    const { title } = req.body;

    const todoObject = new todoModel({
      title: title,
      createTime: Date.now(),
    });

    const result = await todoObject.save();

    res.status(200).json({
      title: result.title,
      _id: result._id,
    });
  } catch {
    res.status(400).json([]);
  }
});

app.use("/todo", todoRouter);
app.listen(PORT, () => console.log(`✔ server running at PORT:${PORT}`));
