import { MDBCard, MDBCardBody, MDBCardText, MDBCardTitle } from "mdb-react-ui-kit"
import React from "react"
import PreTrackCountdown from "./PreTrackCountdown"
import { Duration } from "luxon"
import "./Metrics.css"

class PreTrackStatus extends React.Component {
    constructor(props) {
        super(props)
        this.dataMgr = props.dataMgr
        this.settingsMgr = props.settingsMgr
        this.state = {
            stopData: this.dataMgr.getLastStopDetails(),
        }
    }

    onStopDataUpdate(e) {
        this.setState({stopData: this.dataMgr.getLastStopDetails()})
    }

    componentDidMount() {
        document.addEventListener("stopDeparture", this.onStopDataUpdate.bind(this))
    }

    componentWillUnmount() {
        document.removeEventListener("stopDeparture", this.onStopDataUpdate.bind(this))
    }

    render() {
        return (
            <>
                {/* <MDBCard className='shadow-3' style={{ pointerEvents: "auto" }}>
                    <MDBCardBody>
                        <MDBCardTitle>
                            Last seen
                        </MDBCardTitle>
                        <MDBCardText>
                            {this.state.stopData.city}
                            <div className="mobileMetrics">
                                <small>
                                    <PreTrackCountdown dataMgr={this.dataMgr} rendercontext="mobile" />
                                </small>
                            </div>
                        </MDBCardText>
                    </MDBCardBody>
                </MDBCard> */}
                <div id="Align">
                    <div className="Metric">
                        <div className="Title">
                            <h4 className="Box">
                                Last Seen
                            </h4>
                        </div>
                        <div className="Stop">
                            <div className="Text">
                                {this.state.stopData.city}
                            </div>
                        </div>
                        <div className="pretrackmobile">
                         <small className="font">Time Until Take Off:</small> <PreTrackCountdown className="mobilepretrack" dataMgr={this.dataMgr} />
                        </div>
                    </div>
                </div>
                
            </>
        )
    }
}

export default PreTrackStatus