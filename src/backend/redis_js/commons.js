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
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  CANVAS_NAME,
  PIXEL_FORMAT,
};
