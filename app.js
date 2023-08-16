const express = require("express");
const mongoose = require("mongoose");
const Puzzle = require("./puzzle");

const app = express();
app.set("view engine", "ejs");

const port = process.env.PORT || 3000;
const dbURL = process.env.DB_URL || "mongodb://127.0.0.1:27017/scavenger-hunt";

mongoose
  .connect(dbURL)
  .then(() => {
    console.log("CONNECTED TO DATABASE");
  })
  .catch((err) => {
    console.log(err);
  });

app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/:id", async (req, res) => {
  const puzzle = await Puzzle.findById(req.params.id);
  if (puzzle) {
    return res.render(puzzle.number, {
      id: puzzle.id,
      title: puzzle.title,
      question: puzzle.question,
    });
  }
  return res.status(404).send("Not Found");
});

app.post("/:id", async (req, res) => {
  const puzzle = await Puzzle.findById(req.params.id);
  if (puzzle) {
    if (req.body.checkList) {
      const answer = [];
      const keys = Object.keys(req.body);
      keys.forEach((key) => {
        if (key !== "checkList") answer.push(req.body[key]);
      });
      if (JSON.stringify(answer) === JSON.stringify(puzzle.answer)) {
        return res.render("reward", { reward: puzzle.reward });
      }
      return res.redirect(`/${req.params.id}`);
    }
    if (!Array.isArray(puzzle.answer)) puzzle.answer = [puzzle.answer];
    if (puzzle.answer.includes(req.body.answer.toLowerCase())) {
      return res.render("reward", { reward: puzzle.reward });
    }
    return res.redirect(`/${req.params.id}`);
  }
  return res.redirect(`/${req.params.id}`);
});

app.listen(port, () => {
  console.log(`LISTENING AT PORT ${port}`);
});
