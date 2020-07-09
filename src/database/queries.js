const Pool = require('pg').Pool

// Move to seperate file with restricted permissions after testing, make sure details match
const pool = new Pool({
  user: 'localhost',
  host: 'localhost',
  database: 'tPlace',
  password: 'hydrohomies',
  port: 5432,
})

// TODO: Change to async functions if necessary after testing
// User Functions

const createUser = (request, response) => {
    const { telegram_id } = request.body

    pool.query('INSERT INTO Users (telegram_id) VALUES ($1)', [telegram_id], (error, results) => {
        if (error) {
            throw error
        }
        response.status(201).send('User added!')
    })
}

const getUserByTelegramId = (request, response) => {
    const telegram_id = parseInt(request.params.telegram_id)
  
    pool.query('SELECT * FROM Users WHERE telegram_id = $1', [telegram_id], (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows)
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
    const telegram_id = parseInt(request.params.telegram_id)
  
    pool.query('DELETE FROM Users WHERE telegram_id = $1', [telegram_id], (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).send('User deleted!')
    })
}

// Add additional details based on how this function will be used (Based on fixed time distance and update all users together?)
const incrementUserPixels = (request, response) => {
    const telegram_id = parseInt(request.params.telegram_id)
  
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
    const telegram_id = parseInt(request.params.telegram_id)
  
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
    const { group_id } = request.body

    pool.query('INSERT INTO Whitelist (group_id) VALUES ($1)', [group_id], (error, results) => {
        if (error) {
            throw error
        }
        response.status(201).send('Group ID added!')
    })
}

const deleteWhitelistGroupId = (request, response) => {
    const group_id = parseInt(request.params.group_id)
  
    pool.query('DELETE FROM Whitelist WHERE group_id = $1', [group_id], (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).send('Group ID deleted!')
    })
}

// Canvas Functions