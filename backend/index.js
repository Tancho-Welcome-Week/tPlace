const keys = require("./keys");

// Express
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

// PostgreSQL
const { Pool } = require("pg");

// Redis
const redis = require("redis");

// Express Setup
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Express route handlers

/*
Requests:

GET /  : gets the page
GET /api/grid : gets the grid
POST /api/grid : updates a pixel on the grid
POST /api/admin/clear : admin clear

*/

app.get("/", (req, res) => {
  const isPermitted = true; // TODO: telegram authentication
  if (isPermitted) {
    res.sendFile("/frontend/index.html", { root: ".." });
  } else {
    res.sendStatus(401);
  }
});

app.get("/api/grid", (req, res) => {
  console.log("Grid requested.");
  res.sendStatus(200);
});

app.post("/api/grid", (req, res) => {
  const isPermitted = true; // TODO: telegram authentication
  if (isPermitted) {
    const color = req.body.color;
    const user = req.body.user;
    // TODO: pixel update
    res.sendStatus(200);
  } else {
    res.sendStatus(401);
  }
});

app.post("/admin/clear", (req, res) => {
  try {
    const topLeft = req.body.topLeft; // array of two numbers
    const bottomRight = req.body.bottomRight; // array of two numbers
    if (bottomRight[0] < topLeft[0] || bottomRight[1] < topLeft[1]) {
      res.status(400).send("<p>Bad Request. Invalid coordinates.</p>");
      return;
    }
    // TODO: admin wipe
    res.sendStatus(200);
  } catch (e) {
    res.sendStatus(400);
  }
});

app.listen(5000, () => console.log("Listening on port 5000..."));
