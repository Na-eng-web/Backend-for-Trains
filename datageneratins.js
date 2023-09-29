const { MongoClient } = require("mongodb");

const stations = ["Parbhani", "Selu", "Partur", "Jalana", "Aurangabad"];

const totalTrains = 1000;

// write your Detabase Link here
const dbUrl = "mongodb://localhost:27017";
const dbName = "train_search";

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateRandomTrainTimes(numTrains) {
  const minMinutes = 0;
  const maxMinutes = 24 * 60;
  const trainTimes = [];

  for (let i = 0; i < numTrains; i++) {
    const randomMinutes =
      Math.floor(Math.random() * (maxMinutes - minMinutes + 1)) + minMinutes;

    const hours = Math.floor(randomMinutes / 60)
      .toString()
      .padStart(2, "0");
    const minutes = (randomMinutes % 60).toString().padStart(2, "0");

    trainTimes.push(`${hours}:${minutes}`);
  }

  trainTimes.sort();

  return trainTimes;
}

async function populateDatabase() {
  try {
    const client = await MongoClient.connect(dbUrl);
    const db = client.db(dbName);
    const trainsCollection = db.collection("trains");

    const trains = [];

    for (let i = 1; i <= totalTrains; i++) {
      const dist = [0];
      const train = {
        name: `Train ${i}`,
        route: [],
        distance: 0,
      };

      const numStations = getRandomNumber(2, 5);
      let prevStation = null;
      const chosenStations = new Set();

      for (let j = 0; j < numStations; j++) {
        let station;
        do {
          station = stations[getRandomNumber(0, stations.length - 1)];
        } while (station === prevStation || chosenStations.has(station));
        chosenStations.add(station);
        train.route.push(station);
        prevStation = station;

        if (j > 0) {
          const distance = getRandomNumber(50, 200);
          dist.push(distance);
          train.distance += distance;
        }
      }

      train.price = train.distance * 1.25;

      const randomTrainTimes = generateRandomTrainTimes(train.route.length);

      train.time = randomTrainTimes;
      train.dist = dist;

      trains.push(train);
    }

    await trainsCollection.insertMany(trains);
    console.log("Train data inserted into the database.");

    client.close();
  } catch (error) {
    console.error("Error while populating the database:", error);
  }
}

populateDatabase();
