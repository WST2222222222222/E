import { Class } from "@mui/icons-material";
import React from "react"
import './StopCss.css'
// We are now using Flag Icons from CDNJS
//import "../../../node_modules/flag-icons/css/flag-icons.min.css";

class LastStopMetric extends React.Component {
    constructor(props) {
        super(props)
        this.dataMgr = props.dataMgr;
        this.settingsMgr = props.settingsMgr;
        this.state = {
            lastStopInfo: this.dataMgr.getLastStopDetails(),
            flagsVisible: this.settingsMgr.settings.arrivalFlags
        }
    }

    onStopStateChange(e) {
        this.setState({lastStopInfo: this.dataMgr.getLastStopDetails()})
    }

    onSettingChange(e) {
        if (e.detail.setting === "arrivalFlags") {
            this.setState({flagsVisible: this.settingsMgr.settings.arrivalFlags})
        }
    }

    renderFlag() {
        if (this.state.flagsVisible && this.state.lastStopInfo.countrycode !== "zz") {
            return (
                <>
                <i className={"fi fi-" + this.state.lastStopInfo.countrycode}></i>&nbsp;&nbsp;
                </>
            )
        }
    }

    renderText() {
        let stopname = this.state.lastStopInfo.city + ", " + this.state.lastStopInfo.region

        return (
            <>
            <span>
                {this.renderFlag()}{stopname}
            </span>
            </>
        )
    }

    componentDidMount() {
        document.addEventListener("stopDeparture", this.onStopStateChange.bind(this))
        document.addEventListener("settingChanged", this.onSettingChange.bind(this))
    }

    componentWillUnmount() {
        document.removeEventListener("stopDeparture", this.onStopStateChange.bind(this))
        document.removeEventListener("settingChanged", this.onSettingChange.bind(this))
    }

    render() {
        return (
            <>
                {/* <MDBCard className='shadow-3' style={{ pointerEvents: "auto" }}>
                    <MDBCardBody>
                        <MDBCardTitle>
                            Last stop
                        </MDBCardTitle>
                        <MDBCardText>
                            {this.renderText()}
                        </MDBCardText>
                    </MDBCardBody>
                </MDBCard> */}
                <div id="mobile">
                    <div className="Metric" id="Align">
                        <div className="Title">
                            <div className="Box">
                                <h3 className="Text">Last Seen</h3>
                            </div>
                        </div>
                        <div className="Stop">
                            <div className="Text">
                                {this.renderText()}
                            </div>
                            
                        </div>
                    </div>
                </div>
                
            </>
        )
    }
}

export default LastStopMetric