const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
app.use(cors());

mongoose
  .connect("mongodb://localhost:27017/train_search")
  .then(() => console.log("We are connected to DB"))
  .catch(() => console.log("ERROR!"));

const trainsSchema = new mongoose.Schema({
  name: String,
  route: Array,
  time: Array,
  dist: Array,
  distance: Number,
  price: Number,
});

const Trains = mongoose.model("trains", trainsSchema);

app.use(express.json());

app.post("/api", (req, res) => {
  const { From, To } = req.body;
  console.log(From, To);
  Trains.find({
    route: { $all: [From, To] },
  })
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: "Internal Server Error" });
    });
});

app.listen(4000, () => console.log("Server is live at 4000!"));
