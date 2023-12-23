// This is the Tracker Base class. It just does something bro idk
import React from 'react';
import DataManager from './DataManager';
import ButtonsBase from './buttons/ButtonsBase';
import CountdownBase from './countdown/CountdownBase';
import SettingsManager from '../SettingsManager/SettingsManager';
import MetricsBase from './metrics/MetricsBase';
import AlertBox from './alerts/AlertBox';
import { MDBProgress, MDBProgressBar } from 'mdb-react-ui-kit';
import { Cancel } from '@mui/icons-material';
import "./TrackerBase.css";
import ESDModal from './esd/ESD';
import GeoMetrics from './metrics/GeoMetrics';
import { Loader } from '@googlemaps/js-api-loader';
import MapBase from './map/MapBase';
import fireEvent from '../utils/fireEvent';

class TrackerBase extends React.Component {
    constructor() {
        super();
        this.settingsMgr = new SettingsManager()
        this.dataMgr = new DataManager(this.settingsMgr)
        this.state = {
            routeState: -1,
            scaffolded: 0,
            loadProgress: 0,
            scaffoldedError: 0,
            scaffoldedErrorMessage: "",
            gMapsLoaded: false
        }
        this.geoMetrics = new GeoMetrics({dataMgr: this.dataMgr, settingsMgr: this.settingsMgr})
    }

    onRouteStateChange(e) {
        this.setState({routeState: e.detail.state})
    }

    onScaffoldProgressChange(e) {
        this.setState({loadProgress: e.detail.loadProgress})
    }

    onScaffoldFailed(e) {
        this.setState({scaffoldedError: 1, scaffoldedErrorMessage: e.detail.message})
    }

    onSettingChange(e) {
        if (e.detail.setting === "thirdBox") {
            this.preciseLocationNudge()
        }
    }

    preciseLocationNudge() {
        if (this.settingsMgr.settings.thirdBox === "distancefromyou" && this.settingsMgr.settings.arrivalMethod === "geoapi" && !this.settingsMgr.settings.shownPreciseLocationNudge) {
            setTimeout(() => {
                fireEvent("alertShow", {"message": "For a more accurate distance from you metric, enable precise location in the localization tab of settings.", timeout: 10, severity: "success", nonblocking: false})
                this.settingsMgr.set("shownPreciseLocationNudge", true)
            }, 50)
        }
    }

    async componentDidMount() {
        const loader = new Loader({
            apiKey: process.env.REACT_APP_GMAPS_API_KEY,
            version: "quarterly"
        })

        loader.load().then(async () => {
            this.setState({gMapsLoaded: true})
            fireEvent("gMapsLoaded", {})
        })

        document.addEventListener("routeStateChange", this.onRouteStateChange.bind(this))
        document.addEventListener("scafProgressUpdate", this.onScaffoldProgressChange.bind(this))
        document.addEventListener("scafFailed", this.onScaffoldFailed.bind(this))
        document.addEventListener("settingChanged", this.onSettingChange.bind(this))
        this.settingsMgr.change_body_darkmode()
        this.settingsMgr.change_body_adsflag()

        if (this.state.scaffolded === 0) {
            await this.dataMgr.dataMgrScaffold()
            this.setState({scaffolded: 1})
            this.geoMetrics.scaffold()
        }
    }

    componentWillUnmount() {
        document.removeEventListener("routeStateChange", this.onRouteStateChange.bind(this))
        document.removeEventListener("scafProgressUpdate", this.onScaffoldProgressChange.bind(this))
        document.removeEventListener("scafFailed", this.onScaffoldFailed.bind(this))
        document.removeEventListener("settingChanged", this.onSettingChange.bind(this))
        this.settingsMgr.tearDown()
        this.dataMgr.dataMgrUnscaffold()
        this.setState({scaffolded: 0});
    }

    render() {
        if (this.state.scaffolded === 0) {
            if (this.state.scaffoldedError === 0) {
                return (
                    <div className='loader-row' style={{ width: "100%", height: "100%", position: "fixed" }}>
                        <div className='tracker-loadbar centered-textalign'>
                            <MDBProgress style={{ width: "100%", marginBottom: "20px"}}>
                                <MDBProgressBar width={this.state.loadProgress} valuemin={0} valuemax={100} />
                            </MDBProgress>
                            <span id="loader-text">Loading...</span>
                        </div> 
                    </div>
                )
            } else {
                return (
                    <div className='loader-row' style={{ width: "100%", height: "100%", position: "fixed" }}>
                        <div className="tracker-loadbar centered-textalign">
                            <Cancel sx={{ marginBottom: "10px" }} fontSize="large"/>
                            {this.state.scaffoldedErrorMessage}
                        </div>
                    </div>
                )
            }
        } else {
            if (this.dataMgr.routeState === 0) {
                return (
                    <div className='countdown-div'>
                        <div style={{ zIndex: 5, position: "relative" }}>
                            <ButtonsBase dataMgr={this.dataMgr} settingsMgr={this.settingsMgr} geoMetrics={this.geoMetrics} />
                        </div>
                        <div style={{ zIndex: 2060, position: "relative" }}>
                            <AlertBox />
                        </div>
                        <CountdownBase dataMgr={this.dataMgr} />
                    </div>
                )
            } else {
                return (
                    <div>
                        <div style={{ zIndex: 0 }}>
                            <MapBase dataMgr={this.dataMgr} settingsMgr={this.settingsMgr} gMapsLoaded={this.state.gMapsLoaded} />
                            <ESDModal dataMgr={this.dataMgr} settingsMgr={this.settingsMgr} />
                        </div>
                        <div style={{ zIndex: 4, position: "relative", pointerEvents: "none" }}>
                            <MetricsBase dataMgr={this.dataMgr} settingsMgr={this.settingsMgr} geoMetrics={this.geoMetrics} />
                        </div>
                        <div style={{ zIndex: 5, position: "relative", pointerEvents: "auto" }}>
                            <ButtonsBase dataMgr={this.dataMgr} settingsMgr={this.settingsMgr} geoMetrics={this.geoMetrics} />
                        </div>
                        <div style={{ zIndex: 2060, position: "relative" }}>
                            <AlertBox />
                        </div>
                    </div>
                )
            }
        }
    }
}
var trackingStart = 1702119900
var trackingEnd = 1704088800
var timeNow = Math.floor(Date.now() / 1000)
console.log("Current time is:", timeNow)

// if (timeNow < trackingStart) {
//     window.location.replace("https://santatracker.live")
// } else if (timeNow > trackingStart) {
//     window.location.replace("https://staging.santatracker.live")
// } else if (timeNow >= trackingEnd) {
//     window.location.replace("https://santatracker.live")
// }


// var ts = Math.round((new Date()).getTime() / 1000);  
// // if (ts < trackingEnd) {
// //     window.location.replace("https://santatracker.live")
// // } else 
// if (ts >= trackingStart) {
//     window.location.replace("https://santatracker.live")
// } else {
//     window.location.replace("https://staging.santatracker.live")
// }

export default TrackerBase