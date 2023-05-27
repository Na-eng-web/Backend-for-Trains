const express = require("express");
const app = express();
const mongoose = require("mongoose");
// const populateDatabase = require("./datageneratins.js");
const cors = require("cors");
app.use(cors());

mongoose
  .connect("mongodb://127.0.0.1:27017/train_search")
  .then(() => console.log("We are connect to DB"))
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

let From, To;
app.post("/api", (req, res) => {
  From = req.body.From;
  To = req.body.To;
  res.send("Key received");
});

let TrainsData;
Trains.find({})
  .then((data) => (TrainsData = data))
  .catch((err) => console.log(err));

app.get("/", (req, res) => {
  res.send(
    TrainsData.filter(
      (item) =>
        item.route.includes(From) === true &&
        item.route.includes(To) === true &&
        item.route.indexOf(From) < item.route.indexOf(To)
    )
  );
});

// console.log(filteredData);
app.listen(4000, () => console.log("we are live at 4000!"));
