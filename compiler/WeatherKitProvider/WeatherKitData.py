import time
import json
import math

from .WeatherKitUtils import WeatherKitUtils


class WeatherKitData(WeatherKitUtils):
    """
    A class to represent some WeatherKit Data.
    """

    def __init__(self, data):
        """
        Initializer.
        :param data: WeatherKit response JSON
        """
        super().__init__()
        self.data = data

    def dump_data(self, filename: str):
        """
        Dumps data from this WKP data object made into a JSON file.
        :param filename: The filename to dump data to
        :return: Nothing
        """
        with open(filename, "w") as f:
            json.dump(self.data, f)

    def get_currently(self, field: str = None):
        """
        Gets the current weather dataset
        :param field: The field to get from the current weather data. If not specified, the entire current weather
        dataset is returned.
        :return: The current weather dataset (currentWeather in the WK docs)
        :raises KeyError: The current weather dataset wasn't requested, or isn't available. The field, if specified,
        is invalid.
        """
        if field is not None:
            return self.data['currentWeather'][field]
        else:
            return self.data['currentWeather']

    def get_alerts(self, alert: int = None, field: str = None):
        """
        Gets the weather alerts dataset (but we're almost never seeing the dataset...)
        :param alert: The specific alert to get in the alerts array. If not specified, the entire alerts dataset is
        returned.
        :param field: The field from the alert to get. If not specified, the entire alert specified in the alert field
        is returned. If you specify field while not specifying alert, you will get the field from the top level alerts
        database.
        :return: The weather alerts dataset (weatherAlerts in the WK docs)
        :raises KeyError: The weather alerts dataset wasn't requested, or isn't available (when there's no alerts?).
        The alert number or field, if specified, is/are invalid.
        """
        if alert is not None and field is not None:
            return self.data['weatherAlerts']['alerts'][alert][field]
        elif alert is None and field is not None:
            return self.data['weatherAlerts'][field]
        elif alert is not None:
            return self.data['weatherAlerts']['alerts'][alert]
        else:
            return self.data['weatherAlerts']

    def get_minutely(self, minute: int = None, field: str = None):
        """
        Gets the minutely weather dataset
        :param minute: The specific minute to get in the minutes dataset. If not specified, the entire minutely dataset
        is returned.
        :param field: The field from the specific minute to get. If not specified, the entire minute specified is
        returned. If you specify field while not specifying minute, you will get the field from the top level minutely
        dataset.
        :return: The minutely (next hour) weather dataset (forecastNextHour in the WK docs)
        :raises KeyError: The minutely dataset wasn't requested, or isn't available for the location specified
        """
        if minute is not None and field is not None:
            return self.data['forecastNextHour']['minutes'][minute][field]
        elif minute is None and field is not None:
            return self.data['forecastNextHour'][field]
        elif minute is not None:
            return self.data['forecastNextHour']['minutes'][minute]
        else:
            return self.data['forecastNextHour']

    def get_hourly(self, hour: int = None, field: str = None):
        """
        Gets the hourly weather dataset
        :param hour: The specific hour to get in the hourly dataset. If not specified, the entire hourly dataset is
        returned.
        :param field: The field from the specific hour to get. If not specified, the entire hour specified is returned.
        If you specify field while not specifying hour, you will get the field from the top level hourly dataset.
        :return: The hourly weather dataset (forecastHourly in the WK docs)
        :raises KeyError: The hourly dataset wasn't rqeuested, or isn't available for the location specified
        """
        if hour is not None and field is not None:
            return self.data['forecastHourly']['hours'][hour][field]
        elif hour is None and field is not None:
            return self.data['forecastHourly'][field]
        elif hour is not None:
            return self.data['forecastHourly']['hours'][hour]
        else:
            return self.data['forecastHourly']

    def get_daily(self, day: int = None, field: str = None):
        """
        Gets the daily weather dataset
        :param day: The specific day to get in the daily dataset. If not specified, the entire daily dataset is
        returned.
        :param field: The field from the specific day to get. If not specified, the entire day specified is returned.
        If you specify field while not specifying day, you will get the field from the top level daily dataset.
        :return: The daily weather dataset (forecastDaily in the WK docs)
        :raises KeyError: The hourly dataset wasn't requested, or isn't available for the location specified
        """
        if day is not None and field is not None:
            return self.data['forecastDaily']['days'][day][field]
        elif day is None and field is not None:
            return self.data['forecastDaily'][field]
        elif day is not None:
            return self.data['forecastDaily']['days'][day]
        else:
            return self.data['forecastDaily']

    def get_current_hourly_indice(self, ts: int = int(time.time())):
        """
        "Internal" method to look at the hourly forecast and tell you which indice is the one representing
        the current hour. "Internal" in quotes since it's useful in other places.

        Add +1 to get the indice for the next hour
        :param ts: The reference time (defaults to the current time)
        :return: The indice that represents the current hour in the hourly forecast
        """
        current_time = ts
        closest_idx = -1
        closest_delta = 2592000
        for idx, hour in enumerate(self.get_hourly()['hours']):
            hour_time = self.iso8601_to_unix(hour['forecastStart'])
            if abs(hour_time - current_time < closest_delta):
                closest_idx = idx
                closest_delta = abs(hour_time - current_time)

        return closest_idx

    def get_sunrise_time(self, day: int) -> int:
        """
        Gets the sunrise of the day specified as a unix integer.
        :param day: The day to get the sunrise for (indice from daily)
        :return: The sunrise time, if available, as a UNIX timestamp
        :raises KeyError: The daily dataset isn't part of the data, or the day requested does not have a sunrise.
        """
        return self.iso8601_to_unix(self.get_daily(day=day, field="sunrise"))

    def get_sunset_time(self, day: int):
        """
        Gets the sunset of the day specified as a unix integer.
        :param day: The day to get the sunset for (indice from daily)
        :return: The sunset time, if available, as a UNIX timestamp
        :raises KeyError: The daily dataset isn't part of the data, or the day requested does not have a sunset.
        """
        return self.iso8601_to_unix(self.get_daily(day=day, field="sunset"))

    def get_maximum_wind_gust(self, indice: int) -> dict:
        """
        Gets the maximum wind gust (in MPH) for an indice of a day
        :param indice: The indice to cover
        :return: A dictionary with the values for the maximum wind gust and the UNIX timestamp for when it happened
        """
        day_start = self.iso8601_to_unix(self.get_daily()['days'][indice]['forecastStart'])
        day_end = self.iso8601_to_unix(self.get_daily()['days'][indice]['forecastEnd'])

        max_wind_gust = -1
        max_wind_gust_time = -1
        for hour in self.get_hourly()['hours']:
            if day_start <= self.iso8601_to_unix(hour['forecastStart']) <= day_end:
                if hour['windGust'] > max_wind_gust:
                    max_wind_gust = hour['windGust']
                    max_wind_gust_time = hour['forecastStart']

        return {
            "maxWindGust": self.kph_to_mph(max_wind_gust),
            "maxWindGustTs": self.iso8601_to_unix(max_wind_gust_time)
        }

    def get_daily_wind_data(self, indice: int) -> dict:
        """
        Gets wind data for a day - the
        :param indice: The day to get the wind conditions for
        :return: A dictionary with the day's wind directions and wind speed
        """

        u1 = math.sin(math.radians(self.get_daily(indice, "daytimeForecast")['windDirection']))
        v1 = math.cos(math.radians(self.get_daily(indice, "daytimeForecast")['windDirection']))
        s1 = self.get_daily(indice, "daytimeForecast")['windSpeed']

        u2 = math.sin(math.radians(self.get_daily(indice, "overnightForecast")['windDirection']))
        v2 = math.cos(math.radians(self.get_daily(indice, "overnightForecast")['windDirection']))
        s2 = self.get_daily(indice, "overnightForecast")['windSpeed']

        uf = (u1 + u2) / 2
        vf = (v1 + v2) / 2

        direction = math.degrees(math.atan(uf / vf))
        if direction < 0:
            direction += 360
        speed = (s1 + s2) / 2

        return {
            "direction": direction,
            "speed": speed
        }

    def _generate_precip_text(self, precip_amount, snowfall_amount, condcode, show_rain_precip_amount):
        """
        Private method to generate the precipitation text. It's private b/c it has a lot of business logic.

        :param precip_amount:
        :param snowfall_amount:
        :param condcode:
        :param show_rain_precip_amount:
        :return:
        """
        if self.is_code_precipitable(condcode, "rain"):
            if snowfall_amount > 0:
                if snowfall_amount < 25.4:
                    return " (with a chance of < 1 in. of snow)"
                else:
                    return f" (with a chance of ~{int(self.mmphr_to_inphr(snowfall_amount))} in. of snow)"
            else:
                # Cut it off at 0.05 in, we shouldn't show if it'll be (~0.0 in. of rain)
                if show_rain_precip_amount and precip_amount >= 0.05:
                    return f" (~{round(self.mmphr_to_inphr(precip_amount), 1)} in. of rain)"
                else:
                    return ""
        elif self.is_code_precipitable(condcode, "snow"):
            if snowfall_amount < 25.4:
                return " (< 1 in. of snow)"
            else:
                return f" (~{int(self.mmphr_to_inphr(snowfall_amount))} in. of snow)"
        else:
            return ""

    def _similar_cond_logic(self, daytime_cond: str, nighttime_cond: str) -> bool:
        """
        Private logic function to determine whether to roll certain cond codes together as if they're the same
        cond code.
        :param daytime_cond: The daytime condition code
        :param nighttime_cond: The nighttime condition code
        :return: A boolean indicating if the codes are similar
        """
        # The code here is kinda bad but this is on purpose so it's more readable.
        # Heavy Snow/Snow roll into one
        if (daytime_cond == "HeavySnow" or daytime_cond == "Snow") and (
                nighttime_cond == "Snow" or nighttime_cond == "HeavySnow"):
            return True
        # Snow and Flurries roll into one
        elif (daytime_cond == "Snow" or daytime_cond == "Flurries") and (
                nighttime_cond == "Snow" or nighttime_cond == "Flurries"):
            return True
        # Clear and Mostly Clear roll into one
        elif (daytime_cond == "Clear" or daytime_cond == "MostlyClear") and (
                nighttime_cond == "Clear" or nighttime_cond == "MostlyClear"):
            return True
        # Mostly Clear and Partly Cloudy roll into one
        elif (daytime_cond == "MostlyClear" or daytime_cond == "PartlyCloudy") and (
                nighttime_cond == "MostlyClear" or nighttime_cond == "PartlyCloudy"):
            return True
        # Partly Cloudy and Mostly Cloudy roll into one
        elif (daytime_cond == "PartlyCloudy" or daytime_cond == "MostlyCloudy") and (
                nighttime_cond == "PartlyCloudy" or nighttime_cond == "MostlyCloudy"):
            return True
        # Mostly Cloudy and Cloudy roll into one
        elif (daytime_cond == "MostlyCloudy" or daytime_cond == "Cloudy") and (
                nighttime_cond == "MostlyCloudy" or nighttime_cond == "Cloudy"):
            return True
        # Heavy Snow and Blizzard roll into one
        elif (daytime_cond == "HeavySnow" or daytime_cond == "Blizzard") and (
                nighttime_cond == "HeavySnow" or nighttime_cond == "Blizzard"):
            return True
        # Thunderstorm and Thunderstorms roll into one
        elif (daytime_cond == "Thunderstorm" or daytime_cond == "Thunderstorms") and (
                nighttime_cond == "Thunderstorm" or daytime_cond == "Thunderstorms"):
            return True

    def create_daily_summary(self, indice: int, show_rain_precip_amount: bool = False):
        """
        Tries to create a daily summary in the style of Dark Sky (assuming you have the forcastDaily dataset)

        We use WK's dailySummary and overnightSummary to determine what happened during the day and night.

        If there's the same condition code day & night, you get "(Condition) throughout the day."

        If they differ, you get "(Condition day) during the day, then (Condition night) overnight."

        If there's rain in the forecast at some point, you get "(Light/Heavy) Rain (~(amount to 1 decimal place) in.)
        ...rest of str"

        If there's snow in the forecast at some point, you get "(Light/Heavy) Snow (~(amount to 1 decimal place) in.)
        ...rest of str"
        :param indice: The indice to make the daily summary for
        :param show_rain_precip_amount: Whether to show the amount of precipitation for rain (True) or not (False)
        :return: A daily summary
        """
        daily_data = self.get_daily()['days'][indice]
        daytime_cond_code = daily_data['daytimeForecast']['conditionCode']
        nighttime_cond_code = daily_data['overnightForecast']['conditionCode']
        precip_amount = daily_data['precipitationAmount']
        snowfall_amount = daily_data['snowfallAmount']

        # TODO - This whole algorithm needs to get fixed
        # We're seeing cases where snowfall > 0 and rain > 0, but the actual condition code is...not.
        # So we're going to move this out of this method, make it private, and throw at it the is precipitable,
        # and two new translation tables to detect if it's a snowy type of precip or rainy type of precip
        # This will then allow us to do Freezing rain (with a chance of ~2 in. of snow) sorta stuff.

        if daytime_cond_code == nighttime_cond_code or self._similar_cond_logic(daytime_cond_code, nighttime_cond_code):
            if self.is_code_precipitable(daytime_cond_code):
                preciptext = self._generate_precip_text(precip_amount, snowfall_amount, daytime_cond_code, show_rain_precip_amount)
            else:
                preciptext = ""
            return f"{self.translatecondcode_humantext(daytime_cond_code, 'partial')}{preciptext} throughout the day."
        else:
            returnstr = f"{self.translatecondcode_humantext(daytime_cond_code, 'partial')}"
            if self.is_code_precipitable(daytime_cond_code):
                preciptext = self._generate_precip_text(precip_amount, snowfall_amount, daytime_cond_code, show_rain_precip_amount)
                returnstr += f"{preciptext} during the day, then {self.translatecondcode_humantext(nighttime_cond_code, 'lowercase')} overnight."
            elif self.is_code_precipitable(nighttime_cond_code):
                preciptext = self._generate_precip_text(precip_amount, snowfall_amount, nighttime_cond_code, show_rain_precip_amount)
                returnstr += f" during the day, then {self.translatecondcode_humantext(nighttime_cond_code, 'lowercase')}{preciptext} overnight."
            else:
                returnstr += f" during the day, then {self.translatecondcode_humantext(nighttime_cond_code, 'lowercase')} overnight."

            return returnstr

    def create_hourly_summary(self, debug: bool = False, cutoff: int = 79, chance_cutoff: float = 0.25,
                              rate_cutoff: float = 0.12):
        """
        Tries to create an hourly summary in the style of Dark Sky (assuming you have both the next hour & daily
        dataset). Precipitation is counted if the precip chance is greater than 25%, and the precip intensity is
        greater than 0.06 mm/hr. We try to figure out when we go above and over these thresholds to produce a summary
        like Dark Sky did.
        :param debug: If a daily summary could not be generated, a debug string is produced.
        :param cutoff: The minute indice to cut off at when generating summaries. Set to 59 if you want a summary for
        the hour. Defaults to 85.
        :param chance_cutoff: The precipitation chance to set as a cutoff to detect precipitation. Defaults to 0.25
        (25% precip chance)
        :param rate_cutoff: The precipitation rate to set as a cutoff to detect precipitation. Defaults to 0.06. The
        unit for this is mm/hr.
        :return: A text string depicting the hourly conditions.
        """

        # This is literally terrible code and I think it could use a nice redo.
        first_crossover_indice = -1
        first_crossunder_indice = -1
        second_crossover_indice = -1
        second_crossunder_indice = -1
        last_precip_chance = -1
        last_precip_rate = -1

        # First minute indice prediction

        for idx, minute in enumerate(self.get_minutely()['minutes']):
            if idx == 0:
                if minute['precipitationChance'] >= chance_cutoff and minute['precipitationIntensity'] >= rate_cutoff:
                    first_crossover_indice = 0
                else:
                    first_crossunder_indice = 0

                last_precip_chance = minute['precipitationChance']
                last_precip_rate = minute['precipitationIntensity']
                continue

            if idx > cutoff:
                continue

            if minute['precipitationChance'] >= chance_cutoff and minute['precipitationIntensity'] >= rate_cutoff:
                if last_precip_chance < chance_cutoff or last_precip_rate < rate_cutoff:
                    if first_crossover_indice == -1:
                        # If we are about to go over very early, we set FCU to -1 and FCO to 0 to pretend like we've
                        # always been above FCO
                        if first_crossunder_indice == 0 and idx <= 2:
                            first_crossunder_indice = -1
                            first_crossover_indice = 0
                        else:
                            first_crossover_indice = idx
                    elif second_crossover_indice == -1:
                        if first_crossunder_indice == -1:
                            continue
                        elif idx - first_crossunder_indice <= 3:
                            first_crossunder_indice = -1
                        else:
                            second_crossover_indice = idx
            else:
                if last_precip_chance >= chance_cutoff or last_precip_rate >= rate_cutoff:
                    if first_crossunder_indice == -1:
                        if first_crossover_indice == 0 and idx <= 2:
                            first_crossover_indice = -1
                            first_crossunder_indice = 0
                        else:
                            first_crossunder_indice = idx
                    elif second_crossunder_indice == -1:
                        if first_crossover_indice == -1:
                            continue
                        elif idx - first_crossover_indice <= 3:
                            first_crossover_indice = -1
                        else:
                            second_crossunder_indice = idx

            last_precip_chance = minute['precipitationChance']
            last_precip_rate = minute['precipitationIntensity']

        # Get hourly indice for conditions
        if first_crossover_indice != -1:
            hourly_indice = self.get_current_hourly_indice(
                self.iso8601_to_unix(self.get_minutely()['minutes'][first_crossover_indice]['startTime']))
        else:
            hourly_indice = self.get_current_hourly_indice(
                self.iso8601_to_unix(self.get_minutely()['minutes'][first_crossunder_indice]['startTime']))

        # Get the hourly conditions
        if self.is_code_precipitable(self.get_hourly()['hours'][hourly_indice]['conditionCode']):
            hourly_conditions = self.translatecondcode_humantext(
                self.get_hourly()['hours'][hourly_indice]['conditionCode'], "partial")
        elif self.is_code_precipitable(self.get_hourly()['hours'][hourly_indice + 1]['conditionCode']):
            hourly_conditions = self.translatecondcode_humantext(
                self.get_hourly()['hours'][hourly_indice + 1]['conditionCode'], "partial")
        else:
            hourly_conditions = self.translatecondcode_humantext(
                self.get_hourly()['hours'][hourly_indice]['conditionCode'], "partial")

        if first_crossover_indice == 0 and first_crossunder_indice > 0 and second_crossover_indice > 0:
            return f"{hourly_conditions} stopping in {first_crossunder_indice + 1} min., starting {second_crossover_indice - first_crossunder_indice} min. later."
        elif first_crossunder_indice == 0 and first_crossover_indice > 0 and second_crossunder_indice > 0:
            return f"{hourly_conditions} starting in {first_crossover_indice + 1} min., stopping {second_crossunder_indice - first_crossover_indice} min. later."
        elif first_crossunder_indice == 0 and first_crossover_indice > 0:
            return f"{hourly_conditions} starting in {first_crossover_indice + 1} min."
        elif first_crossover_indice == 0 and first_crossunder_indice > 0:
            return f"{hourly_conditions} stopping in {first_crossunder_indice + 1} min."
        elif first_crossover_indice == 0 and first_crossunder_indice == -1:
            # TODO: one of these needs better logic to get a not so precipitable code
            if cutoff == 59:
                return f"{hourly_conditions} for the hour."
            else:
                return f"{hourly_conditions} for the next {cutoff + 1} min."
        elif first_crossunder_indice == 0 and first_crossover_indice == -1:
            # Try to get a special hourly conditions for non-precipitable
            if not self.is_code_precipitable(self.get_hourly()['hours'][hourly_indice]['conditionCode']):
                hourly_conditions = self.translatecondcode_humantext(
                    self.get_hourly()['hours'][hourly_indice]['conditionCode'], "partial")
            elif not self.is_code_precipitable(self.get_hourly()['hours'][hourly_indice + 1]['conditionCode']):
                hourly_conditions = self.translatecondcode_humantext(
                    self.get_hourly()['hours'][hourly_indice + 1]['conditionCode'], "partial")
            else:
                hourly_conditions = self.translatecondcode_humantext(
                    self.get_hourly()['hours'][hourly_indice]['conditionCode'], "partial")

            if cutoff == 59:
                return f"{hourly_conditions} for the hour."
            else:
                return f"{hourly_conditions} for the next {cutoff + 1} min."
        else:
            if debug:
                return f"N/A. FCO: {first_crossover_indice}, FCU: {first_crossunder_indice}, SCO: " \
                       f"{second_crossover_indice}, SCU: {second_crossunder_indice}"
            else:
                return "Failed to generate hourly summary."
