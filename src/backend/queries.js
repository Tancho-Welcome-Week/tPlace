const { Pool } = require("pg");
// Move to seperate file with restricted permissions after testing, make sure details match
const pool = new Pool({
    user: 'admin',
    host: 'localhost',
    database: 'tPlace',
    password: 'tPlace2020',
    port: 5432,
  })

//Add better error handling & response messages
// User Functions

const createUser = async (request, response) => {
    const telegram_id = request.body.telegram_id

    await pool.query('INSERT INTO Users (telegram_id) VALUES ($1)', [telegram_id], (error, results) => {
        if (error) {
            throw error
        }
        response.status(201).send('User added!')
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

const setUserNotificationsByTelegramId = async (request, response) => {
    const telegram_id = request.params.telegram_id
    const notifications = request.params.notifications

    await pool.query('UPDATE Users SET notifcations = $2 WHERE telegram_id = $1', [telegram_id, notifications], (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).send('User notifications status updated!')
    })
}

const getAllUsers = async (request, response) => {
    await pool.query('SELECT * FROM Users ORDER BY telegram_id DESC', (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows)
    })
}

const deleteUserByTelegramId = async (request, response) => {
    const telegram_id = request.params.telegram_id
  
    await pool.query('DELETE FROM Users WHERE telegram_id = $1', [telegram_id], (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).send('User deleted!')
    })
}

// Add additional details based on how this function will be used (Based on fixed time distance and update all users together?)
const incrementUserPixels = async (request, response) => {
    const telegram_id = request.params.telegram_id
  
    await pool.query('UPDATE Users SET accumulated_pixels = accumulated_pixels + 1 WHERE telegram_id = $1', [telegram_id], (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).send('User accumulated pixels incremented by 1!')
      }
    )
}

// Add additional check to ensure accumulated_pixels >= 0 (Check in backend but add additional check here if possible)
const decrementUserPixels = async (request, response) => {
    const telegram_id = request.params.telegram_id
  
    await pool.query('UPDATE Users SET accumulated_pixels = accumulated_pixels - 1, last_updated = NOW() WHERE telegram_id = $1', [telegram_id], (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).send('User accumulated pixels decremented by 1!')
      }
    )
}

// Whitelist Functions

const getWhitelistGroupIds = async (request, response) => {
    await pool.query('SELECT * FROM Whitelist', (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows)
    })
}

const addWhitelistGroupId = async (request, response) => {
    const group_id = request.body.group_id

    await pool.query('INSERT INTO Whitelist (group_id) VALUES ($1)', [group_id], (error, results) => {
        if (error) {
            throw error
        }
        response.status(201).send('Group ID added!')
    })
}

const deleteWhitelistGroupId = async (request, response) => {
    const group_id = request.params.group_id
  
    await pool.query('DELETE FROM Whitelist WHERE group_id = $1', [group_id], (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).send('Group ID deleted!')
    })
}

// Canvas Functions

// Exports

module.exports = {
    createUser: createUser,
    //getUserByTelegramId: getUserByTelegramId,
    getUsersWithNotifications: getUsersWithNotifications,
    setUserNotificationsByTelegramId: setUserNotificationsByTelegramId,
    getAllUsers: getAllUsers,
    deleteUserByTelegramId: deleteUserByTelegramId,
    incrementUserPixels: incrementUserPixels,
    decrementUserPixels: decrementUserPixels,
    getWhitelistGroupIds: getWhitelistGroupIds,
    addWhitelistGroupId: addWhitelistGroupId,
    deleteWhitelistGroupId: deleteWhitelistGroupId
}
