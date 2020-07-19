const Pool = require('../backend/server').Pool


//Add better error handling & response messages
// User Functions

const createUser = (request, response) => {
    const telegram_id = request.body.telegram_id

    pool.query('INSERT INTO Users (telegram_id) VALUES ($1)', [telegram_id], (error, results) => {
        if (error) {
            throw error
        }
        response.status(201).send('User added!')
    })
}

const getUserByTelegramId = (request, response) => {
    const telegram_id = request.params.telegram_id
  
    pool.query('SELECT * FROM Users WHERE telegram_id = $1', [telegram_id], (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows)
    })
}

const getUserWithNotifications = (request, response) => {
    pool.query('SELECT * FROM Users WHERE notifications = TRUE', (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows)
    })
}

const setUserNotificationsByTelegramId = (request, response) => {
    const telegram_id = request.params.telegram_id
    const notifications = request.params.notifications

    pool.query('UPDATE Users SET notifcations = $2 WHERE telegram_id = $1', [telegram_id, notifications], (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).send('User notifications status updated!')
    })
}

const getAllUsers = (request, response) => {
    pool.query('SELECT * FROM Users ORDER BY telegram_id DESC', (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows)
    })
}

const deleteUserByTelegramId = (request, response) => {
    const telegram_id = request.params.telegram_id
  
    pool.query('DELETE FROM Users WHERE telegram_id = $1', [telegram_id], (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).send('User deleted!')
    })
}

// Add additional details based on how this function will be used (Based on fixed time distance and update all users together?)
const incrementUserPixels = (request, response) => {
    const telegram_id = request.params.telegram_id
  
    pool.query('UPDATE Users SET accumulated_pixels = accumulated_pixels + 1 WHERE telegram_id = $1', [telegram_id], (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).send('User accumulated pixels incremented by 1!')
      }
    )
}

// Add additional check to ensure accumulated_pixels >= 0 (Check in backend but add additional check here if possible)
const decrementUserPixels = (request, response) => {
    const telegram_id = request.params.telegram_id
  
    pool.query('UPDATE Users SET accumulated_pixels = accumulated_pixels - 1, last_updated = NOW() WHERE telegram_id = $1', [telegram_id], (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).send('User accumulated pixels decremented by 1!')
      }
    )
}

// Whitelist Functions

const getWhitelistGroupIds = (request, response) => {
    pool.query('SELECT * FROM Whitelist', (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows)
    })
}

const addWhitelistGroupId = (request, response) => {
    const group_id = request.body.group_id

    pool.query('INSERT INTO Whitelist (group_id) VALUES ($1)', [group_id], (error, results) => {
        if (error) {
            throw error
        }
        response.status(201).send('Group ID added!')
    })
}

const deleteWhitelistGroupId = (request, response) => {
    const group_id = request.params.group_id
  
    pool.query('DELETE FROM Whitelist WHERE group_id = $1', [group_id], (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).send('Group ID deleted!')
    })
}

// Canvas Functions

// Exports

module.export = {
    createUser,
    getUserByTelegramId,
    getUserWithNotifications,
    setUserNotificationsByTelegramId,
    getAllUsers,
    deleteUserByTelegramId,
    incrementUserPixels,
    decrementUserPixels,
    getWhitelistGroupIds,
    addWhitelistGroupId,
    deleteWhitelistGroupId
}
