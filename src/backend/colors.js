
const ColorBinary = {
    WHITE: "0000",
    SILVER: "0001",
    GREY: "0010",
    BLACK: "0011",
    RED: "0100",
    MAROON: "0101",
    BROWN: "0110",
    ORANGE: "0111",
    YELLOW: "1000",
    GREEN: "1001",
    LIME: "1010",
    CYAN: "1011",
    BLUE: "1100",
    NAVY: "1101",
    PURPLE: "1110",
    PINK: "1111"
};

const ColorRGB = {
    WHITE: [255, 255, 255],
    SILVER: [192, 192, 192],
    GREY: [128, 128, 128],
    BLACK: [0, 0, 0],
    RED: [255, 0, 0],
    MAROON: [128, 0, 0],
    BROWN: [128, 64, 0],
    ORANGE: [255, 165, 0],
    YELLOW: [255, 255, 0],
    GREEN: [0, 128, 0],
    LIME: [0, 255, 0],
    CYAN: [0, 255, 255],
    BLUE: [0, 0, 255],
    NAVY: [0, 0, 128],
    PURPLE: [128, 0, 128],
    PINK: [255, 0, 255]
}

const ColorDecimal = {
    WHITE: 0,
    SILVER: 1,
    GREY: 2,
    BLACK: 3,
    RED: 4,
    MAROON: 5,
    BROWN: 6,
    ORANGE: 7,
    YELLOW: 8,
    GREEN: 9,
    LIME: 10,
    CYAN: 11,
    BLUE: 12,
    NAVY: 13,
    PURPLE: 14,
    PINK: 15
};

let ColorRGBToBinary = {};

const binaryValues = Object.values(ColorBinary);
const rgbValues = Object.values(ColorRGB);

for (let i = 0; i < binaryValues.length; i++) {
    ColorRGBToBinary[rgbValues[i]] = binaryValues[i];
}

module.exports = { ColorBinary, ColorRGB, ColorDecimal, ColorRGBToBinary };
