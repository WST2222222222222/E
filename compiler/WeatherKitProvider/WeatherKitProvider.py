import requests
from configparser import ConfigParser
import time
import jwt
import json

from .WeatherKitUtils import WeatherKitUtils
from .WeatherKitData import WeatherKitData


class WeatherKitProvider(WeatherKitUtils):
    """
    This is the class to wrap Apple's WeatherKit API and hopefully make it less of a pain to use.
    """
    def __init__(self, configfile: str = "config.ini", keyfile: str = "auth.p8"):
        """
        Instantiates the WeatherKitProvider class. On instantiation, a new token is generated with an expiry time
        of that in the config file, so please be mindful of how long you set that expiry time for.
        :param configfile: The location of the config file to use
        :param keyfile: Path to the .p8 keyfile for WeatherKit
        """
        super().__init__()
        self.config = ConfigParser()
        self.config.read(configfile)
        # keyfile = open(keyfile)
        # secret = keyfile.read()
        current_time = int(time.time())
        expiry_time = current_time + self.config.getint("WEATHERKIT", "expiry_time")
        payload = {
            "iss": self.config.get("WEATHERKIT", "iss"),
            "iat": current_time,
            "exp": expiry_time,
            "sub": self.config.get("WEATHERKIT", "sub")
        }

        headers = {
            "alg": "ES256",
            "kid": self.config.get("WEATHERKIT", "kid"),
            "id": self.config.get("WEATHERKIT", "iss") + "." + self.config.get("WEATHERKIT", "sub")
        }

        # Sometimes JWT decides to return a binary string with the token (and WeatherKit will not accept that)
        # So try to decode it after creation
        # try:
        #     self.token = jwt.encode(payload, secret, algorithm='ES256', headers=headers).decode("utf-8")
        # except (AttributeError, UnicodeError):
        #     self.token = jwt.encode(payload, secret, algorithm='ES256', headers=headers)

        self.data = {}

    def availability(self, lat: float, lng: float, countrycode: str = "us", retries: int = 0):
        """
        Wrapper for the WeatherKit availability method.
        :param lat: The latitude for the request
        :param lng: The longitude for the request
        :param countrycode: The ISO Alpha-2 country code for the location for weather alerts (default to us)
        :param retries: An internal variable used in recursion to determine how many times the method was called for 401
        responses. Don't pass it in. Unless you like more chaos.
        :return: The JSON output of the availability request
        :raises RecursionError: If the maximum retries were reached
        :raises requests.exceptions.RequestException: If the request failed with a status code other than 401/200
        :raises requests.exceptions.JSONDecodeError: If the JSON decoding failed.
        """
        url = f"https://weatherkit.apple.com/api/v1/availability/{lat}/{lng}/?country={countrycode}"
        headers = {
            "Authorization": f"Bearer {self.token}"
        }

        if retries == 10:
            raise RecursionError("After ten 401 responses, WeatherKit didn't return anything.")

        data = requests.get(url, headers=headers)

        if data.status_code in [401, 502, 503, 404]:
            print(f"Failed to make request w/ {data.status_code} - retrying")
            return self.availability(lat, lng, countrycode, retries + 1)
        elif data.status_code != 200:
            raise requests.exceptions.RequestException(f"Failed to make request w/ status code {data.status_code}")

        try:
            return data.json()
        except requests.exceptions.JSONDecodeError:
            raise requests.exceptions.JSONDecodeError("Failed to make a request w/ JSON decode error")

    def request(self, lat: float, lng: float, language: str = "en", countrycode: str= "us" , datasets: list = None,
                currentasof: str = None, dailyend: str = None, dailystart: str = None, hourlyend: str = None,
                hourlystart: str = None, retries: int = 0, show_data_on_failure: bool = False) -> WeatherKitData:
        """
        Requests data from the WeatherKit API.
        :param lat: The latitude for the request
        :param lng: The longitude for the request
        :param language: The language for the rest (defaults to en)
        :param countrycode: The ISO Alpha-2 country code for the location for weather alerts (defaults to us)
        :param datasets: The datasets to request in an array. Valid datasets are currentWeather, forecastDaily,
        forecastHourly, forecastNextHour, and weatherAlerts. Not passing this in defaults to all datasets.
        :param currentasof: WeatherKit's currentAsOf parameter as ISO 8601 time. Optional.
        :param dailyend: WeatherKit's dailyEnd parameter as ISO 8601 time. Optional.
        :param dailystart: WeatherKit's dailyStart parameter as ISO 8601 time. Optional.
        :param hourlyend: WeatherKit's hourlyEnd parameter as ISO 8601 time. Optional.
        :param hourlystart: WeatherKit's hourlyStart parameter as ISO 8601 time. Optional.
        :param retries: An internal variable used in recursion to determine how many times the function has been
        called and to stop it if we're retrying requests way too much. Don't pass this in. You could increase the
        number of retries by passing in a negative number (i.e. passing in -10 means you get 20 retries on 401)
        :param show_data_on_failure: Toggles if the WeatherKitProvider prints the data returned from WK on a
        code failure. Defaults to False.
        :return: Nothing, you are meant to access weather data sets with their respective functions.
        :raises RecursionError: If the maximum retries were reached on status codes 401, 502, 503, or 404.
        :raises requests.exceptions.RequestException: If the request failed with a status code other than
        200, 401, 502, 503, or 404
        :raises requests.exceptions.JSONDecodeError: If the JSON decoding failed.
        """
        if datasets is None:
            datasets = ["currentWeather", "forecastDaily", "forecastHourly", "forecastNextHour", "weatherAlerts"]

        if retries == 10:
            raise RecursionError("After ten recursive tries, WeatherKit continued to return errors.")

        headers_request = {
            "Authorization": f"Bearer {self.token}"
        }
        datasets = ",".join(datasets)
        # Conditionally apply fields because we do not know if WeatherKit will suck bananas
        url = f"https://weatherkit.apple.com/api/v1/weather/{language}/{lat}/{lng}/?dataSets={datasets}" \
              f"{'' if currentasof is None else f'&currentAsOf={currentasof}'}" \
              f"{'' if dailyend is None else f'&dailyEnd={dailyend}'}" \
              f"{'' if dailystart is None else f'&dailyStart={dailystart}'}" \
              f"{'' if hourlyend is None else f'&hourlyEnd={hourlyend}'}" \
              f"{'' if hourlystart is None else f'&hourlyStart={hourlystart}'}" \
              f"&country={countrycode}"
        try:
            data = requests.get(url, headers=headers_request)
        except requests.exceptions.SSLError:
            print("Failed to make request w/ SSL error")
            return self.request(lat, lng, language, countrycode, datasets.split(","), currentasof, dailyend, dailystart,
                                hourlyend, hourlystart, retries + 1)

        # This should be a testament to just how bad the WeatherKit API is.
        # In production, I have seen ALL of these status codes just randomly show up but then go away if you try again
        # with no delay.
        if data.status_code in [401, 502, 503, 404, 504, 500]:
            print(f"Failed to make request w/ {data.status_code} - retrying ({retries + 1}/10)")
            if show_data_on_failure:
                print(f"Data return from WKP: {data.text}")
            return self.request(lat, lng, language, countrycode, datasets.split(","), currentasof, dailyend, dailystart,
                                hourlyend, hourlystart, retries + 1)
        elif data.status_code != 200:
            raise requests.exceptions.RequestException(f"Failed to make request w/ status code {data.status_code}")

        try:
            return WeatherKitData(data.json())
        except requests.exceptions.JSONDecodeError:
            raise requests.exceptions.JSONDecodeError(f"Failed to make a request w/ JSON decode error")

    def load_data(self, filename: str):
        """
        Loads existing data into the WKP - good for cached data that doesn't always need to be refetched.
        :param filename: The filename to load in that has a normal WeatherKit response.
        :return: A WeatherKitData object representing the WeatherKit data.
        :raises FileNotFoundError: If the file couldn't be loaded.
        """
        with open(filename) as f:
            return WeatherKitData(json.load(f))
