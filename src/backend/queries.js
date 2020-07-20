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

const getAllUsers = async (request, response) => {
    await pool.query('SELECT * FROM Users ORDER BY telegram_id DESC', (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows)
    })
}

const getUserByTelegramId = async (request, response) => {
    const telegram_id = request.params.telegram_id
  
    await pool.query('SELECT * FROM Users WHERE telegram_id = $1', [telegram_id], (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows)
    })
}

const getUsersWithNotifications = async (request, response) => {
    await pool.query('SELECT * FROM Users WHERE notifications = TRUE', (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows)
    })
}

// POST methods

const createUser = async (request, response) => {
    const telegram_id = request.query.telegram_id

    await pool.query('INSERT INTO Users (telegram_id) VALUES ($1) RETURNING telegram_id', [telegram_id], (error, results) => {
        if (error) {
            throw error
        }
        response.status(201).send(`User added with telegram_id: ${results.rows[0].telegram_id}!`)
    })
}

// PUT methods

const setUserNotificationsByTelegramId = async (request, response) => {
    const telegram_id = request.query.telegram_id
    const notifications = request.query.notifications

    await pool.query('UPDATE Users SET notifications = $2 WHERE telegram_id = $1 RETURNING telegram_id, notifications', [telegram_id, notifications], (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).send(`User ${results.rows[0].telegram_id} notification status updated to ${results.rows[0].notifications}!`)
    })
}

const setUserAccumulatedPixelsByTelegramId = async (request, response) => {
    const telegram_id = request.query.telegram_id
    const accumulated_pixels = request.query.accumulated_pixels
  
    await pool.query('UPDATE Users SET accumulated_pixels = $2, last_updated = NOW() WHERE telegram_id = $1 RETURNING telegram_id, accumulated_pixels', [telegram_id, accumulated_pixels], (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).send(`User ${results.rows[0].telegram_id} accumulated pixels changed to ${results.rows[0].accumulated_pixels}!`)
      }
    )
}

// DELETE methods

const deleteUserByTelegramId = async (request, response) => {
    const telegram_id = request.params.telegram_id
  
    await pool.query('DELETE FROM Users WHERE telegram_id = $1 RETURNING telegram_id', [telegram_id], (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).send(`User ${results.rows[0].telegram_id} deleted!`)
    })
}

// Whitelist Functions

// GET methods

const getWhitelistGroupIds = async (request, response) => {
    await pool.query('SELECT * FROM Whitelist', (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows)
    })
}

// POST methods

const addWhitelistGroupId = async (request, response) => {
    const group_id = request.query.group_id

    await pool.query('INSERT INTO Whitelist (group_id) VALUES ($1) RETURNING group_id', [group_id], (error, results) => {
        if (error) {
            throw error
        }
        response.status(201).send(`Group ID ${results.rows[0].group_id} added!`)
    })
}

// DELETE methods

const deleteWhitelistGroupId = async (request, response) => {
    const group_id = request.params.group_id
  
    await pool.query('DELETE FROM Whitelist WHERE group_id = $1 RETURNING group_id', [group_id], (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).send(`Group ID ${results.rows[0].group_id} deleted!`)
    })
}

// Canvas Functions

// GET methods

const getLatestCanvas = async (request, response) => {
    await pool.query('SELECT * FROM Canvas ORDER BY last_updated DESC LIMIT 1', (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows)
    })
}

const getCanvasByTelegramId = async (request, response) => {
    const telegram_id = request.params.telegram_id

    await pool.query('SELECT * FROM Canvas WHERE telegram_id = $1 ORDER BY last_updated DESC', [telegram_id], (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows)
    })
}

// POST methods

const addCanvas = async (request, response) => {
    const telegram_id = request.query.telegram_id
    const bitfield = request.query.bitfield

    await pool.query('INSERT INTO Canvas (telegram_id, bitfield) VALUES ($1, $2) RETURNING telegram_id', [telegram_id, bitfield], (error, results) => {
        if (error) {
            throw error
        }
        response.status(201).send(`Canvas by ${results.rows[0].telegram_id} added!`)
    })
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
