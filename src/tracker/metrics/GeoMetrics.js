import axios from "axios"
import React from "react"
import fireEvent from "../../utils/fireEvent"
import haversineCalc from "../../utils/haversineCalc"
import KM_TO_MI_DIVISOR from "../../utils/km_to_mi_divisor"
import roundHalf from "../../utils/roundHalf"
import roundQuarter from "../../utils/roundQuarter"
import roundTen from "../../utils/roundTen"

class GeoMetrics extends React.Component {
    constructor (props) {
        super(props)
        this.dataMgr = props.dataMgr
        this.settingsMgr = props.settingsMgr
        this.geoapi_url = process.env.REACT_APP_GEO_API_ENDPOINT
        this.geoapi_key = process.env.REACT_APP_GEO_API_KEY
        this.arrivalTextVisible = this.settingsMgr.settings.ebArrivalVisible
        this.units = this.settingsMgr.get("units_actual")
        this.scaffolded = 0
        this.geoAPIerrored = 0
        this.geoapi_latitude = 0
        this.geoapi_longitude = 0
        this.working_latitude = 0
        this.working_longitude = 0
        this.accuracy = 0
        this.arrival_dr = -1
        this.arrival_unixtime = -1
        this.geoLocationName = "N/A (Geo API loading...)"
        this.previous_routestate = this.dataMgr.routeState

        document.addEventListener("unitsChanged", this.onUnitsChanged.bind(this))
        document.addEventListener("settingChanged", this.onSettingChanged.bind(this))
        document.addEventListener("routeStateChange", this.onRouteStateChange.bind(this))
    }

    onRouteStateChange(e) {
        // Going from 0 -> 1 or higher, we need to count as a hit for analytics so just requery it
        // However, we check the datamgr if we're about to be refreshed, in which case do not query the Geo API.
        // If we ignored that, we would get a double count on hits in the Geo API
        // We also do a set timeout to give some time for the dataMgr to figure out if we will be refreshed or not.
        setTimeout(() => {
            if (this.previous_routestate === 0 && e.detail.state >= 1 && this.dataMgr.willBeRefreshed === 0) {
                this.fetchGeoAPI()
            }
            this.previous_routestate = e.detail.state
        }, 100)
    }

    async fetchGeoAPI() {
        return axios.get(this.geoapi_url + "?key=" + this.geoapi_key + "&hitcount=true", {
            timeout: 60000
        })
        .then(response => response.data)
        .catch((error) => {
            // fireEvent("alertShow", {message: `Failed to query Geo API (${error.message}). Santa's estimated arrival time & distance from you metric are unavailable if precise location is off.`, timeout: 10, severity: "danger", nonblocking: false})
            this.geoLocationName = "N/A (failed to query Geo API)"
        })
    }

    switchWorkingLocation() {
        if (this.settingsMgr.get("arrivalMethod") === "curloc") {
            this.working_latitude = this.settingsMgr.get("curLocLat")
            this.working_longitude = this.settingsMgr.get("curLocLng")
        } else if (this.settingsMgr.get("arrivalMethod") === "geoapi") {
            this.working_latitude = this.geoapi_latitude
            this.working_longitude = this.geoapi_longitude
        }
    }

    async scaffold() {
        // If the setting is set to curloc, scaffold ahead of the request
        if (this.settingsMgr.get("arrivalMethod") === "curloc") {
            this.working_latitude = this.settingsMgr.get("curLocLat")
            this.working_longitude = this.settingsMgr.get("curLocLng")
            this.find_closeststop()
        }

        try {
            let gar = await this.fetchGeoAPI()
            this.geoapi_latitude = gar['data']['lat']
            this.geoapi_longitude = gar['data']['lng']
            this.switchWorkingLocation()
            this.accuracy = gar['data']['accuracy'] * 5
            this.geoLocationName = gar['data']['humanlocation']
            // In this try block we go ahead and set that we are scaffolded, find closest stop (if a user switched from geoapi -> curloc here this doesn't matter)
            this.find_closeststop()
            this.scaffolded = 1
            if (gar['data']['accuracy'] > 200) {
                this.accuracy = 200
            }
        } catch (e) {
            this.geoAPIerrored = 1
            this.scaffolded = 1
            fireEvent("mapUpdate", {ts: new Date().getTime() / 1000})
            fireEvent("geoAPIScaffolded", {})
            // TODO: Deprecate this message.
            // fireEvent("alertShow", {message: `Failed to parse Geo API response. Santa's estimated arrival time & distance from you metric are unavailable if precise location is off.`, timeout: 10, severity: "danger", nonblocking: true})
            this.geoLocationName = "N/A (failed to parse Geo API response)"
            return
        }

        fireEvent("mapUpdate", {ts: new Date().getTime() / 1000})
        fireEvent("geoAPIScaffolded", {})
    }

