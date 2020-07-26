const ColorBinary = {
    WHITE: "0000",
    GREY: "0001",
    BLACK: "0010",
    BROWN: "0011",
    BEIGE: "0100",
    YELLOW: "0101",
    ORANGE: "0110",
    RED: "0111",
    MAROON: "1000",
    PINK: "1001",
    PURPLE: "1010",
    NAVY: "1011",
    BLUE: "1100",
    SKY: "1101",
    GREEN: "1110",
    FOREST: "1111"
};

// const Color = {
//     "0000": "WHITE",
//     "0001": "SILVER",
//     "0010": "GREY",
//     "0011": "BLACK",
//     "0100": "RED",
//     "0101": "MAROON",
//     "0110": "BROWN",
//     "0111": "ORANGE",
//     "1000": "YELLOW",
//     "1001": "GREEN",
//     "1010": "LIME",
//     "1011": "CYAN",
//     "1100": "BLUE",
//     "1101": "NAVY",
//     "1110": "PURPLE",
//     "1111": "PINK"
// };

// const ColorRGB = {
//     WHITE: [255, 255, 255],
//     SILVER: [192, 192, 192],
//     GREY: [128, 128, 128],
//     BLACK: [0, 0, 0],
//     RED: [255, 0, 0],
//     MAROON: [128, 0, 0],
//     BROWN: [128, 64, 0],
//     ORANGE: [255, 165, 0],
//     YELLOW: [255, 255, 0],
//     GREEN: [0, 128, 0],
//     LIME: [0, 255, 0],
//     CYAN: [0, 255, 255],
//     BLUE: [0, 0, 255],
//     NAVY: [0, 0, 128],
//     PURPLE: [128, 0, 128],
//     PINK: [255, 0, 255]
// }

const ColorRGB = {
    WHITE: [255, 255, 255],
    GREY: [165, 165, 165],
    BLACK: [0, 0, 0],
    // BROWN: [131, 50, 0],
    BROWN: [100, 40, 0],
    BEIGE: [255, 190, 142],
    YELLOW: [255, 222, 0],
    ORANGE: [255, 122, 29],
    RED: [255, 0, 0],
    // MAROON: [165, 0, 0],
    MAROON: [175, 0, 0],
    PINK: [255, 100, 230],
    // PURPLE: [135, 57, 216],
    PURPLE: [150, 30, 215],
    NAVY: [0, 0, 128],
    BLUE: [17, 22, 255],
    SKY: [79, 221, 255],
    GREEN: [0, 235, 20],
    FOREST: [7, 77, 0],
}

const ColorDecimal = {
    WHITE: 0,
    GREY: 1,
    BLACK: 2,
    BROWN: 3,
    BEIGE: 4,
    YELLOW: 5,
    ORANGE: 6,
    RED: 7,
    MAROON: 8,
    PINK: 9,
    PURPLE: 10,
    NAVY: 11,
    BLUE: 12,
    SKY: 13,
    GREEN: 14,
    FOREST: 15
};

const ColorIndex = Object.keys(ColorRGB);

let ColorRGBToBinary = {};

const binaryValues = Object.values(ColorBinary);
const rgbValues = Object.values(ColorRGB);

for (let i = 0; i < binaryValues.length; i++) {
    ColorRGBToBinary[rgbValues[i]] = binaryValues[i];
}

module.exports = { ColorBinary, ColorRGB, ColorDecimal, ColorRGBToBinary, ColorIndex };
