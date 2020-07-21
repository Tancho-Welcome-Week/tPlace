const keys = require("../keys.js");
// Use the constant below if running from Docker
const REDIS_HOST_ADDRESS_DOCKER = "redis";

// Use the constant below if running as standalone
const REDIS_HOST_ADDRESS_STANDALONE = "localhost";

const REDIS_HOST_PORT = 6379;

const CANVAS_NAME = "tPlace canvas";
const PIXEL_FORMAT = "u4";
const CANVAS_HEIGHT = 2;
const CANVAS_WIDTH = 2;

const REDIS_CONFIG_FILE = {
  port: REDIS_HOST_PORT,
  host: keys.redisHost,
  // host      : REDIS_HOST_ADDRESS,
  // host      : REDIS_HOST_ADDRESS_STANDALONE,
  return_buffers: true,
};

const Color = {
  WHITE: "0000",
  BEIGE: "0001",
  CREAM: "0010",
  YELLOW: "0011",
  ORANGE: "0100",
  RED: "0101",
  MAROON: "0110",
  VIOLET: "0111",
  INDIGO: "1000",
  BLUE: "1001",
  TURQUOISE: "1010",
  OLIVE: "1011",
  GREEN: "1100",
  LIME: "1101",
  GREY: "1110",
  BLACK: "1111",
};

const ColorDecimal = {
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
  BLACK: 15,
};

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
  const heightIndexOffset =
    convertOneIndexToZeroIndex(pixelYCoordinate) * canvasWidth;
  const widthIndexOffset = convertOneIndexToZeroIndex(pixelXCoordinate);
  const totalOffset = heightIndexOffset + widthIndexOffset;
  return "#" + totalOffset;
}

module.exports = {
  REDIS_CONFIG_FILE,
  calculateOffset,
  Color,
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  CANVAS_NAME,
  PIXEL_FORMAT,
};
