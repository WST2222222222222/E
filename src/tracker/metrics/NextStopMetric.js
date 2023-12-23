import { MDBCard, MDBCardBody, MDBCardText, MDBCardTitle } from "mdb-react-ui-kit"
import React from "react"
//import "../../../node_modules/flag-icons/css/flag-icons.min.css";
// NOTE: We are now using flag icons from CDNJS instead of locally.
import MetricBoxCounter from "./MetricBoxCounter";
import "./Metrics.css"
import './StopCss.css'

class NextStopMetric extends React.Component {
    constructor (props) {
        super(props);
        this.dataMgr = props.dataMgr;
        this.settingsMgr = props.settingsMgr;
        this.geoMetrics = props.geoMetrics;
        this.state = {
            nextStopInfo: this.dataMgr.getNextStopDetails(),
            metricsInfo: this.dataMgr.getMetrics(new Date().getTime() / 1000),
            workingTs: new Date().getTime() / 1000,
            mobileMetricsVisible: this.settingsMgr.settings.mobileMetricsVisible,
            metricVisible: this.settingsMgr.settings.thirdBox,
            flagsVisible: this.settingsMgr.settings.arrivalFlags,
            dfyMetric: this.geoMetrics.render_distancefromyou(new Date().getTime() / 1000)
        }
        this.mbc = new MetricBoxCounter({settingsMgr: this.settingsMgr, context: "mm"})
    }

    onRegularUpdate(e) {
        this.setState({workingTs: e.detail.ts, metricsInfo: this.dataMgr.getMetrics(e.detail.ts)})
    }

    onMapUpdate(e) {
        let workingTs = e.detail.ts
        let positiondata = this.dataMgr.getSantaPosition(workingTs)
        this.setState({dfyMetric: this.geoMetrics.render_distancefromyou(positiondata)})
    }

    onStopStateChange(e) {
        // We do not call onRegularUpdate because we want all the state changes to be done in one go
        this.setState({workingTs: e.detail.ts, metricsInfo: this.dataMgr.getMetrics(e.detail.ts), nextStopInfo: this.dataMgr.getNextStopDetails()})
    }

    onSettingChange(e) {
        if (e.detail.setting === "thirdBox") {
            this.setState({metricVisible: this.settingsMgr.settings.thirdBox})
        } else if (e.detail.setting === "arrivalFlags") {
            this.setState({flagsVisible: this.settingsMgr.settings.arrivalFlags})
        } else if (e.detail.setting === "mobileMetricsVisible") {
            this.setState({mobileMetricsVisible: this.settingsMgr.settings.mobileMetricsVisible})
        }
    }

    componentDidMount() {
        document.addEventListener("regularUpdate", this.onRegularUpdate.bind(this))
        document.addEventListener("stopArrival", this.onStopStateChange.bind(this))
        document.addEventListener("stopArrival", this.onMapUpdate.bind(this))
        document.addEventListener("stopDeparture", this.onStopStateChange.bind(this))
        document.addEventListener("stopDeparture", this.onMapUpdate.bind(this))
        document.addEventListener("settingChanged", this.onSettingChange.bind(this))
        document.addEventListener("mapUpdate", this.onMapUpdate.bind(this))
    }

    componentWillUnmount() {
        document.removeEventListener("regularUpdate", this.onRegularUpdate.bind(this))
        document.removeEventListener("stopArrival", this.onStopStateChange.bind(this))
        document.removeEventListener("stopArrival", this.onMapUpdate.bind(this))
        document.removeEventListener("stopDeparture", this.onStopStateChange.bind(this))
        document.removeEventListener("stopDeparture", this.onMapUpdate.bind(this))
        document.removeEventListener("settingChanged", this.onSettingChange.bind(this))
        document.removeEventListener("mapUpdate", this.onMapUpdate.bind(this))
    }

    renderTitle() {
        if (this.dataMgr.routeState === 2 && this.dataMgr.nextStopState === 0) {
            return "Next Stop"
        } else if (this.dataMgr.routeState === 2 && this.dataMgr.nextStopState === 1) {
            return "Current Stop"
        } else if (this.dataMgr.routeState === 3) {
            return "Next Stop"
        }
    }

    renderDurationText(duration) {
        if (duration < 0) {
            duration = 0
        }
        duration = Math.floor(duration)
        let rendertext = `${duration % 60} second${duration % 60 !== 1 ? "s" : ""}`
        if (duration >= 60) {
            rendertext = `${Math.floor(duration / 60)} minute${duration >= 120 ? "s" : ""}, ` + rendertext
        }

        return rendertext
    }

    renderFlag() {
        if (this.settingsMgr.settings.arrivalFlags && this.state.nextStopInfo.countrycode !== "zz") {
            return (
                <>
                <i className={"fi fi-" + this.state.nextStopInfo.countrycode}></i>&nbsp;&nbsp;
                </>
            )
        }
    }

    renderText(workingTs) {
        if (this.dataMgr.routeState === 3) {
            return "Santa has arrived back at the North Pole. Thanks for tracking with us!!"
        }

        let stopname = this.state.nextStopInfo.city + ", " + this.state.nextStopInfo.region
        let duration = 0
        if (this.dataMgr.nextStopState === 0) {
            duration = this.state.nextStopInfo.unixarrival - workingTs
        } else if (this.dataMgr.nextStopState === 1) {
            duration = this.state.nextStopInfo.unixdeparture - workingTs
        }

        let durationtext = this.renderDurationText(duration)

        return (
            <>
            <span>
                {this.renderFlag()}{stopname}{this.dataMgr.nextStopState === 0 ? " in " : ", departing in "}{durationtext}
            </span>
            </>
        )
    }

    renderMobileMetrics() {
        if (this.state.mobileMetricsVisible) {
            return (
                <small className="mobileMetrics">
                    {this.mbc.render(this.state.metricVisible, this.state.metricsInfo, this.state.dfyMetric)}
                </small>
            )
        } else {
            return <></>
        }
    }

    render() {
        return (
            <>
                {/* <MDBCard className='shadow-3' style={{ pointerEvents: "auto" }}>
                    <MDBCardBody>
                        <MDBCardTitle>
                            {this.renderTitle()}
                        </MDBCardTitle>
                        <MDBCardText>
                            {this.renderText(this.state.workingTs)}
                            <div>
                                {this.renderMobileMetrics()}
                            </div>
                            {this.geoMetrics.render_arrivaltext()}
                        </MDBCardText>
                    </MDBCardBody>
                </MDBCard> */}
                <div id="Mobile">
                    <div className="Metric" id="Align">
                        <div className="Title">
                            <div className="Box">
                                <h3 className="Text">{this.renderTitle()}</h3>
                            </div>
                        </div>
                        <div className="Stop">
                                <div className="Text">
                                    {this.renderText(this.state.workingTs)}
                                </div>        
                                <div className="Mobile">
                                    {this.renderMobileMetrics()}
                                </div>
                                {this.geoMetrics.render_arrivaltext()}
                        </div>
                    </div>
                </div>
            </>
        )
    }

}

export default NextStopMetric