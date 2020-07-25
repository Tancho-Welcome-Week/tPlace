const redis = require("redis");
const commons = require("./commons.js");
const color = require("../colors.js");


class RedisManager {

    /**
     * Constructs a RedisManager object. RedisManager forms a connection to a local Redis server (which must already be
     * running) via the address and port number specified in commons.REDIS_CONFIG_FILE. To simplify this use case, each
     * RedisManager object can only handle one object in Redis, specified with the 'key' argument. Should a separate
     * object need to be accessed, a separate RedisManager object should be created for that object instead.
     * @param key The key name of the object to be accessed via this RedisManager object.
     */
    constructor(key) {
        this.key = key;
        // this.redisClient = redis.createClient({
        //     config: commons.REDIS_CONFIG_FILE,
        //     retry_strategy: commons.RETRY_STRATEGY_FUNCTION
        // });
        this.redisClient = redis.createClient(commons.REDIS_CONFIG_FILE);
    }

    /**
     * Initializes a Canvas within the Redis server. The Canvas is a single bitfield, stored as the key name specified
     * in the constructor of this object. This bitfield will contain a total of (width * height) pixels, and each pixel
     * will contain the number of bits specified in the pixel_format argument of this method. All initialized pixels
     * will be colored with the default color assigned to a string of zeroes. To ensure consistency between methods,
     * the width, height, and pixel format of the Canvas should be stored as constants, and their values should not be
     * changed over the course of accessing the Canvas. If their values are to be changed and the Canvas object is not
     * re-created, then some methods may not work as intended.
     * @param canvas_width The width of the Canvas to be created, in pixels.
     * @param canvas_height The height of the Canvas to be created, in pixels.
     * @param pixel_format The format (e.g. 8-bit unsigned integer) of each pixel.
     */
    initializeCanvas(canvas_width, canvas_height, pixel_format) {
        this.width = canvas_width;
        this.height = canvas_height;
        this.format = pixel_format;
        this.setAreaValue(1, 1, this.width, this.height, color.Color.WHITE);
    }

    /**
     * THIS METHOD SHOULD ONLY BE USED FOR DEBUGGING; IT IS NOT PART OF THE USE CASE.
     * Prints the value of a specified pixel to the console. The pixel is uniquely specified via its x- and
     * y-coordinates, which must be specified as 1-based (i.e. the smallest possible value is 1, not 0).
     * Note that this implementation of the method does not return anything.
     * @param pixelXCoordinate The x-coordinate of the pixel to set, which must be specified as 1-based.
     * @param pixelYCoordinate The y-coordinate of the pixel to set, which must be specified as 1-based.
     */
    getValue(pixelXCoordinate, pixelYCoordinate) {
        const offset = commons.calculateOffset(pixelXCoordinate, pixelYCoordinate, this.width);
        this.redisClient.send_command("bitfield",[this.key, 'GET', this.format, offset], redis.print);
            // (error, result) => callback(error, result));
    }

    /**
     * Sets a given pixel to a specified color. The pixel is uniquely identified via its x- and y-coordinates, and the
     * color specified must be from the enumeration of Colors specified in the commons.js file. Both coordinates should
     * be specified as 1-based (i.e. the smallest possible value is 1, not 0).
     * @param pixelXCoordinate The x-coordinate of the pixel to set, which must be specified as 1-based.
     * @param pixelYCoordinate The y-coordinate of the pixel to set, which must be specified as 1-based.
     * @param value The color to set the pixel to, which must be a binary string in the enumeration of Colors.
     * @return No return value is expected.
     */
    setValue(pixelXCoordinate, pixelYCoordinate, value) {
        const offset = commons.calculateOffset(pixelXCoordinate, pixelYCoordinate, this.width);
        this.redisClient.send_command("bitfield",[this.key, 'SET', this.format, offset,
            parseInt(value, 2)]);
    }

    /**
     * Sets a given area of pixels to a specified color. The area is assumed to be rectangular, and is uniquely
     * identified by the coordinates of its top-left and bottom-right pixels. No error-checking is performed, so it is
     * up to the user to ensure that both specified pixels do not exceed the bounds of the canvas. The area will be set
     * to the color specified, with the boundary specified by the rectangle that touches and includes both corners.
     * @param topLeftXCoordinate The x-coordinate of the top-left pixel, which must be specified as 1-based.
     * @param topLeftYCoordinate The y-coordinate of the top-left pixel, which must be specified as 1-based.
     * @param bottomRightXCoordinate The x-coordinate of the bottom-right pixel, which must be specified as 1-based.
     * @param bottomRightYCoordinate The y-coordinate of the bottom-right pixel, which must be specified as 1-based.
     * @param color The Color to set the pixel to, which must be part of the enumeration of Colors.
     */
    setAreaValue(topLeftXCoordinate, topLeftYCoordinate, bottomRightXCoordinate, bottomRightYCoordinate, color) {
        for (let y = topLeftYCoordinate; y < bottomRightYCoordinate + 1; y++) {
            for (let x = topLeftXCoordinate; x < bottomRightXCoordinate + 1; x++) {
                this.setValue(x, y, color);
            }
        }
    }

    /**
     * Gets the entire Canvas object. This method returns a Promise, which contains an Unsigned Integer 8-bit array.
     * Although this array appears to group the values as 8-bit integers, this is only a visual aid and the underlying
     * bitfield is not affected. The entire bitfield can be accessed through Uint8Array methods. The two commented
     * methods below are meant for debugging purposes, and can be printed to visually verify the contents of the
     * bitfield. Additionally, since this method returns a Promise, it is up to the receiver to handle the resolution
     * of the Promise.
     * @returns {Promise<unknown>} A Promise object containing the bitfield data.
     */
    getCanvas() {
        return new Promise((ok, error) => {
            this.redisClient.get(new Buffer.from(this.key), (err, result) => {
                let uint8Array = new Uint8Array(result);
                // let hexString = res.toString('hex');
                // let binString = hex2bin(hexString);
                if (err) {
                    error(err);
                } else {
                    ok(uint8Array);
                }
            });
        }).catch((error) => { console.log(error) });
    }

    /**
     *              ***************************************************************************
     *              **  WARNING: DO NOT USE UNLESS YOU INTEND TO DELETE THE ACCESSED OBJECT  **
     *              ***************************************************************************
     * Deletes the object specified by the key in the constructor. Do not call this method unless you are sure that you
     * want to delete the object (e.g. in the course of testing).
     */
    deleteCanvas() {
        this.redisClient.del(this.key);
    }
}

module.exports = { RedisManager };



// function dec2bin(dec){
//     const binaryString = (dec >>> 0).toString(2);
//     const paddedString = ("0000" + binaryString).slice(-4);
//     return paddedString;
// }
//
// function callback(error, result) {
//     if (error) {
//         console.log(error);
//         throw error;
//     }
//     console.log(dec2bin(result));
// }
//
// function hex2bin(hex){
//     return (parseInt(hex, 16).toString(2));
// }




