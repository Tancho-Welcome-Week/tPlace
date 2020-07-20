const keys = require("./keys.js");
const auth = require("./auth.js");

// Express
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

// PostgreSQL
const { Pool } = require("pg");

// Redis
const redis = require("redis");
const canvas = require("./redis_js/canvas.js");
const redis_commons = require("./redis_js/commons.js");

// Notification Scheduler
const startNotificationSchedule = require("./scheduler/schedule.js");
const {getUser} = require("./auth.js");

// Express Setup
app = express();
app.use(express.static("public"));
app.use(cors());
app.use(bodyParser.json());

// Socket.io Setup
const http = require("http").Server(app);
const io = require("socket.io")(http, {
  perMessageDeflate: false,
});

io.on("connection", () => {
  console.log("A user is connected");
});

// Redis setup
const redisManager = new canvas.RedisManager(redis_commons.CANVAS_NAME);
redisManager.initializeCanvas(redis_commons.CANVAS_WIDTH, redis_commons.CANVAS_HEIGHT, redis_commons.PIXEL_FORMAT);

// Start Schedule
const users = true; //TODO: get users from database
//startNotificationSchedule(users);
setInterval(() => {
  redisManager.getCanvas().then((result, error) => {
    if (error) {
      console.log(error);
    } else {
      //TODO: add redis backup to database
    }
  })
}, 300000);

// Flag for whitelisting
const isWhitelistPeriod = process.env.WHITELIST || false;

// Express route handlers

/*
Requests:

GET /  : gets the page
GET /api/grid : gets the grid
POST /api/grid : updates a pixel on the grid
POST /api/admin/clear : admin clear

*/

app.get("/:chatId/:userId", (req, res) => {
  const chatId = req.params.chatId;
  const userId = req.params.userId;
  const isPermitted = auth.authenticateChatId(chatId); // TODO: telegram authentication
  if (!isPermitted) {
    res.sendStatus(401);
  }
  res.sendFile("./public/index.html", { root: "." });
  //res.redirect("https://www.reddit.com/r/HydroHomies/"); //TODO: Send frontend thinga majig
});

app.get("/api/grid", (req, res) => {
  console.log("Grid requested.");
  res.sendStatus(200);
});

app.post("/whitelist", (req, res) => {
  const chatId = req.params.chatId;
  if (isWhitelistPeriod) {
    //TODO: add chatId to database
    res.sendStatus(200);
  } else {
    res.sendStatus(401);
  }
});

app.post("/api/grid/:chatId/:userId", (req, res) => {
  const chatId = req.params.chatId;
  const userId = req.params.userId;
  const isPermitted = auth.authenticateChatId(chatId); // TODO: telegram authentication
  const user = getUser(userId); //TODO: check if user can place pixel
  if (isPermitted) {
    const color = req.body.color;
    const user = req.body.user;

    const x_coordinate = 0; // TODO: Get x-coordinate from frontend
    const y_coordinate = 0; // TODO: Get y-coordinate from frontend
    redisManager.setValue(x_coordinate, y_coordinate, color);

    redisManager.getCanvas().then((result, error) => {
      if (error) {
        console.log(error);
        res.sendStatus(500);
      } else {
        io.emit("grid", result);
        // TODO: canvas update in database
        // TODO: update user fields accordingly
        res.sendStatus(200);
      }
    });
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

    redisManager.setAreaValue(topLeft[0], topLeft[1], bottomRight[0], bottomRight[1], redis_commons.Color.WHITE);

    redisManager.getCanvas().then((result, error) => {
      if (error) {
        console.log(error);
        res.sendStatus(500);
      } else {
        io.emit("grid", result);
        res.sendStatus(200);
      }
    });
  } catch (e) {
    res.sendStatus(400);
  }
});

app.listen(5000, () => console.log("Listening on port 5000..."));

module.exports = app; // exporting for testing purposes
