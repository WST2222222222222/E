import { KeyboardArrowLeft, KeyboardArrowRight } from "@mui/icons-material";
import { MDBBtn, MDBModal, MDBModalBody, MDBModalContent, MDBModalDialog, MDBModalFooter, MDBModalHeader, MDBModalTitle, MDBTooltip } from "mdb-react-ui-kit";
import React from "react";
import fireEvent from "../../utils/fireEvent";
// Note: We are now using flag icons & weather icons from CDNJS instead of locally.
//import "../../../node_modules/flag-icons/css/flag-icons.min.css";
//import "../../../node_modules/weather-icons/css/weather-icons.min.css"
import "./ESD.css"
import METERS_TO_FEET_DIVISIOR from "../../utils/meters_to_feet_divisor";
import timeFormat from "../../TimeFormatter/TimeFormatter";

class ESDModal extends React.Component {
    constructor(props) {
        super(props);
        this.dataMgr = props.dataMgr;
        this.settingsMgr = props.settingsMgr;
        this.state = {
            stopData: this.dataMgr.getStopInfo(1),
            ESDModalVisible: false,
            stopId: 1,
            forwardArrowDisabled: false,
        }
        this.THE_COUNTRIES = ["United States", "Netherlands", "Philippines", "United Arab Emirates", "Democratic Republic of the Congo", "Central African Republic", "French Southern and Antarctic Lands", "British Indian Ocean Territory", "Dominican Republic"]
    }

    toggleESDModalVisible = () => {
        setTimeout(() => {
            document.getElementById("esdModalDialog").scrollIntoView()
        }, this.ESDModalVisible ? 5 : 250)
        this.setState({ESDModalVisible: !this.state.ESDModalVisible})
    }

    setESDModalVisible_wrap = (newstate) => {
        this.setState({ESDModalVisible: newstate})
    }

    determineForwardArrowDisabled() {
        return this.state.stopId + 1 >= this.dataMgr.nextStopId
    }

    handleESDEvent(e) {
        this.setState({stopId: e.detail.index, stopData: this.dataMgr.getStopInfo(e.detail.index), ESDModalVisible: true})
        this.determineForwardArrowDisabled()
    }

    handleOnStopDeparture(e) {
        this.setState({forwardArrowDisabled: this.determineForwardArrowDisabled()})
    }

    renderLocalArrival() {
        if (!this.settingsMgr.settings.esdLocalTimeVisible) {
            return ""
        }
        let prevstop_data = this.dataMgr.getStopInfo(this.state.stopId - 1)
        let nextstop_data = this.dataMgr.getStopInfo(this.state.stopId + 1)

        let localarrival = timeFormat(prevstop_data.unixarrival, this.state.stopData.unixarrival, nextstop_data.unixarrival, "esd_local", this.state.stopData.timezone, this.state.stopData.locale, this.settingsMgr)

        return (
            <>
            <b>Arrived (Local Time):</b> {localarrival}<br></br>
            </>
        )
    }

    renderFlagTitle() {
        if (this.THE_COUNTRIES.indexOf(this.state.stopData.region) !== -1 || this.state.stopData.region.includes("Islands")) {
            return "Flag of the " + this.state.stopData.region
        } else {
            return "Flag of " + this.state.stopData.region
        }
    }

    renderUkraineESD() {
        if (this.state.stopData.countrycode === "ua" || this.state.stopData.countrycode === "ru") {
            return (
                <>
                <b>We strongly condemn Russia's unprovoked and unjustified invasion of Ukraine. We stand with Ukraine in their fight for freedom and for all Ukrainians affected by the invasion.</b>
                <hr></hr>
                </>
            )
        } else {
            return <></>
        }
    }
    
    componentDidMount() {
        document.addEventListener("esdLaunch", this.handleESDEvent.bind(this))
        document.addEventListener("esdLaunch_tap", this.handleESDEvent.bind(this))
        document.addEventListener("stopDeparture", this.handleOnStopDeparture.bind(this))
    }

    componentWillUnmount() {
        document.removeEventListener("esdLaunch", this.handleESDEvent.bind(this))
        document.removeEventListener("esdLaunch_tap", this.handleESDEvent.bind(this))
        document.removeEventListener("stopDeparture", this.handleOnStopDeparture.bind(this))
    }

