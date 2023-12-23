import { MDBCol, MDBRow } from "mdb-react-ui-kit";
import React from "react";
import NextStopMetric from "./NextStopMetric";
import './Metrics.css'
import LastStopMetric from "./LastStopMetric";
import MetricBoxBase from "./MetricBoxBase";
import PreTrackStatus from "./pretrack/PreTrackStatus";
import PreTrackTimerBox from "./pretrack/PreTrackTimerBox";
import PreTrackMetrics from "./pretrack/PreTrackMetrics";

class MetricsBase extends React.Component {
    constructor (props) {
        super(props)
        this.dataMgr = props.dataMgr
        this.settingsMgr = props.settingsMgr
        this.state = {
            routeState: this.dataMgr.routeState,
            nudgeDown: this.settingsMgr.settings.safariFsNudgeDown,
            isFullScreen: document.fullscreen
        }
        this.geoMetrics = props.geoMetrics
    }

    onRouteStateChange(e) {
        this.setState({routeState: e.detail.state})
    }

    onSettingChange(e) {
        if (e.detail.setting === "safariFsNudgeDown") {
            this.setState({nudgeDown: e.detail.value})
        }
    }

    onFullscreenChange(e) {
        this.setState({isFullScreen: document.fullscreen})
    } 

    componentDidMount() {
        document.addEventListener("routeStateChange", this.onRouteStateChange.bind(this))
        document.addEventListener("settingChanged", this.onSettingChange.bind(this))
        document.addEventListener("fullscreenchange", this.onFullscreenChange.bind(this))
    }

    componentWillUnmount() {
        document.removeEventListener("routeStateChange", this.onRouteStateChange.bind(this))
        document.removeEventListener("settingChanged", this.onSettingChange.bind(this))
        document.removeEventListener("fullscreenchange", this.onFullscreenChange.bind(this))
    }

    renderPadding() {
        if (this.state.isFullScreen && this.state.nudgeDown) {
            return "3rem 1rem 0rem 1rem"
        } else {
            return "1rem 1rem 0rem 1rem"
        }
    }

    render() {
        if (this.state.routeState >= 2) {
            return (
                <MDBRow style={{ padding: this.renderPadding(), width: "100%" }} className='trackerBaseRow'>
                    <MDBCol className='lastStopMetric trackerCol' col='12' sm='6' lg='4'>
                        <LastStopMetric dataMgr={this.dataMgr} settingsMgr={this.settingsMgr} />
                    </MDBCol>
                    <MDBCol className='nextStopMetric trackerCol' col='12' sm='6' lg='4'>
                        <NextStopMetric dataMgr={this.dataMgr} settingsMgr={this.settingsMgr} geoMetrics={this.geoMetrics} />
                    </MDBCol>
                    <MDBCol className='metricsMetric trackerCol' col='12' sm='6' lg='4'>
                        <MetricBoxBase dataMgr={this.dataMgr} settingsMgr={this.settingsMgr} geoMetrics={this.geoMetrics} />
                    </MDBCol>
                </MDBRow>
            )
        } else if (this.state.routeState === 1) {
            return (
                <MDBRow style={{ padding: this.renderPadding(), width: "100%" }} className='trackerBaseRow'>
                    <MDBCol className='ptLastSeen trackerCol' col='12' sm='8'>
                        <PreTrackStatus dataMgr={this.dataMgr} settingsMgr={this.settingsMgr} />
                    </MDBCol>
                    <MDBCol className='ptCountdown trackerCol' col='12' sm='4'>
                        <PreTrackTimerBox dataMgr={this.dataMgr} settingsMgr={this.settingsMgr} />
                    </MDBCol>
                    {/* <MDBCol className='ptMetrics trackerCol' col='12' sm='4'>
                        <PreTrackMetrics dataMgr={this.dataMgr} settingsMgr={this.settingsMgr} />
                    </MDBCol> */}
                </MDBRow>
            )
        }
    }   
}

export default MetricsBase