const redis = require("redis");
const commons = require("./commons.js");


class RedisManager {
    constructor(key) {
        this.key = key;
        this.redisClient = redis.createClient(commons.REDIS_CONFIG_FILE);
    }

    initializeCanvas(canvas_width, canvas_height, pixel_format) {
        this.width = canvas_width;
        this.height = canvas_height;
        this.format = pixel_format;
        this.setAreaValue(1, 1, this.width, this.height, commons.Color.WHITE);
    }

    getValue(pixelXCoordinate, pixelYCoordinate) {
        const offset = commons.calculateOffset(pixelXCoordinate, pixelYCoordinate, this.width);
        this.redisClient.send_command("bitfield",[this.key, 'GET', this.format, offset], redis.print);
            // (error, result) => callback(error, result));
    }

    setValue(pixelXCoordinate, pixelYCoordinate, value) {
        const offset = commons.calculateOffset(pixelXCoordinate, pixelYCoordinate, this.width);
        this.redisClient.send_command("bitfield",[this.key, 'SET', this.format, offset,
            parseInt(value, 2)]);
    }

    setAreaValue(topLeftXCoordinate, topLeftYCoordinate, bottomRightXCoordinate, bottomRightYCoordinate, color) {
        for (let y = topLeftYCoordinate; y < bottomRightYCoordinate + 1; y++) {
            for (let x = topLeftXCoordinate; x < bottomRightXCoordinate + 1; x++) {
                this.setValue(x, y, color);
            }
        }
    }

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

    deleteCanvas() {
        this.redisClient.del(this.key);
    }
}


const redisManager = new RedisManager(commons.CANVAS_NAME);
redisManager.initializeCanvas(commons.CANVAS_WIDTH, commons.CANVAS_HEIGHT, commons.PIXEL_FORMAT);
redisManager.setValue(2, 2, commons.Color.RED);
redisManager.setValue(1, 1, commons.Color.BLUE);
// redisManager.getValue();
redisManager.getCanvas().then((result) => { console.log(result) });
redisManager.deleteCanvas();


module.exports = { RedisManager };


// const redisClient = redis.createClient(commons.REDIS_CONFIG_FILE);
// initializeCanvas(redisClient, commons.CANVAS_WIDTH, commons.CANVAS_HEIGHT, commons.CANVAS_NAME);
// setValue(redisClient, commons.CANVAS_NAME, 1, 1, '0001');
// setValue(redisClient, commons.CANVAS_NAME, 2, 1, '0010');
// setValue(redisClient, commons.CANVAS_NAME, 3, 1, '0011');
// setValue(redisClient, commons.CANVAS_NAME, 1, 2, '0100');
// setValue(redisClient, commons.CANVAS_NAME, 2, 2, '0101');
// setValue(redisClient, commons.CANVAS_NAME, 3, 2, '0110');
// setValue(redisClient, commons.CANVAS_NAME, 1, 3, '0111');
// setValue(redisClient, commons.CANVAS_NAME, 2, 3, '1000');
// setValue(redisClient, commons.CANVAS_NAME, 3, 3, '1001');
// setValue(redisClient, commons.CANVAS_NAME, 4, 4, '1111');
// for (let i = 0; i < (commons.CANVAS_WIDTH * commons.CANVAS_HEIGHT); i++) {
//     getValue(redisClient, commons.CANVAS_NAME, '#'+i);
// }

// getCanvas(redisClient, commons.CANVAS_NAME).then((result) => { console.log(result); });
//
// deleteCanvas(redisClient, commons.CANVAS_NAME);
//
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




