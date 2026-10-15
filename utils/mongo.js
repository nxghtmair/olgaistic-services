const { MongoClient } = require("mongodb");

const client = new MongoClient(
  process.env.MONGO_URI
);

let db;

async function connectMongo() {
  await client.connect();

  db = client.db("olgafy");

  console.log("✅ MongoDB connected");
}

function getDb() {
  return db;
}

module.exports = {
  connectMongo,
  getDb
};