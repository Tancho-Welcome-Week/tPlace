const keys = require("./keys.js");
const auth = require("./auth.js");
const db = require("./queries");
const color = require("./public/colors");
const canvas_commons = require("./public/canvas_commons.js");

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
app.use(function(req, res, next) {
  if (req.url === '/') {
    res.redirect('https://www.reddit.com/r/YouFellForItFool/comments/cjlngm/you_fell_for_it_fool/')
  }
  next();
})
app.use(express.static("public"));
app.use(cors());
app.use(bodyParser.json());

// Socket.io Setup
const http = require("http").createServer(app);
const io = require("socket.io")(http, {
  perMessageDeflate: false
});

io.on("connection", () => {
  console.log("A user is connected");
});

// Initialize Redis
const redisManager = new canvas.RedisManager(canvas_commons.CANVAS_NAME);

// Initialize Database
if (!keys.databaseDeployed) {
  db.initDatabase();
  redisManager.initializeBlankCanvas(canvas_commons.CANVAS_WIDTH, canvas_commons.CANVAS_HEIGHT, canvas_commons.PIXEL_FORMAT);
} else {
  db.getLatestCanvas().then((result) => {
    const bitfield = result.bitfield;
    redisManager.setCanvas(bitfield);
  });
}

// Start Schedule
startNotificationSchedule().then(r => console.log('Notification schedule started'))

setInterval(() => {
  redisManager.getCanvas().then((result, error) => {
    if (error) {
      console.log(error);
    } else {
      db.addCanvas("250437415", result).then(r => {
        console.log('Bitfield backed up to database successfully.')
      })
    }
  })
}, 300000);

// Flag for whitelisting
const isWhitelistPeriod = process.env.WHITELIST || true;

// Allow CORS
app.use(function (req, res, next) {
      res.header('Access-Control-Allow-Origin', '*') // to be changed to telegram bot domain
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
      res.header('Access-Control-Allow-Credentials', 'true')
      next()
    }
)

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
  res.status(200).json(json)
  console.log("Grid requested.");
});

app.post("/whitelist", async (req, res) => {
  const chatId = req.body.chatId;
  // console.log(req.body)
  if (isWhitelistPeriod) {
    try {
      await db.addWhitelistGroupId(chatId)
      res.sendStatus(200);
    } catch (err) {
      console.log(err)
      res.sendStatus(400)
    }
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
  if (req.body.userId !== 250437415) {
    res.sendStatus(401)
    return
  }
  try {
    const topLeft = req.body.topLeft; // array of two numbers
    const bottomRight = req.body.bottomRight; // array of two numbers
    if (bottomRight[0] < topLeft[0] || bottomRight[1] < topLeft[1]) {
      res.status(400).send("<p>Bad Request. Invalid coordinates.</p>");
      return;
    }

    await redisManager.setAreaValue(topLeft[0], topLeft[1], bottomRight[0], bottomRight[1], color.ColorBinary.WHITE);

    try {
      const grid = await redisManager.getCanvas();
      const json = {grid: grid}
      io.emit("grid", json);
      res.sendStatus(200)
    } catch (err) {
      console.log(err);
      res.sendStatus(500)
    }

  } catch (e) {
    console.log(e)
    res.sendStatus(400);
  }
});


app.post("/api/grid/:chatId/:userId", async (req, res) => {
  const chatId = req.params.chatId;
  const userId = req.params.userId;
  const isPermitted = auth.authenticateChatId(chatId);
  if (req.body.x <= 0 || req.body.y <= 0 ||
      req.body.x > canvas_commons.CANVAS_WIDTH || req.body.y > canvas_commons.CANVAS_HEIGHT) {
    res.sendStatus(400)
    return
  }
  if (isPermitted) {
    // const redValue = req.body.r;
    // const greenValue = req.body.g;
    // const blueValue = req.body.b;
    // const colorValue = redValue + "," + greenValue + "," + blueValue;
    // const binaryColorValue = color.ColorRGBToBinary[colorValue];
    const binaryColorValue = req.body.color;
    const accumulatedPixels = req.body.accPixels;

    const x_coordinate = req.body.x;
    const y_coordinate = req.body.y;
    await redisManager.setValue(x_coordinate, y_coordinate, binaryColorValue);
    console.log("Set pixel with x-coordinate " + x_coordinate + " and y-coordinate " + y_coordinate +
        " with binary value " + binaryColorValue);

    try {
      const grid = await redisManager.getCanvas();
      const json = {grid: grid}
      io.emit("grid", json);
      res.sendStatus(200)
    } catch (err) {
      console.log(err);
      res.sendStatus(500)
    }

    await db.setUserAccumulatedPixelsByTelegramId(userId, accumulatedPixels)
  } else {
    res.sendStatus(401);
  }
});

app.get("/api/user/:userId", async (req, res) => {
  const userId = req.params.userId;
  try {
    const user = await db.getUserByTelegramId(userId)
    res.status(200).json(user)
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
  let whitelist = await db.getWhitelistByGroupId(chatId)
  if (!user) {
    if (keys.isBeta && !whitelist) {
      await db.addWhitelistGroupId(chatId)
    }
    await db.createUser(userId, chatId);
  }
  res.sendFile("./public/index.html", { root: "." });
});

app.get('*', function(req, res){
  res.redirect('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
});

// app.delete("/delete/redis/canvas", async (req, res) => {
//   await redisManager.deleteCanvas();
//   await redisManager.initializeCanvas(canvas_commons.CANVAS_WIDTH, canvas_commons.CANVAS_HEIGHT,
//       canvas_commons.PIXEL_FORMAT);
//   res.sendStatus(200)
// })

http.listen(5000, () => console.log("Listening on port 5000..."));

module.exports = app; // exporting for testing purposes
