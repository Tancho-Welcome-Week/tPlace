from enum import Enum

"""
Functions that need to be implemented:
initialize_canvas(canvas_width, canvas_height) -> initializes a CANVAS_WIDTH * CANVAS_HEIGHT canvas of zeroes
get_canvas() -> returns whole canvas, as a bitfield
update_pixel(row, column) -> updates 4-bit value in required row and column

Current state: Naive Python representation of possible methods to implement. As of now, the required data is stored in
the 'bitfield' attribute of the Canvas class. This should be replaced with a Redis equivalent.
"""

"""TODO: Implement Redis, change Python bitfield to Redis bitfield. Store user data in Redis as well."""


CANVAS_WIDTH = 5
CANVAS_HEIGHT = 5
BITS_PER_PIXEL = 4


class Color(Enum):
    WHITE = "0000"
    BEIGE = "0001"
    CREAM = "0010"
    YELLOW = "0011"
    ORANGE = "0100"
    RED = "0101"
    MAROON = "0110"
    VIOLET = "0111"
    INDIGO = "1000"
    BLUE = "1001"
    TURQUOISE = "1010"
    OLIVE = "1011"
    GREEN = "1100"
    LIME = "1101"
    GREY = "1110"
    BLACK = "1111"
