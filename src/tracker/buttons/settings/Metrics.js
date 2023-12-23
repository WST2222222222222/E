import fireEvent from "../../../utils/fireEvent"
import { MDBRadio } from "mdb-react-ui-kit"
import React, { useState } from "react"
import renderLSUnavailable from "./lsUnavail"
import renderGeoAPIUnavailable from "./geoAPIUnavail"
import timeFormat from "../../../TimeFormatter/TimeFormatter"

export default function MetricsSettings(props) {
    const [tempState, setTempState] = useState(0)
    const [settingsMgr, setSettingsMgr] = useState(props.settingsMgr) 

    const onRadioChange = (e) => {
        props.settingsMgr.set(e.currentTarget.name, e.currentTarget.value)
        setTempState(tempState + 1)
        fireEvent("alertShow", {message: "Your settings have been saved.", timeout: 5, severity: "success", nonblocking: false})
    }

    const getSetting = (key) => {
        return props.settingsMgr.get(key)
    }

    const renderNextStopLowHeight = () => {
        if (window.innerHeight <= 500 || window.innerWidth <= 330) {
            return (
                <>
                <b>Note: </b>Enabling this setting may cause Santa  icon to get obstructed and/or buttons to overlap the top boxes.<br></br><br></br>
                </>
            )
        } else {
            return (<></>)
        }
    }
    
    const renderLocalArrivalTime = () => {
        let testTime = timeFormat(0, 1679411092, 0, "esd_local", "America/New_York", "en-US", props.settingsMgr)
        if (testTime.indexOf("Invalid DateTime") === -1) {
            return (
                <>
                    <hr></hr>
                    <h5>Show local arrival time in stop info window</h5>
                    <MDBRadio name='esdLocalTimeVisible' id='esdLocalTimeVisible-on' value={true} label='On' inline checked={getSetting("esdLocalTimeVisible")} onChange={onRadioChange} />
                    <MDBRadio name='esdLocalTimeVisible' id='esdLocalTimeVisible-off' value={false} label='Off' inline checked={!getSetting("esdLocalTimeVisible")} onChange={onRadioChange} /><br></br>
                    <small>Show the local arrival time of Santa in the stop information window.</small>
                </>
            )
        } else {
            return (<></>)
        }
    }

    return (
        <>
            {renderLSUnavailable(settingsMgr.ls_available)}
            {renderGeoAPIUnavailable(props.geoMetricsErrorState)}
            <h5>Metric shown</h5>
            <MDBRadio name='thirdBox' id='thirdBox-gifts' value='gifts' label='Gifts Delivered' inline checked={getSetting("thirdBox") === "gifts"} onChange={onRadioChange} />
            <MDBRadio name='thirdBox' id='thirdBox-cookies' value='cookies' label='Cookies Eaten' inline checked={getSetting("thirdBox") === "cookies"} onChange={onRadioChange} />
            <MDBRadio name='thirdBox' id='thirdBox-stockings' value='stockings' label='Stockings Stuffed' inline checked={getSetting("thirdBox") === "stockings"} onChange={onRadioChange} />
            <MDBRadio name='thirdBox' id='thirdBox-milk' value='milk' label='Gallons of Milk Drank' inline checked={getSetting("thirdBox") === "milk"} onChange={onRadioChange} />
            <MDBRadio name='thirdBox' id='thirdBox-carrots' value='carrots' label='Carrots Eaten' inline checked={getSetting("thirdBox") === "carrots"} onChange={onRadioChange} />
            <MDBRadio name='thirdBox' id='thirdBox-distance' value='distance' label={settingsMgr.traveled_ls === 1 ? 'Distance traveled' : 'Distance travelled'} inline checked={getSetting("thirdBox") === "distance"} onChange={onRadioChange} />
            <MDBRadio name='thirdBox' id='thirdBox-speed' value='speed' label='Speed' inline checked={getSetting("thirdBox") === "speed"} onChange={onRadioChange} />
            <MDBRadio name='thirdBox' id='thirdBox-distancefromyou' value='distancefromyou' label='Distance from you' inline checked={getSetting("thirdBox") === "distancefromyou"} onChange={onRadioChange} /><br></br>
            <small>Change the metric shown during tracking. It is recommended to not show the distance from you metric if you are streaming the tracker.</small>
            <hr></hr>
            <h5>Show country flags in last seen & next stop boxes</h5>
            <MDBRadio name='arrivalFlags' id='arrivalFlags-on' value={true} label='On' inline checked={getSetting("arrivalFlags")} onChange={onRadioChange} />
            <MDBRadio name='arrivalFlags' id='arrivalFlags-off' value={false} label='Off' inline checked={!getSetting("arrivalFlags")} onChange={onRadioChange} /><br></br>
            <small>Control if country flags are shown in the last seen and next stop boxes.</small>
            <hr></hr>
            <h5>Show metrics in next stop box</h5>
            <MDBRadio name='mobileMetricsVisible' id='mobileMetricsVisible-on' value={true} label='On' inline checked={getSetting("mobileMetricsVisible")} onChange={onRadioChange} />
            <MDBRadio name='mobileMetricsVisible' id='mobileMetricsVisible-off' value={false} label='Off' inline checked={!getSetting("mobileMetricsVisible")} onChange={onRadioChange} /><br></br>
            <small>{renderNextStopLowHeight()}Show metrics in the next stop box when only the next stop box is visible.</small>
            <hr></hr>
            <h5>Show weather summary in stop info window</h5>
            <MDBRadio name='esdWeatherSummaryVisible' id='esdWeatherSummaryVisible-on' value={true} label='On' inline checked={getSetting("esdWeatherSummaryVisible")} onChange={onRadioChange} />
            <MDBRadio name='esdWeatherSummaryVisible' id='esdWeatherSummaryVisible-off' value={false} label='Off' inline checked={!getSetting("esdWeatherSummaryVisible")} onChange={onRadioChange} /><br></br>
            <small>Show a text summary of the weather conditions in the stop information window. You can hover over the icon to see a summary of the weather conditions when this feature is off.</small>
            {renderLocalArrivalTime()}
        </>
    )
}