from WeatherKitProvider import WeatherKitProvider
import requests.exceptions
import traceback

class TEBCCWeatherKitProvider(WeatherKitProvider):
    def __init__(self, configfile: str = "config.ini", keyfile: str = "auth.p8"):
        super().__init__(configfile, keyfile)

    def request_tebcc(self, lat: float, lng: float, time: int, dryrun: bool):
        if dryrun:
            return {
                "temperature": 20,
                "temperatureF": 70,
                "conditionCode": "Clear",
                "icon": "wi-night-clear"
            }

        
        wkd = super().request(lat=lat, lng=lng, currentasof=super().unix_to_iso8601(time))

        current_data = wkd.get_currently()
        return {
            "temperatureF": int(super().c_to_f(current_data['temperature'])),
            "icon": super().translateicon_wicons_class(current_data['conditionCode'], context="night"),
            "conditionCode": super().translatecondcode_humantext(current_data['conditionCode'], "uppercase"),
            "temperature": int(current_data['temperature'])
        }


