const { MongoClient } = require("mongodb");

const client = new MongoClient(
  process.env.MONGO_URI
);

let db;

async function connectMongo() {
  await client.connect();

  db = client.db("olgafy");

  console.log("MongoDB connected");
}

function getDb() {
  return db;
}

module.exports = {
  connectMongo,
  getDb
};

const { getDb } = require("./mongo");

setTimeout(async () => {
  const db = getDb();

  await db.collection("chatstats").insertOne({
    test: true,
    time: Date.now()
  });

  console.log("Mongo write test OK");
}, 5000);