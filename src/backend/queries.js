const { Pool } = require("pg");
const fs = require("fs")
const keys = require('./keys')
// Move to seperate file with restricted permissions after testing, make sure details match
// Change to pg variables from keys file before deployment
const pool = new Pool({
    user: keys.pgUser,
    host: keys.pgHost,
    database: keys.pgDatabase,
    password: keys.pgPassword,
    port: keys.pgPort,
  })

// TODO: Better error handling


// Initialise database
const initDatabase = () => {
    const init = fs.readFileSync("../database/init.sql").toString();
    pool.query(init).then(r => console.log('Database initialised successfully'));
}

// User Functions

// GET methods

async function getAllUsers() {
    const users = await pool.query('SELECT * FROM Users ORDER BY telegram_id DESC').rows
    return users
}

async function getUserByTelegramId(telegram_id) {
    const user = await pool.query('SELECT * FROM Users WHERE telegram_id = $1', [telegram_id]).rows[0]
    return user
}

async function getUsersWithNotifications() {
    const users = await pool.query('SELECT * FROM Users WHERE notifications = TRUE').rows
    return users
}

// POST methods

async function createUser(telegram_id, group_id) {
    await pool.query('INSERT INTO Users (telegram_id, group_id) VALUES ($1, $2)', [telegram_id, group_id])
    const user = await getUserByTelegramId(telegram_id)
    console.log(user)
    return user;
}

// PUT methods

async function setUserNotificationsByTelegramId(telegram_id, notifications) {
    await pool.query('UPDATE Users SET notifications = $2 WHERE telegram_id = $1 RETURNING telegram_id, notifications', [telegram_id, notifications])
}

async function setUserAccumulatedPixelsByTelegramId(telegram_id, accumulated_pixels) {
    await pool.query('UPDATE Users SET accumulated_pixels = $2, last_updated = NOW() WHERE telegram_id = $1 RETURNING telegram_id, accumulated_pixels', [telegram_id, accumulated_pixels])
}

// DELETE methods

async function deleteUserByTelegramId(telegram_id) {
    await pool.query('DELETE FROM Users WHERE telegram_id = $1 RETURNING telegram_id', [telegram_id])
}

// Whitelist Functions

// GET methods

async function getWhitelistGroupIds() {
    const group_ids = await pool.query('SELECT * FROM Whitelist').rows
    return group_ids
}

async function getWhitelistByGroupId(id) {
    const group_id = await pool.query("SELECT * FROM Whitelist WHERE group_id = $1", [id]).rows
    return group_id
}

// POST methods

async function addWhitelistGroupId(group_id) {
    await pool.query('INSERT INTO Whitelist (group_id) VALUES ($1) RETURNING group_id', [group_id])
}

// DELETE methods

async function deleteWhitelistGroupId(group_id) {
    await pool.query('DELETE FROM Whitelist WHERE group_id = $1 RETURNING group_id', [group_id])
}

// Canvas Functions

// GET methods

async function getLatestCanvas() {
    const canvas = await pool.query('SELECT * FROM Canvas ORDER BY last_updated DESC LIMIT 1').rows[0]
    return canvas
}

async function getCanvasByTelegramId(telegram_id) {
    const canvas = await pool.query('SELECT * FROM Canvas WHERE telegram_id = $1 ORDER BY last_updated DESC', [telegram_id]).rows[0]
    return canvas
}

// POST methods

async function addCanvas(telegram_id, bitfield) {
    await pool.query('INSERT INTO Canvas (telegram_id, bitfield) VALUES ($1, $2) RETURNING telegram_id', [telegram_id, bitfield])
}

// Exports

module.exports = {
    initDatabase: initDatabase,
    createUser: createUser,
    getUserByTelegramId: getUserByTelegramId,
    getUsersWithNotifications: getUsersWithNotifications,
    setUserNotificationsByTelegramId: setUserNotificationsByTelegramId,
    getAllUsers: getAllUsers,
    deleteUserByTelegramId: deleteUserByTelegramId,
    setUserAccumulatedPixelsByTelegramId: setUserAccumulatedPixelsByTelegramId,
    getWhitelistGroupIds: getWhitelistGroupIds,
    getWhitelistByGroupId: getWhitelistByGroupId,
    addWhitelistGroupId: addWhitelistGroupId,
    deleteWhitelistGroupId: deleteWhitelistGroupId,
    getLatestCanvas: getLatestCanvas,
    getCanvasByTelegramId: getCanvasByTelegramId,
    addCanvas, addCanvas
}
