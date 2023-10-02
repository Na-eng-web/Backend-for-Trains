const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
app.use(cors());
app.use(express.json());

// sorting is not working

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

app.post("/search", (req, res) => {
  const { From, To, Sort = "name" } = req.body;
  const filter = {
    route: {
      $all: [From, To],
    },
  };
  const sortFilter = {
    [Sort]: -1,
  };
  Trains.find(filter)
    .sort(sortFilter)
    .then((data) => {
      const modifiedTrains = data.filter((train) => {
        const fromIndex = train.route?.indexOf(From);
        const toIndex = train.route?.indexOf(To);
        return fromIndex !== -1 && toIndex !== -1 && fromIndex < toIndex;
      });

      const modifiedTrainsWithTimeDifference = modifiedTrains.map((train) => {
        const fromIndex = train.route?.indexOf(From);
        const toIndex = train.route.indexOf(To);
        const fromTime = parseTime(train.time[fromIndex]);
        const toTime = parseTime(train.time[toIndex]);
        const timeDifferenceInMinutes = calculateTimeDifference(
          fromTime,
          toTime
        );

        const hours = Math.floor(timeDifferenceInMinutes / 60);
        const minutes = timeDifferenceInMinutes % 60;
        const formattedTimeDifference = `${String(hours).padStart(
          2,
          "0"
        )}:${String(minutes).padStart(2, "0")}`;

        return {
          ...train._doc,
          time: formattedTimeDifference,
        };
      });
      res.json(modifiedTrainsWithTimeDifference);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: "Internal Server Error" });
    });
});

function parseTime(timeString) {
  const [hours, minutes] = timeString.split(":");
  return { hours: parseInt(hours), minutes: parseInt(minutes) };
}

function calculateTimeDifference(fromTime, toTime) {
  const fromMinutes = fromTime.hours * 60 + fromTime.minutes;
  const toMinutes = toTime.hours * 60 + toTime.minutes;
  const timeDifference = toMinutes - fromMinutes;
  return Math.abs(timeDifference);
}

app.listen(4000, () => console.log("Server is live at 4000!"));

// const filter = {
//   route: {
//     $all: ["Parbhani", "Partur"],
//   },
// };
// const sort = {
//   _id: -1,
// };

// const cursor = coll.find(filter, { sort });
