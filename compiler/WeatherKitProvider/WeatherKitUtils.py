import pytz
from datetime import datetime

from .translations import wkcc_to_human
from .translations import wkcc_to_weathericons_class
from .translations import wkcc_to_weathericons_char
from .translations import wkcc_to_precipitable


class WeatherKitUtils:
    """
    Utility class to subclass everything else
    """
    def __init__(self):
        pass

    def translate_bearing(self, bearing: float) -> str:
        """
        Translates a bearing into a direction with a weather icon
        :param bearing: A wind bearing from 0 to 359.99 indicating the direction the wind is blowing from.
        :return: A string with a weather icons char code for an icon.
        """
        if bearing < 22.5:
            return u"\uf044"
        elif bearing < 67.5:
            return u"\uf043"
        elif bearing < 112.5:
            return u"\uf048"
        elif bearing < 157.5:
            return u"\uf087"
        elif bearing < 202.5:
            return u"\uf058"
        elif bearing < 247.5:
            return u"\uf057"
        elif bearing < 292.5:
            return u"\uf04d"
        elif bearing < 337.5:
            return u"\uf088"
        else:
            return u"\uf044"

    def translatecondcode_humantext(self, condcode: str, type: str = "uppercase"):
        """
        Translates a WeatherKit condition code into human-readable text.
        :param condcode: A WeatherKit condition code string.
        :param type: Type to return - either all "uppercase" (default), "partial" for partial uppercase, "lowercase"
        for all lowercase.
        :return: A human-readable representation of the icon.
        :raises KeyError: The condition code inputted isn't in the translation table for condition codes.
        """
        return wkcc_to_human[condcode][type]

    def translateicon_wicons(self, condcode: str, context: str = "day"):
        """
        Translates a WeatherKit condition code into a Weather Icons character code.
        :param condcode: A WeatherKit condition code string.
        :param context: The context for the icon - either day or night. This is used for some icons. Defaults to day.
        :return: A Weather Icons character code corresponding to the condition code.
        :raises KeyError: The condition code inputted isn't in the translation table for condition codes.
        """
        try:
            return wkcc_to_weathericons_char[condcode][context]
        except (KeyError, TypeError):
            return wkcc_to_weathericons_char[condcode]

    def translateicon_wicons_class(self, condcode: str, context: str = "day"):
        """
        Translates a WeatherKit condition code into a Weather Icons CSS class.
        :param condcode: A WeatherKit condition code string.
        :param context: The context for the icon - either day or night. This is used for some icons. Defaults to day.
        :return: A CSS class corresponding to the condition code.
        :raises KeyError: The condition code inputted isn't in the translation table for condition codes.
        """
        try:
            return wkcc_to_weathericons_class[condcode][context]
        except (KeyError, TypeError):
            return wkcc_to_weathericons_class[condcode]

    def translateprecipcode_wicons(self, precipcode: str, preciprate: float):
        """
        Translates a WeatherKit PrecipitationType code into a weather icons u icon string.
        :param precipcode: The precipitation code
        :param preciprate: The precipitation rate, in millimeters/hr
        :return: A weather icons u-string
        """
        if precipcode == "clear":
            return u"\uf00d"
        elif precipcode == "precipitation":
            return u"\uf019"
        elif precipcode == "rain":
            if preciprate < 0.01:
                return u"\uf01c"
            elif preciprate < 0.05:
                return u"\uf01a"
            else:
                return u"\uf019"
        elif precipcode == "snow":
            return u"\uf01b"
        elif preciprate == "sleet":
            return u"\uf0b5"
        elif preciprate == "hail":
            return u"\uf015"
        elif preciprate == "mixed":
            return u"\uf017"

    def unix_to_iso8601(self, unixts: int) -> str:
        """
        Translates a UNIX timestamp to a ISO 8601 timestamp WeatherKit can understand
        :param unixts: A UNIX timestamp
        :return: A ISO 8601 timestamp WeatherKit can understand.
        """
        wk_tz = pytz.timezone("UTC")
        formatted_iso8601 = datetime.fromtimestamp(unixts, wk_tz).isoformat()
        formatted_iso8601 = formatted_iso8601.replace("+00:00", "Z")
        return formatted_iso8601

    def iso8601_to_unix(self, iso8601: str) -> int:
        """
        Translates a WeatherKit-specific ISO 8601 timestamp into a UNIX timestamp.
        :param iso8601: An ISO 8601 timestamp from WeatherKit
        :return: A UNIX timestamp as an integer.
        """
        iso8601 = iso8601.replace("Z", "+00:00")
        utc_dt = datetime.fromisoformat(iso8601)
        return int(utc_dt.timestamp())

    # A lot of these methods are to translate WK units -> units that DS uses
    def mmphr_to_inphr(self, mmphr: float) -> float:
        """
        Converts from millimeters per hour to inches per hour.
        :param mmphr: A precip rate in millimeters per hour
        :return: A precip rate in inches per hour
        """
        return mmphr / 25.4

    def c_to_f(self, c: float) -> float:
        """
        Converts a temperature from celsius to degrees
        :param c: A temperature in celsius
        :return: A temperature in fahrenheit
        """
        return (c * (9/5)) + 32

    def kph_to_mph(self, kph: float) -> float:
        """
        Converts from kilometers per hour to miles per hour (for wind units)
        :param kph: A speed in kilometers per hour
        :return: A speed in miles per hour
        """
        return kph / 1.609344

    def meters_to_miles(self, meters: float) -> float:
        """
        Converts from meters to miles (for visibility)
        :param meters: A distance in meters
        :return: A distance in miles
        """
        return meters / 1609.344

    def is_code_precipitable(self, condcode: str, context: str = "precip") -> bool:
        """
        Tells you if a WeatherKit condition code is precipitable or not
        :param condcode: A WeatherKit condition code
        :param context: Further context if needed for if the code is precipitable. Options are precip (default), rain,
        snow, and sleet. For instance, Rain would return True if context is precip or rain, but False for sleet or snow.
        :return: If that condition code is one associated with precipitation
        :raises KeyError: The condition code was not found in the translation table.
        """
        return wkcc_to_precipitable[condcode][context]