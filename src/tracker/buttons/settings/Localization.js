import { Cached, Cancel, CheckCircle } from "@mui/icons-material"
import axios from "axios"
import { DateTime } from "luxon"
import { MDBRadio, MDBSpinner } from "mdb-react-ui-kit"
import React, { useState, useEffect, useRef } from "react"
import fireEvent from "../../../utils/fireEvent"
import renderGeoAPIUnavailable from "./geoAPIUnavail"
import renderLSUnavailable from "./lsUnavail"
import { CSSTransition } from "react-transition-group"
import "./Localization.css"

export default function LocalizationSettings(props) {
    const [settingsMgr, setSettingsMgr] = useState(props.settingsMgr)
    const [tempState, setTempState] = useState(1)
    const [curLocState, setCurLocState] = useState("none")
    const [showCurLocInfo, setShowCurLocInfo] = useState(false)
    const [geoMetrics, setGeoMetrics] = useState(props.geoMetrics)
    const [curLocLocation, setCurLocLocation] = useState(settingsMgr.settings.arrivalMethod === "geoapi" ? geoMetrics.geoLocationName : settingsMgr.settings.curLocLocation)
    const [curLocStateTimeout, setCurLocStateTimeout] = useState(0)
    const nodeRef = useRef(null);

    const fireSettingsAlert = () => {
        fireEvent("alertShow", {message: "Your settings have been saved.", timeout: 5, severity: "success", nonblocking: false})
    }

    const onRadioChange = (e) => {
        if (e.currentTarget.name === "arrivalMethod") {
            if (e.currentTarget.value === "geoapi") {
                onGeoAPIClick()
            }
            // Do not fire onCurrentLocationClick for curloc. The onclick takes care of that.
        } else {
            props.settingsMgr.set(e.currentTarget.name, e.currentTarget.value)
            setTempState(tempState + 1)
            fireSettingsAlert()
        }
    }

    const getSetting = (key) => {
        return props.settingsMgr.get(key)
    }

    const renderAutomaticUnitsField = () => {
        return "Automatic (" + props.settingsMgr.get_auto_units() + ")"
    }

    const renderAutoClockStyleLabel = () => {
        return "Automatic (" + props.settingsMgr.get_auto_clockstyle() + ")"
    }

    const onGeoAPIClick = () => {
        props.settingsMgr.set("arrivalMethod", "geoapi")
        fireSettingsAlert()
        setCurLocLocation(geoMetrics.geoLocationName)
        setTempState(tempState + 1)
    }

    const setNoneTimeout = () => {
        clearTimeout(curLocStateTimeout)
        // If we're calling for a none timeout we're also calling for the info to appear, so set that to true here.
        setShowCurLocInfo(true)
        setCurLocStateTimeout(setTimeout(() => {setShowCurLocInfo(false)}, 10000))
    }

    // note - Because we're using the GMaps Reverse Geocoding feature (thru the Geo API) users are limited to changing their location once every 10 minutes.
    const onCurrentLocationClick = () => {
        if (props.settingsMgr.get("curLocLastChange") + parseInt(process.env.REACT_APP_GEOLOC_RATELIMIT) > new Date().getTime() / 1000) {
            settingsMgr.set("arrivalMethod", "curloc")
            setCurLocState("ratelimited")
            setNoneTimeout()
            setCurLocLocation(settingsMgr.settings.curLocLocation)
            return
        }

        if (navigator.geolocation) {
            setCurLocState("finding")
            setShowCurLocInfo(true)
            navigator.geolocation.getCurrentPosition((position) => {
                handleGeoLocationSuccess(position)
            }, (error) => {
                handleGeoLocationFailure(error)
            }, {timeout: 60000})
        } else {
            setCurLocState("errored")
            setNoneTimeout()
        }
    }

    const handleGeoLocationSuccess = (position) => {
        let posx = position.coords.latitude
        let posy = position.coords.longitude
        props.settingsMgr.set("curLocLat", posx)
        props.settingsMgr.set("curLocLng", posy)
        props.settingsMgr.set("curLocLastChange", new Date().getTime() / 1000)
        props.settingsMgr.set("curLocLocation", `Fetching your location...`)
        props.settingsMgr.set("arrivalMethod", "curloc")
        setCurLocLocation(settingsMgr.settings.curLocLocation)
        setCurLocState("success")
        fireSettingsAlert()
        setTempState(tempState + 1)
        setNoneTimeout()
        let bodyFormData = new FormData()
        bodyFormData.append("lat", posx)
        bodyFormData.append("lng", posy)
        axios.post(`${process.env.REACT_APP_GEO_API_RCODE_ENDPOINT}?key=${process.env.REACT_APP_GEO_API_KEY}`,
        bodyFormData, 
        {
            timeout: 60000,
            headers: {"Content-Type": "multipart/form-data"}
        })
        .then(response => response.data)
        .then((response) => {
            if (response['code'] <= 1) {
                props.settingsMgr.set("curLocLocation", `${Math.abs(posx).toFixed(4)} ${posx >= 0 ? "N" : "S"}, ${Math.abs(posy).toFixed(4)} ${posy >= 0 ? "E" : "W"}`)
                setCurLocLocation(settingsMgr.settings.curLocLocation)
            }
            props.settingsMgr.set("curLocLocation", `${response['data']['location']}`)
            setCurLocLocation(settingsMgr.settings.curLocLocation)

        })
        .catch((error) => {
            props.settingsMgr.set("curLocLocation", `${Math.abs(posx).toFixed(4)} ${posx >= 0 ? "N" : "S"}, ${Math.abs(posy).toFixed(4)} ${posy >= 0 ? "E" : "W"}`)
            setCurLocLocation(settingsMgr.settings.curLocLocation)
        })
    }

    const handleGeoLocationFailure = (error) => {
        setCurLocState("errored")
        setNoneTimeout()
        setCurLocLocation(geoMetrics.geoLocationName)
    }

    const setCLLWrapper = () => {
        setCurLocLocation(settingsMgr.settings.arrivalMethod === "geoapi" ? geoMetrics.geoLocationName : settingsMgr.settings.curLocLocation)
    }
    
    const onGeoAPIScaffolded = (e) => {
        setCLLWrapper()
    }

    const onSettingChange = (e) => {
        if (e.detail.setting === "arrivalMethod") {
            setCLLWrapper()
            // This is so risky to put, but on the bright side it means when we switch from precise -> approximate the banner goes away.
            setShowCurLocInfo(false)
        }
    }

    useEffect(() => {
        document.addEventListener("geoAPIScaffolded", onGeoAPIScaffolded.bind(this))
        document.addEventListener("settingChanged", onSettingChange.bind(this))
        return () => {
            document.removeEventListener("geoAPIScaffolded", onGeoAPIScaffolded.bind(this))
            document.removeEventListener("settingChanged", onSettingChange.bind(this))
        }
    })

    return (
        <>
            {renderLSUnavailable(settingsMgr.ls_available)}
            {renderGeoAPIUnavailable(geoMetrics.geoAPIerrored)}
            <h5>Tracker units</h5>
            <MDBRadio name='units' id='units-automatic' value='automatic' label={renderAutomaticUnitsField()} inline checked={getSetting("units") === "automatic"} onChange={onRadioChange} />
            <MDBRadio name='units' id='units-metric' value='metric' label='Metric' inline checked={getSetting("units") === "metric"} onChange={onRadioChange} />
            <MDBRadio name='units' id='units-imperial' value='imperial' label='Imperial' inline checked={getSetting("units") === "imperial"} onChange={onRadioChange} /><br></br>
            <small>Change the unit system used in the tracker for metrics and stop information.</small>
            <hr></hr>
            <h5>Clock style</h5>
            <MDBRadio name='clockStyle' id='clockStyle-automatic' value='automatic' label={renderAutoClockStyleLabel()} inline checked={getSetting("clockStyle") === "automatic"} onChange={onRadioChange} />
            <MDBRadio name='clockStyle' id='clockStyle-h12' value='h12' label='12 hour' inline checked={getSetting("clockStyle") === "h12"} onChange={onRadioChange} />
            <MDBRadio name='clockStyle' id='clockStyle-h23' value='h23' label='24 hour' inline checked={getSetting("clockStyle") === "h23"} onChange={onRadioChange} /><br></br>
            <small>Change which clock style is used when rendering times in the tracker.</small>
            <hr></hr>
            <h5>Your location accuracy</h5>
            <MDBRadio name='arrivalMethod' id='arrivalMethod-curloc' value='curloc' label='Precise' inline checked={getSetting("arrivalMethod") === "curloc"} onClick={onCurrentLocationClick} onChange={onRadioChange} />
            <MDBRadio name='arrivalMethod' id='arrivalMethod-geoapi' value='geoapi' label='Approximate' inline checked={getSetting("arrivalMethod") === "geoapi"} onChange={onRadioChange} /><br></br>
            <small>
                <CSSTransition in={showCurLocInfo} nodeRef={nodeRef} timeout={300} classNames="curLoc" unmountOnExit>
                    <div ref={nodeRef} style={{ marginTop: "3px", marginBottom: "3px" }}>
                        <div id="curLocFinding" hidden={curLocState !== "finding"} className="curLocState">
                            <MDBSpinner className="me-2" size="sm" style={{ position: "relative", top: "2px" }}>

                            </MDBSpinner>
                            Finding your location, this may take a bit. Be sure to accept any prompts!
                        </div>
                        <div id="curLocSuccess" hidden={curLocState !== "success"} className="curLocState">
                            <CheckCircle fontSize="small" sx={{ position: "relative", bottom: "1.5px" }}></CheckCircle> Success! Found your current location.
                        </div>
                        <div id="curLocFailed" hidden={curLocState !== "errored"} className="curLocState">
                            <Cancel fontSize="small" sx={{ position: "relative", bottom: "1.5px" }}></Cancel> Failed to find your current location. Make sure you give us location permissions & your device has location reception.
                        </div>
                        <div id="curLocRateLimited" hidden={curLocState !== "ratelimited"} className="curLocState">
                            <Cached fontSize="small" sx={{ position: "relative", bottom: "1.5px" }}></Cached> Using cached location from {DateTime.fromSeconds(settingsMgr.settings.curLocLastChange).toFormat("t")}. You can update your location at {DateTime.fromSeconds(settingsMgr.settings.curLocLastChange + parseInt(process.env.REACT_APP_GEOLOC_RATELIMIT)).toFormat("t")}.
                        </div>
                    </div>
                </CSSTransition>
                <b>Your location: </b>{curLocLocation}<br></br><br></br>
                Change the accuracy of your location used by the tracker. Approximate uses your IP to determine your general location. Precise queries your current location for enhanced accuracy. With precise location enabled, Santa arrival estimate is more accurate (down to the stop!), and the distance from you metric updates more frequently.<br></br><br></br>
                Please note that your location doesn't automatically update while using the tracker. To update your precise location, you can click on the Precise setting to do so.
            </small>
        </>
    )
}