const keys = require("./keys.js");
const auth = require("./auth.js");
const db = require("./queries");
const color = require("./public/colors");
const canvas_commons = require("./public/canvas_commons.js");
const {sendMassMessage} = require("./telegram/sendMessage")

// Express
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

// Redis
const redis = require("redis");
const canvas = require("./redis_js/canvas.js");
const redis_commons = require("./redis_js/commons.js");

// Notification Scheduler
const startNotificationSchedule = require("./scheduler/schedule");

// Express Setup
app = express();
app.use(function(req, res, next) {
  if (req.url === '/') {
    res.redirect('https://www.reddit.com/r/YouFellForItFool/comments/cjlngm/you_fell_for_it_fool/');
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
  redisManager.initializeBlankCanvas(canvas_commons.CANVAS_WIDTH, canvas_commons.CANVAS_HEIGHT, canvas_commons.PIXEL_FORMAT);
  db.getLatestCanvas().then((result) => {
    const bitfield = result["bitfield"];
    redisManager.setCanvas(bitfield).then(() => {
      console.log("Re-initialized Redis with a pre-saved canvas.");
    });
  });
}

// Start Schedule
startNotificationSchedule().then(r => console.log('Notification schedule started'));

setInterval(() => {
  redisManager.getCanvas().then((result, error) => {
    if (error) {
      console.log(error);
    } else {
      db.addCanvas(keys.adminUserId, result).then(r => {
        console.log('Bitfield backed up to database successfully.');
      })
    }
  })
}, 300000);

// Flag for whitelisting
const isWhitelistPeriod = keys.isWhitelistPeriod || false;

// Allow CORS
app.use(function (req, res, next) {
      res.header('Access-Control-Allow-Origin', '*'); // to be changed to telegram bot domain
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
      res.header('Access-Control-Allow-Credentials', 'true');
      next();
    }
)

// Express route handlers

/*
Requests:

User actions:
GET /api/grid => gets the canvas
POST /api/grid/:chatId/:userId => sets a pixel on the canvas

Initialize chats and users:
POST /whitelist => adds chat to whitelist
POST /start/:chatId/:userId => activates user account
POST /toggle/on => turns on telegram notifications for user
POST /toggle/off => turns off telegram notifications for user
GET /api/user/:userId => gets user with userId

Admin functions:
POST /massMessage => sends a message to all users of the bot (Admin only)
POST /admin/clear => clears an area of the canvas (Admin only)
*/

app.get("/api/grid", async(req, res) => {
  const grid = await redisManager.getCanvas();
  const json = {"grid": grid};
  res.status(200).json(json);
  console.log("Grid requested.");
});

app.post("/whitelist", async (req, res) => {
  const chatId = req.body.chatId;
  console.log(req.body);
  console.log(chatId);
  if (isWhitelistPeriod) {
    try {
      await db.addWhitelistGroupId(chatId);
      res.sendStatus(200);
    } catch (err) {
      console.log(err);
      res.sendStatus(400);
    }
  } else {
    res.sendStatus(401);
  }
});

app.post("/toggle/off", async (req, res) => {
  const userId = req.body.userId;
  try {
    const exists = await db.setUserNotificationsByTelegramId(userId, false);
    if (!exists) {
      res.sendStatus(204);
      return;
    }
    res.sendStatus(200);
  } catch (err) {
    console.log(err);
    res.sendStatus(401);
  }

})

app.post("/toggle/on", async (req, res) => {
  const userId = req.body.userId;

  try {
    const exists = await db.setUserNotificationsByTelegramId(userId, true)
    if (!exists) {
      res.sendStatus(204);
      return;
    }
    res.sendStatus(200);
  } catch (err) {
    console.log(err);
    res.sendStatus(401);
  }

})

app.post("/massMessage", async (req, res) => {
  if (req.body.userId != keys.adminUserId) {
    res.sendStatus(401);
    return;
  }
  const message = req.body.message;
  const users = await db.getAllUsers();
  sendMassMessage(users, message);
})

app.post("/admin/clear", async (req, res) => {
  if (req.body.userId != keys.adminUserId) {
    res.sendStatus(401);
    return;
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
      const json = {grid: grid};
      io.emit("grid", json);
      res.sendStatus(200);
    } catch (err) {
      console.log(err);
      res.sendStatus(500);
    }

  } catch (e) {
    console.log(e);
    res.sendStatus(400);
  }
});

app.post("/api/grid/:chatId/:userId", async (req, res) => {
  const chatId = req.params.chatId;
  const userId = req.params.userId;

  const user = await db.getUserByTelegramId(userId)

  // Verifies that the user exists in the database
  if (user === null) {
    res.status(401).send("User does not exist in the database.")
  }

  const userLastUpdatedTime = new Date(user.last_updated).getTime();
  const frontendUserLastUpdatedTime = new Date(req.body.oldLastUpdatedTime).getTime();
  const last_updated = req.body.newLastUpdatedTime;

  // Verifies that user does not have more than 1 tab open simultaneously
  if (userLastUpdatedTime !== frontendUserLastUpdatedTime) {
    res.status(403).send("Please place pixels using only 1 tab/1 client!");
    return;
  }

  // Verifies that placed pixel is valid
  if (req.body.x <= 0 || req.body.y <= 0 ||
      req.body.x > canvas_commons.CANVAS_WIDTH || req.body.y > canvas_commons.CANVAS_HEIGHT) {
    res.sendStatus(400);
    return;
  }

  const isPermitted = auth.authenticateChatId(chatId);

  if (isPermitted) {
    const binaryColorValue = req.body.color;
    const accumulatedPixels = req.body.accPixels;

    const x_coordinate = req.body.x;
    const y_coordinate = req.body.y;
    redisManager.setValue(x_coordinate, y_coordinate, binaryColorValue);
    console.log("Set pixel with x-coordinate " + x_coordinate + " and y-coordinate " + y_coordinate +
        " with binary value " + binaryColorValue);

    try {
      const grid = await redisManager.getCanvas();
      const json = {grid: grid};
      io.emit("grid", json);
      res.sendStatus(200);
    } catch (err) {
      console.log(err);
      res.sendStatus(500);
    }

    await db.setUserAccumulatedPixelsByTelegramId(userId, accumulatedPixels, last_updated)
  } else {
    res.sendStatus(401);
  }
});

app.get("/api/user/:userId", async (req, res) => {
  const userId = req.params.userId;
  console.log("In the API: " + userId);
  try {
    const user = await db.getUserByTelegramId(userId);
    res.status(200).json(user);
  } catch (err) {
    res.status(401).send(err);
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
  let whitelist = await db.getWhitelistByGroupId(chatId);
  if (!user) {
    if (keys.isBeta && !whitelist) {
      await db.addWhitelistGroupId(chatId);
    }

    // Verifies that user is not using invalid userIds
    if (userId % keys.hiddenLargeConstant !== 0) {
      res.status(401).send("Please use a valid User Id.");
      return;
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
