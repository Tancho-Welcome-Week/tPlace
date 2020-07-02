from enum import Enum


REDIS_HOST_ADDRESS = "localhost"
REDIS_HOST_PORT = 6379

CANVAS_NAME = "tPlace canvas"
PIXEL_FORMAT = 'u4'
CANVAS_HEIGHT = 5
CANVAS_WIDTH = 5


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


def convert_one_index_to_zero_index(index_to_convert: int) -> int:
    """
    Converts a 1-indexed value to its 0-indexed counterpart.
    :param index_to_convert: The 1-indexed value to convert.
    :return: Returns the corresponding 0-indexed value.
    """
    return index_to_convert - 1


def convert_zero_index_to_one_index(index_to_convert: int) -> int:
    """
    Converts a 0-indexed value to its 1-indexed counterpart.
    :param index_to_convert: The 0-indexed value to convert.
    :return: Returns the corresponding 1-indexed value.
    """
    return index_to_convert + 1




