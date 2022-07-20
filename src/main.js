require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");

const PORT = process.env.PORT || 5050;
const MONGODB_URL = process.env.MONGODB_URL || "";
mongoose.connect(MONGODB_URL).then(() => console.log(`✔ mongodb connected`));

const app = express();
app.use(express.json());

const todoSchema = new mongoose.Schema({
  title: { type: String, require: true },
  createTime: { type: Date, require: true },
  finishedTime: { type: Date, require: false },
});

const todoModel = mongoose.model("todos", todoSchema);

const todoRouter = express.Router();

// Get TODO
todoRouter.get("/", async (req, res) => {
  try {
    const result = await todoModel.find({}, { __v: 0 }).lean();
    res.status(200).json(result);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

// Create TODO
todoRouter.post("/", async (req, res) => {
  try {
    const { title } = req.body;

    if (title === undefined) throw new Error("you must provide a title string");

    if (title.length < 1) throw new Error("must be a valid string");

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
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

// Update TODO
todoRouter.put("/", async (req, res) => {
  try {
    const { _id, title } = req.body;
    if (_id === undefined) throw new Error("you must provide a _id string");
    if (!mongoose.Types.ObjectId.isValid(_id))
      throw new Error("must be a valid id");
    if (title === undefined) throw new Error("you must provide a title string");
    if (title.length < 1) throw new Error("must be a valid string");

    const result = await todoModel.updateOne({ _id: _id }, { title: title });
    if (result.modifiedCount !== 1) throw new Error("update failed");

    res.status(200).json({ message: "update successful" });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

// Delete TODO
todoRouter.delete("/", async (req, res) => {
  try {
    const { _id } = req.query;
    if (!mongoose.Types.ObjectId.isValid(_id))
      throw new Error("must be a valid id");

    const result = await todoModel.deleteOne({ _id: _id });

    if (result.deletedCount !== 1)
      throw new Error("delete failed or id already deleted");

    res.status(200).json({ message: "delete successful" });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

// Finished/Unfinished TODO
todoRouter.patch("/", async (req, res) => {
  try {
    const { _id, isFinished } = req.query;

    if (_id === undefined) throw new Error("you must provide a _id string");
    if (!mongoose.Types.ObjectId.isValid(_id))
      throw new Error("must be a valid id");
    if (isFinished === undefined) throw new Error("isFinished missing");
    if (isFinished !== "1" && isFinished !== "0")
      throw new Error("isFinished must be 0 or 1");

    if (isFinished === "1") {
      const result = await todoModel.updateOne(
        { _id: _id },
        { finishedTime: Date.now() }
      );
      if (result.modifiedCount !== 1) throw new Error("failed");
    } else {
      const result = await todoModel.updateOne(
        { _id: _id },
        { $unset: { finishedTime: Date.now() } }
      );
      if (result.modifiedCount !== 1) throw new Error("failed");
    }

    res.status(200).json({ message: "successful" });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

app.use("/todo", todoRouter);
app.listen(PORT, () => console.log(`✔ server running at PORT:${PORT}`));
