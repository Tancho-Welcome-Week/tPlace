from enum import Enum
from logging import getLogger, StreamHandler
import redis


CANVAS_KEY = "tPlace canvas"
PIXEL_FORMAT = 'u4'
CANVAS_HEIGHT = 5
CANVAS_WIDTH = 5

logger = getLogger()


class Color(Enum):
    WHITE = 0
    BEIGE = 1
    CREAM = 2
    YELLOW = 3
    ORANGE = 4
    RED = 5
    MAROON = 6
    VIOLET = 7
    INDIGO = 8
    BLUE = 9
    TURQUOISE = 10
    OLIVE = 11
    GREEN = 12
    LIME = 13
    GREY = 14
    BLACK = 15


def format_offset(pixel_offset: int) -> str:
    return ''.join(['#', str(pixel_offset)])


def calculate_offset(pixel_x_coordinate: int, pixel_y_coordinate: int, canvas_width: int) -> str:
    height_index_offset = ((pixel_y_coordinate - 1) * canvas_width)
    width_index_offset = pixel_x_coordinate - 1
    offset = format_offset(height_index_offset + width_index_offset)
    return offset


class Canvas:
    width: int = None
    height: int = None
    redis_connection = None

    def __init__(self, width, height):
        self.width = width
        self.height = height
        self.redis_connection = redis.Redis(host='localhost', port=6379, db=0)
        self._fill_with_white_pixels()

    def update_pixel(self, pixel_x_coordinate: int, pixel_y_coordinate: int, color: Color) -> None:
        offset = calculate_offset(pixel_x_coordinate, pixel_y_coordinate, self.width)
        logger.info("Setting pixel color at offset {} to color {}".format(offset, color.value))
        self.redis_connection.bitfield(key=CANVAS_KEY).set(fmt=PIXEL_FORMAT, offset=offset, value=color.value)\
            .execute()

    def to_string(self) -> str:
        bitfield_string = ""
        for y_coordinate in range(self.height):
            for x_coordinate in range(self.width):
                offset = calculate_offset(x_coordinate + 1, y_coordinate + 1, self.width)
                logger.debug("Printing pixel at offset {}".format(offset))
                next_pixel_value = self.redis_connection.bitfield(key=CANVAS_KEY).get(fmt=PIXEL_FORMAT, offset=offset)\
                    .execute()
                bitfield_string = "".join([bitfield_string, str(next_pixel_value)])
            bitfield_string = "".join([bitfield_string, "\n"])
        return bitfield_string

    def get_pixel_color(self, pixel_x_coordinate: int, pixel_y_coordinate: int) -> int:
        offset = calculate_offset(pixel_x_coordinate, pixel_y_coordinate, self.width)
        pixel_value = self.redis_connection.bitfield(key=CANVAS_KEY).get(fmt=PIXEL_FORMAT, offset=offset).execute()
        logger.info("Getting pixel color at offset {}: color {}".format(offset, pixel_value))
        return pixel_value

    def _fill_with_white_pixels(self) -> None:
        total_pixel_count = self.width * self.height
        for i in range(total_pixel_count):
            offset = format_offset(i)
            logger.debug("Clearing pixel at offset: {}".format(offset))
            self.redis_connection.bitfield(key=CANVAS_KEY).set(fmt=PIXEL_FORMAT, offset=offset, value=0).execute()


if __name__ == "__main__":
    logger.addHandler(StreamHandler())
    logger.setLevel(level="INFO")
    # logger.setLevel(level="DEBUG")
    canvas = Canvas(width=CANVAS_WIDTH, height=CANVAS_HEIGHT)
    print(canvas.to_string())
    canvas.update_pixel(1, 2, Color.CREAM)
    canvas.update_pixel(1, 1, Color.BLACK)
    canvas.update_pixel(3, 4, Color.RED)
    print(canvas.to_string())
