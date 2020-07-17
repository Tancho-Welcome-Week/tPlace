



// Use the constant below if running from Docker
const REDIS_HOST_ADDRESS = "redis";

// Use the constant below if running as standalone
const REDIS_HOST_ADDRESS_STANDALONE = "localhost";

const REDIS_HOST_PORT = 6379;

const CANVAS_NAME = "tPlace canvas";
const PIXEL_FORMAT = 'u4';
const CANVAS_HEIGHT = 5;
const CANVAS_WIDTH = 5;

const REDIS_CONFIG_FILE = {
    port      : REDIS_HOST_PORT,
    host      : REDIS_HOST_ADDRESS_STANDALONE
};

const Color = {
    WHITE: 0,
    BEIGE: 1,
    CREAM: 2,
    YELLOW: 3,
    ORANGE: 4,
    RED: 5,
    MAROON: 6,
    VIOLET: 7,
    INDIGO: 8,
    BLUE: 9,
    TURQUOISE: 10,
    OLIVE: 11,
    GREEN: 12,
    LIME: 13,
    GREY: 14,
    BLACK: 15
};

/**
 * Converts a 1-indexed value to its 0-indexed counterpart.
 * @param indexToConvert The 1-indexed value to convert.
 */
function convertOneIndexToZeroIndex(indexToConvert) {
    return indexToConvert - 1;
}

/**
 * Converts a 0-indexed value to its 1-indexed counterpart.
 * @param indexToConvert The 0-indexed value to convert.
 */
function convertZeroIndexToOneIndex(indexToConvert) {
    return indexToConvert + 1;
}

module.exports = { REDIS_CONFIG_FILE };

