const keys = require("../keys.js");

const REDIS_CONFIG_FILE = {
    port: keys.redisPort,
    host: keys.redisHost,
    return_buffers: true,
};


/**
 * Defines the retry strategy for the Redis client. A connection will be re-attempted until one of the following
 * failure conditions is met:
 * - Connection refused by the server.
 * - Total retry time exceeds 5 minutes.
 * - Total retry attempts exceed 10.
 * The client will attempt to connect to the server with increasing delay between attempts until it succeeds or reaches
 * a failure condition.
 * @param options An object indicating feedback from the connection attempt.
 * @returns {number|Error} Returns a number if a connection is to be re-attempted, and an Error if a failure condition
 * is met.
 */
const RETRY_STRATEGY_FUNCTION = function(options) {
    if (options.error && options.error.code === "ECONNREFUSED") {
        // End reconnecting on a specific error and flush all commands with an error
        return new Error("The server refused the connection");
    }
    if (options.total_retry_time > 1000 * 60 * 5) {
        // End all attempts at reconnecting after 5 minutes and flush all commands with an error
        return new Error("Retry time exhausted");
    }
    if (options.attempt > 10) {
        // End reconnecting after more than 10 failed attempts
        return new Error("Maximum number of connection attempts exceeded.");
    }
    // else, attempt to reconnect after n-hundred milliseconds, or 1 second, whichever is less
    return Math.min(options.attempt * 100, 1000);
}


/**
 * Converts a 1-indexed value to its 0-indexed counterpart.
 * @param indexToConvert The 1-indexed value to convert.
 */
function convertOneIndexToZeroIndex(indexToConvert) {
    return indexToConvert - 1;
}

/**
 * Calculates the required offset of the chosen pixel, given the x and y coordinates of the pixel. Both coordinates
 * must be entered in 1-indexed form (i.e. smallest coordinate value is 1, not 0).
 * @param pixelXCoordinate The x-coordinate of the pixel, 1-indexed.
 * @param pixelYCoordinate The y-coordinate of the pixel, 1-indexed.
 * @param canvasWidth The width of the canvas, in pixels.
 * @returns {string} Returns a formatted offset string for use in Redis.
 */
function calculateOffset(pixelXCoordinate, pixelYCoordinate, canvasWidth) {
    const heightIndexOffset = convertOneIndexToZeroIndex(pixelYCoordinate) * canvasWidth;
    const widthIndexOffset = convertOneIndexToZeroIndex(pixelXCoordinate);
    const totalOffset = heightIndexOffset + widthIndexOffset;
    return "#" + totalOffset;
}

module.exports = {
    REDIS_CONFIG_FILE,
    RETRY_STRATEGY_FUNCTION,
    calculateOffset
};
