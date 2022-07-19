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

// Get TODO
todoRouter.get("/", async (req, res) => {
  try {
    const result = await todoModel.find({}, { __v: 0 });
    res.status(200).json(result);
  } catch {
    res.status(400).json([]);
  }
});

// Create TODO
todoRouter.post("/", async (req, res) => {
  try {
    const { title } = req.body;

    const todoObject = new todoModel({
      title: title,
      createTime: Date.now(),
    });

    const result = await todoObject.save();
    res.status(200).json({
      _id: result._id,
      title: result.title,
      createTime: result.createTime,
    });
  } catch {
    res.sendStatus(400).json([]);
  }
});

// Update TODO
todoRouter.put("/", async (req, res) => {
  try {
    const { _id, title, isFinished } = req.body;

    if (isFinished === 1) {
      const result = await todoModel.updateOne(
        { _id: _id },
        { title: title, finishedTime: Date.now() }
      );
      console.log(result);
      res.sendStatus(200);
    } else {
      const result = await todoModel.updateOne({ _id: _id }, { title: title });
      res.sendStatus(200);
    }
  } catch (e) {
    console.log(e);
    res.sendStatus(400);
  }
});

app.use("/todo", todoRouter);
app.listen(PORT, () => console.log(`✔ server running at PORT:${PORT}`));
