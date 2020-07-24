const keys = require("./keys.js");
const auth = require("./auth.js");
const db = require("./queries");
const color = require("./colors");
const canvas_commons = require("./canvas_commons.js");

// Express
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

//HTTPS
const fs = require("fs");
const https = require("https")

// PostgreSQL
// const { Pool } = require("pg").Pool;

// Redis
const redis = require("redis");
const canvas = require("./redis_js/canvas.js");
const redis_commons = require("./redis_js/commons.js");

// Notification Scheduler
const startNotificationSchedule = require("./scheduler/schedule")

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

//Initialise Database
db.initDatabase();

// Redis setup
const redisManager = new canvas.RedisManager(canvas_commons.CANVAS_NAME);
redisManager.initializeCanvas(canvas_commons.CANVAS_WIDTH, canvas_commons.CANVAS_HEIGHT, canvas_commons.PIXEL_FORMAT);

// Start Schedule
startNotificationSchedule().then(r => console.log('Notification schedule started'))

setInterval(() => {
  redisManager.getCanvas().then((result, error) => {
    if (error) {
      console.log(error);
    } else {
      db.addCanvas("250437415", result).then(r => {
        console.log('Bitfield backed up successfully. UWU')
      })
    }
  })
}, 300000);

// Flag for whitelisting
const isWhitelistPeriod = process.env.WHITELIST || true;

// Express route handlers

/*
Requests:

GET /  : gets the page
GET /api/grid : gets the grid
POST /api/grid : updates a pixel on the grid
POST /api/admin/clear : admin clear

*/

app.get("/api/grid", async(req, res) => {
  const grid = await redisManager.getCanvas()
  const json = {"grid": grid}
  res.json(json)
  console.log("Grid requested.");
  res.sendStatus(200);
});

app.post("/whitelist", async (req, res) => {
  const chatId = req.body.chatId;
  if (isWhitelistPeriod) {
    await db.addWhitelistGroupId(chatId)
    res.sendStatus(200);
  } else {
    res.sendStatus(401);
  }
});

app.post("/toggle/off", async (req, res) => {
  const userId = req.body.userId;
  try {
    const exists = await db.setUserNotificationsByTelegramId(userId, false)
    if (!exists) {
      res.sendStatus(204)
      return
    }
    res.sendStatus(200)
  } catch (err) {
    console.log(err)
    res.sendStatus(401)
  }

})

app.post("/toggle/on", async (req, res) => {
  const userId = req.body.userId;

  try {
    const exists = await db.setUserNotificationsByTelegramId(userId, true)
    if (!exists) {
      res.sendStatus(204)
      return
    }
    res.sendStatus(200)
  } catch (err) {
    console.log(err)
    res.sendStatus(401)
  }

})

app.post("/admin/clear", async (req, res) => {
  try {
    const topLeft = req.body.topLeft; // array of two numbers
    const bottomRight = req.body.bottomRight; // array of two numbers
    if (bottomRight[0] < topLeft[0] || bottomRight[1] < topLeft[1]) {
      res.status(400).send("<p>Bad Request. Invalid coordinates.</p>");
      return;
    }

    await redisManager.setAreaValue(topLeft[0], topLeft[1], bottomRight[0], bottomRight[1], color.Color.WHITE);

    try {
      const grid = await redisManager.getCanvas();
      io.emit("grid", grid);
      res.sendStatus(200)
    } catch (err) {
      console.log(err);
      res.sendStatus(500)
    }

  } catch (e) {
    res.sendStatus(400);
  }
});


app.post("/api/grid/:chatId/:userId", async (req, res) => {
  const chatId = req.params.chatId;
  const userId = req.params.userId;
  const isPermitted = auth.authenticateChatId(chatId);
  if (isPermitted) {
    const color = req.body.color;
    const accumulatedPixels = req.body.accumulated_pixels; // TODO: Check how Frontend sends

    const x_coordinate = 0; // TODO: Get x-coordinate from frontend
    const y_coordinate = 0; // TODO: Get y-coordinate from frontend
    await redisManager.setValue(x_coordinate, y_coordinate, color);

    try {
      const grid = await redisManager.getCanvas();
      io.emit("grid", grid);
      res.sendStatus(200)
    } catch (err) {
      console.log(err);
      res.sendStatus(500)
    }

    await db.setUserAccumulatedPixelsByTelegramId(userId, accumulatedPixels - 1)
  } else {
    res.sendStatus(401);
  }
});

app.get("/api/user/:userId", async (req, res) => {
  const userId = req.params.userId;
  try {
    const user = await db.getUserByTelegramId(userId)
    res.json(user)
    res.sendStatus(200)
  } catch (err) {
    console.log(err)
  }
})

app.get("/start/:chatId/:userId", async (req, res) => {
  const chatId = req.params.chatId;
  const userId = req.params.userId;
  const isPermitted = keys.isBeta || await auth.authenticateChatId(chatId);
  if (!isPermitted) {
    res.sendStatus(401);
    return
  }
  let user = await db.getUserByTelegramId(userId);
  if (!user) {
    if (keys.isBeta) {
      await db.addWhitelistGroupId(chatId)
    }
    user = await db.createUser(userId, chatId);
  }
  res.sendFile("./public/index.html", { root: "." });
});

app.listen(5000, () => console.log("Listening on port 5000..."));

module.exports = app; // exporting for testing purposes
