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
    const init = fs.readFileSync("./database/init.sql").toString();
    try {
        pool.query(init).then(r => console.log('Database initialised successfully'));
    } catch (err) {
        console.log(err)
    }
}

// User Functions

// GET methods

async function getAllUsers() {

    try{
        const users = await pool.query('SELECT * FROM Users ORDER BY telegram_id DESC')
        return users.rows
    } catch (err) {
        console.log(err)
    }
}

async function getUserByTelegramId(telegram_id) {

    try{
        const user = await pool.query('SELECT * FROM Users WHERE telegram_id = $1', [telegram_id])
        return user.rows[0]
    } catch (err) {
        console.log(err)
    }
}

async function getUsersWithNotifications() {

    try{
        const users = await pool.query('SELECT * FROM Users WHERE notifications = TRUE')
        return users.rows
    } catch (err) {
        console.log(err)
    }
}

// POST methods

async function createUser(telegram_id, group_id) {

    try{
        await pool.query('INSERT INTO Users (telegram_id, group_id) VALUES ($1, $2)', [telegram_id, group_id])
        const user = await getUserByTelegramId(telegram_id)
        return user;
    } catch (err) {
        console.log(err)
    }
}

// PUT methods

async function setUserNotificationsByTelegramId(telegram_id, notifications) {

    try{
        const result = await pool.query('UPDATE Users SET notifications = $2 WHERE telegram_id = $1 RETURNING telegram_id, notifications', [telegram_id, notifications])
        return !!result.rows[0]
    } catch (err) {
        console.log(err)
    }
}

async function setUserAccumulatedPixelsByTelegramId(telegram_id, accumulated_pixels) {

    try{
        await pool.query('UPDATE Users SET accumulated_pixels = $2, last_updated = NOW() WHERE telegram_id = $1 RETURNING telegram_id, accumulated_pixels', [telegram_id, accumulated_pixels])
    } catch (err) {
        console.log(err)
    }
}

// DELETE methods

async function deleteUserByTelegramId(telegram_id) {

    try{
        await pool.query('DELETE FROM Users WHERE telegram_id = $1 RETURNING telegram_id', [telegram_id])
    } catch (err) {
        console.log(err)
    }
}

// Whitelist Functions

// GET methods

async function getWhitelistGroupIds() {

    try{
        const group_ids = await pool.query('SELECT * FROM Whitelist')
        return group_ids.rows
    } catch (err) {
        console.log(err)
    }
}

async function getWhitelistByGroupId(id) {

    try{
        const group_id = await pool.query("SELECT * FROM Whitelist WHERE group_id = $1", [id])
        return group_id.rows[0]
    } catch (err) {
        console.log(err)
    }
}

// POST methods

async function addWhitelistGroupId(group_id) {

    try{
        await pool.query('INSERT INTO Whitelist (group_id) VALUES ($1) RETURNING group_id', [group_id])
    } catch (err) {
        console.log(err)
    }
}

// DELETE methods

async function deleteWhitelistGroupId(group_id) {

    try{
        await pool.query('DELETE FROM Whitelist WHERE group_id = $1 RETURNING group_id', [group_id])
    } catch (err) {
        console.log(err)
    }
}

// Canvas Functions

// GET methods

async function getLatestCanvas() {

    try{
        const canvas = await pool.query('SELECT * FROM Canvas ORDER BY last_updated DESC LIMIT 1')
        return canvas.rows[0]
    } catch (err) {
        console.log(err)
    }
}

async function getCanvasByTelegramId(telegram_id) {

    try{
        const canvas = await pool.query('SELECT * FROM Canvas WHERE telegram_id = $1 ORDER BY last_updated DESC', [telegram_id])
        return canvas.rows[0]
    } catch (err) {
        console.log(err)
    }
}

// POST methods

async function addCanvas(telegram_id, bitfield) {

    try{
        await pool.query('INSERT INTO Canvas (telegram_id, bitfield) VALUES ($1, $2) RETURNING telegram_id', [telegram_id, bitfield])
    } catch (err) {
        console.log(err)
    }
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
