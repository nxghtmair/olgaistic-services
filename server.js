const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send("ok");
});

app.listen(process.env.PORT, () => {
  console.log("server alive on port " + process.env.PORT);
});
