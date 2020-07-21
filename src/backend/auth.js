const queries = require("./queries");
const { Pool } = require("pg");
const keys = require("./keys.js");

const pool = new Pool({
    user: keys.pgUser,
    host: keys.pgHost,
    database: keys.pgDatabase,
    password: keys.pgPassword,
    port: keys.pgPort
})

const authenticateChatId = async (chatId) => {
    const id = await pool.query('SELECT * FROM Whitelist', (error, results) => {
        if (error) {
            throw error;
        }
    })
    console.log("TESTTEST" + chatId);
    return !!id;
}

module.exports = { authenticateChatId };
