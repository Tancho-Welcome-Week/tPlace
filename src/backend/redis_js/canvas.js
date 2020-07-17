const redis = require("redis");
const config = require("./commons.js");


function getValue(redisClient, key) {
    return redisClient.get(key, redis.print);
}

function setValue(redisClient, key, value) {
    redisClient.set(key, value, redis.print);
}

const CONFIG_FILE = config.REDIS_CONFIG_FILE;

module.exports = { getValue, setValue, CONFIG_FILE };



const redisClient = redis.createClient(config.REDIS_CONFIG_FILE);
setValue(redisClient, "ping", "pung");
getValue(redisClient, "ping");
setValue(redisClient, "ping", "pong");
getValue(redisClient, "ping");



