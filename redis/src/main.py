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


class Canvas:
    width: int = None
    height: int = None

    bitfield: str = None

    def __init__(self, width, height):
        self.width = width
        self.height = height
        self._fill_with_white_pixels()

    def update_pixel(self, pixel_x_coordinate: int, pixel_y_coordinate: int, color: Color) -> None:
        height_index_offset = ((pixel_y_coordinate - 1) * CANVAS_WIDTH)
        end_index = (height_index_offset + pixel_x_coordinate) * BITS_PER_PIXEL
        start_index = end_index - BITS_PER_PIXEL
        self.bitfield = "".join([self.bitfield[:start_index], color.value, self.bitfield[end_index:]])

    def to_string(self) -> str:
        return self.bitfield

    def _fill_with_white_pixels(self) -> None:
        one_pixel = Color.WHITE.value * BITS_PER_PIXEL
        self.bitfield = one_pixel * self.width * self.height


def initialize_canvas(canvas_width: int, canvas_height: int) -> Canvas:
    return Canvas(canvas_width, canvas_height)


if __name__ == "__main__":
    canvas = initialize_canvas(CANVAS_WIDTH, CANVAS_HEIGHT)
    print(canvas.to_string())
    canvas.update_pixel(pixel_x_coordinate=1, pixel_y_coordinate=1, color=Color.GREY)
    print(canvas.to_string())
