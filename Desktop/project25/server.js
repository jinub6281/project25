const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send("IT WORKS");
});

app.listen(80);