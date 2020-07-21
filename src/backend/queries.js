const { Pool } = require("pg");
// Move to seperate file with restricted permissions after testing, make sure details match
// Change to pg variables from keys file before deployment
const pool = new Pool({
    user: 'admin',
    host: 'localhost',
    database: 'tPlace',
    password: 'tPlace2020',
    port: 5432,
  })

// TODO: Better error handling

// User Functions

// GET methods

async function getAllUsers() {
    const users = await pool.query('SELECT * FROM Users ORDER BY telegram_id DESC')
    return users
}

async function getUserByTelegramId(telegram_id) {
    const user = await pool.query('SELECT * FROM Users WHERE telegram_id = $1', [telegram_id])
    return user
}

async function getUsersWithNotifications() {
    const users = await pool.query('SELECT * FROM Users WHERE notifications = TRUE')
    return users
}

// POST methods

async function createUser(telegram_id) {
    await pool.query('INSERT INTO Users (telegram_id) VALUES ($1)', [telegram_id])
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
    const group_ids = await pool.query('SELECT * FROM Whitelist')
    return group_ids
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
    const canvas = await pool.query('SELECT * FROM Canvas ORDER BY last_updated DESC LIMIT 1')
    return canvas
}

async function getCanvasByTelegramId(telegram_id) {
    const canvas = await pool.query('SELECT * FROM Canvas WHERE telegram_id = $1 ORDER BY last_updated DESC', [telegram_id])
    return canvas
}

// POST methods

async function addCanvas(telegram_id, bitfield) {
    await pool.query('INSERT INTO Canvas (telegram_id, bitfield) VALUES ($1, $2) RETURNING telegram_id', [telegram_id, bitfield])
}

// Exports

module.exports = {
    createUser: createUser,
    getUserByTelegramId: getUserByTelegramId,
    getUsersWithNotifications: getUsersWithNotifications,
    setUserNotificationsByTelegramId: setUserNotificationsByTelegramId,
    getAllUsers: getAllUsers,
    deleteUserByTelegramId: deleteUserByTelegramId,
    setUserAccumulatedPixelsByTelegramId: setUserAccumulatedPixelsByTelegramId,
    getWhitelistGroupIds: getWhitelistGroupIds,
    addWhitelistGroupId: addWhitelistGroupId,
    deleteWhitelistGroupId: deleteWhitelistGroupId,
    getLatestCanvas: getLatestCanvas,
    getCanvasByTelegramId: getCanvasByTelegramId,
    addCanvas, addCanvas
}