    renderArrivalTime(tzcontext, tzlocale) {
        let prevstop_data = this.dataMgr.getStopInfo(this.state.stopId - 1)
        let nextstop_data = this.dataMgr.getStopInfo(this.state.stopId + 1)

        return timeFormat(prevstop_data.unixarrival, this.state.stopData.unixarrival, nextstop_data.unixarrival, "esd", tzcontext, tzlocale, this.settingsMgr)
    }

    render() {
        return (
            <>
            <MDBModal id="esdModal" appendToBody show={this.state.ESDModalVisible} setShow={this.setESDModalVisible_wrap} tabIndex='-1'>
                <MDBModalDialog id="esdModalDialog">
                    <MDBModalContent>
                        <MDBModalHeader className='esdHeader'>
                            <MDBModalTitle className='esdTitle'>
                                <span title={this.renderFlagTitle()} className={"fi fi-" + this.state.stopData.countrycode}></span>&nbsp;&nbsp;{this.state.stopData.city + ", " + this.state.stopData.region}
                            </MDBModalTitle>
                            <MDBBtn className='esdNav-left' color='secondary' onClick={() => {fireEvent("esdLaunch", {index: this.state.stopId - 1})}} disabled={this.state.stopId - 1 <= this.dataMgr.ptEnds + 1} title="Click to show information about the previous stop">
                                <KeyboardArrowLeft fontSize="small"></KeyboardArrowLeft>
                            </MDBBtn>
                            <MDBBtn className='esdNav-right' color='secondary' onClick={() => {fireEvent("esdLaunch", {index: this.state.stopId + 1})}} disabled={this.determineForwardArrowDisabled()} title="Click to show information about the next stop">
                                <KeyboardArrowRight fontSize="small"></KeyboardArrowRight>
                            </MDBBtn>
                            <MDBBtn style={{ marginLeft: "0.5rem !important" }} className='esdClose btn-close' color='none' onClick={this.toggleESDModalVisible} title="Click to close this window"></MDBBtn>
                        </MDBModalHeader>
                        <MDBModalBody>
                            <b>Arrived{this.settingsMgr.settings.esdLocalTimeVisible ? " (Your Time)" : ""}: </b> {this.renderArrivalTime()}<br></br>
                            {this.renderLocalArrival()}
                            {/* <b>Weather:</b>&nbsp;&nbsp;
                            <MDBTooltip tag="i" wrapperProps={{ className: "wi " + this.state.stopData.weather.icon}} title={this.state.stopData.weather.summary} placement="bottom"/> */}
                            {/* &nbsp;&nbsp;{this.settingsMgr.get("units_actual") === "imperial" ? this.state.stopData.weather.tempF + "°F" : this.state.stopData.weather.tempC + "°C"}{this.settingsMgr.settings.esdWeatherSummaryVisible ? " · " + this.state.stopData.weather.summary : ""}<br></br> */}
                            <b>Elevation: </b>{this.settingsMgr.get("units_actual") === "imperial" ? Math.round(this.state.stopData.elevation / METERS_TO_FEET_DIVISIOR).toLocaleString() + " ft" : this.state.stopData.elevation.toLocaleString() + " m"}<br></br>
                            <b>Population: </b>{this.state.stopData.population.toLocaleString()} {this.state.stopData.population_year === "0" ? "" : `(${this.state.stopData.population_year})`}<br></br>
                            <hr></hr>
                            {this.renderUkraineESD()}
                            {this.state.stopData.descr}
                            <hr></hr>
                            Source: <a href={this.state.stopData.srclink} className="linkwrap" target="_blank" rel="noreferrer">{this.state.stopData.srclink}</a><br></br>
                            {/* <small>Weather data powered by <a href="https://weatherkit.apple.com/legal-attribution.html" target="_blank" rel="noreferrer">Apple Weather</a></small> */}
                        </MDBModalBody>
                        <MDBModalFooter>
                            <MDBBtn color='secondary' onClick={this.toggleESDModalVisible} title="Click to close this modal">
                                Close
                            </MDBBtn>
                        </MDBModalFooter>
                    </MDBModalContent>
                </MDBModalDialog>
            </MDBModal>
            </>
        )
    }
}

export default ESDModal