    find_closeststop() {
        let closestdist = 49999
        let closestdist_dr = -1

        // Find the closest stop
        for (let i = this.dataMgr.ptEnds + 1; i < this.dataMgr.routeLength; i++) {
            let stopdata = this.dataMgr.getStopInfo(i)
            let stopdist = haversineCalc(stopdata.lat, stopdata.lng, this.working_latitude, this.working_longitude)
            if (stopdist <= closestdist) {
                closestdist = stopdist
                closestdist_dr = i
            }
        }
        if (closestdist_dr === -1) {
            return
        }

        this.arrival_dr = closestdist_dr
        this.arrival_unixtime = this.dataMgr.getStopInfo(closestdist_dr).unixarrival
    }

    render_arrivaltext() {
        if (!this.settingsMgr.settings.santaArrivalVisible || (this.settingsMgr.settings.arrivalMethod === "geoapi" && (this.scaffolded === 0 || this.geoAPIerrored === 1))) {
            return (<></>)
        }
        
        if (this.settingsMgr.settings.arrivalMethod === "geoapi") {
            return this.render_arrivaltext_geoapi()
        } else if (this.settingsMgr.settings.arrivalMethod === "curloc") {
            return this.render_arrivaltext_curloc()
        }
    }

    render_arrivaltext_curloc() {
        let rendering_ts = new Date().getTime() / 1000
        let arrival_diffsecs = this.arrival_unixtime - rendering_ts
        let arrival_diffmins = arrival_diffsecs / 60
        let arrival_diffhrs = roundQuarter(arrival_diffsecs / 3600)
        if (this.dataMgr.nextStopId > this.arrival_dr + 1) {
            return (<></>)
        }

        let santaArrival_text = ""
        if (this.dataMgr.nextStopId >= this.arrival_dr) {
            santaArrival_text = "Santa has arrived!"
        } else if (this.dataMgr.nextStopId >= this.arrival_dr - 10) {
            santaArrival_text = `Santa is ${this.arrival_dr - this.dataMgr.nextStopId} stop${this.arrival_dr - this.dataMgr.nextStopId === 1 ? "" : "s"} away!`
        } else if (arrival_diffhrs >= 1 && arrival_diffmins >= 52.5) {
            if (arrival_diffhrs === "1.00") {
                santaArrival_text = "Santa will arrive in about 1 hour."
            } else {
                santaArrival_text = `Santa will arrive in about ${arrival_diffhrs} hours.`.replace(".75", "¾").replace(".50", "½").replace(".25", "¼").replace(".00", "")
            }
        } else if (arrival_diffmins >= 37.5 && arrival_diffmins < 52.5) {
            santaArrival_text = "Santa will arrive in about 45 minutes."
        } else if (arrival_diffmins >= 25 && arrival_diffmins < 37.5) {
            santaArrival_text = "Santa will arrive in about 30 minutes."
        } else if (arrival_diffmins >= 15 && arrival_diffmins < 25) {
            santaArrival_text = "Santa will arrive in about 20 minutes."
        } else if (arrival_diffmins >= 7.5 && arrival_diffmins < 15) {
            santaArrival_text = "Santa will arrive in about 10 minutes."
        } else if (arrival_diffmins < 7.5) {
            santaArrival_text = "Santa will arrive in less than 10 minutes."
        }

        return (
            <small>{santaArrival_text}</small>
        )
    }

