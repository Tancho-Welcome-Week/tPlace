const queries = require("./queries")
const { Pool } = require("pg");

const pool = new Pool({
    user: 'admin',
    host: 'localhost',
    database: 'tPlace',
    password: 'tPlace2020',
    port: 5432,
})

const authenticateChatId = async (chatId) => {
    const id = await pool.query('SELECT * FROM Whitelist', (error, results) => {
        if (error) {
            throw error
        }
    })
    return !!id
}