    render_arrivaltext_geoapi() {
        let rendering_ts = new Date().getTime() / 1000
        let arrival_diffsecs = this.arrival_unixtime - rendering_ts
        let arrival_diffmins = arrival_diffsecs / 60
        let arrival_diffhrs = roundHalf(arrival_diffsecs / 3600)
        if (arrival_diffsecs < -600) {
            return (<></>)
        }

        let santaArrival_text = ""
        if (arrival_diffsecs <= 600 && arrival_diffsecs > -600) {
            santaArrival_text = "Santa has arrived in your area!"
        } else if (arrival_diffhrs >= 1 && arrival_diffmins >= 52.5) {
            // eslint-disable-next-line eqeqeq
            if (arrival_diffhrs == 1.0) {
                santaArrival_text = "Santa will arrive in about 1 hour."
            } else {
                santaArrival_text = `Santa will arrive in about ${arrival_diffhrs} hours.`.replace(".5", "½").replace(".0", "")
            }
        } else if (arrival_diffmins >= 37.5 && arrival_diffmins < 52.5) {
            santaArrival_text = "Santa will arrive in about 45 minutes."
        } else if (arrival_diffmins >= 22.5 && arrival_diffmins < 37.5) {
            santaArrival_text = "Santa will arrive in about 30 minutes."
        } else {
            santaArrival_text = "Santa will arrive shortly!"
        }

        return (
            <small>{santaArrival_text}</small>
        )
    }

    render_distancefromyou(position) {
        // Because a load from curloc can render metrics ahead of a Geo API load, we only hit loading IF
        // scaffolded is 0 and the ability to return geometrics is 0 (happens when you onload with geoapi)
        if (this.scaffolded === 0 && this.settingsMgr.settings.arrivalMethod === "geoapi") {
            return "Loading..."
            // If the Geo API is errored and can return geometrics is still 0 (that means we're basically on)
        } else if (this.geoAPIerrored === 1 && this.settingsMgr.settings.arrivalMethod === "geoapi") {
            return "N/A (Geo API error)"
        }

        // Distance_raw represents
        let distance_raw = haversineCalc(position.lat, position.lng, this.working_latitude, this.working_longitude)
        let distance_localized = distance_raw
        if (this.units === "imperial") {
            distance_localized = distance_localized / KM_TO_MI_DIVISOR
        }  

        let distance_localized_rounded;
        if (this.settingsMgr.settings.arrivalMethod === "geoapi") {
            distance_localized_rounded = roundTen(distance_localized)
        } else {
            distance_localized_rounded = Math.round(distance_localized)
        }

        if (distance_raw < this.accuracy && this.settingsMgr.settings.arrivalMethod === "geoapi") {
            return "Santa is nearby!"
        } else {
            if (isNaN(distance_localized)) {
                return "Loading..."
            } else {
                let returnstr = `${this.settingsMgr.settings.arrivalMethod === "geoapi" ? "~" : ""}${distance_localized_rounded.toLocaleString()} ${this.units === "imperial" ? "mi" : "km"}`
                if (this.settingsMgr.settings.arrivalMethod === "curloc") {
                    if (distance_localized_rounded <= 1) {
                        returnstr += " (!!!!!)"
                    } else if (distance_localized_rounded <= 5) {
                        returnstr += " (!!!!)"
                    } else if (distance_localized_rounded <= 10) {
                        returnstr += " (!!!)"
                    } else if (distance_localized_rounded <= 20) {
                        returnstr += " (!!)"
                    } else if (distance_localized_rounded <= 50) {
                        returnstr += " (!)"
                    }
                }
                return returnstr
            }
        }
    }

    onUnitsChanged(e) {
        this.units = this.settingsMgr.get("units_actual")
    }

    onSettingChanged(e) {
        if (e.detail.setting === "arrivalMethod") {
            this.onArrivalMethodSwitched()
        }
    }

    onArrivalMethodSwitched() {
        this.switchWorkingLocation()
        this.find_closeststop()
    }
}

export default GeoMetrics