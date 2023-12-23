import { MDBCard, MDBCardBody, MDBCardText, MDBCardTitle } from "mdb-react-ui-kit"
import React from "react"
import PreTrackCountdown from "./PreTrackCountdown"
import "./Metrics.css"

class PreTrackTimerBox extends React.Component {
    constructor(props) {
        super(props)
        this.dataMgr = props.dataMgr
        this.settingsMgr = props.settingsMgr
    }

    render() {
        return (
            <>
                {/* <MDBCard className='shadow-3' style={{ pointerEvents: "auto" }}>
                    <MDBCardBody>
                        <MDBCardTitle>
                            Time  liftoff
                        </MDBCardTitle>
                        <MDBCardText>
                            <PreTrackCountdown dataMgr={this.dataMgr} rendercontext="notmobile" />
                        </MDBCardText>
                    </MDBCardBody>
                </MDBCard> */}
                <div id="mobile" className="countHide">
                <div className="MBox" id="Align">
                        <div className="MBoxTitle">
                            <h4 className="Title">
                                Time Until Take Off
                            </h4>
                        </div>
                        <div className="MboxStats">
                            <div className="MBoxPTStatName">
                                <PreTrackCountdown dataMgr={this.dataMgr} rendercontext="notmobile" />
                            </div>
                        </div>
                    </div>
                </div>
                
            </>
        )
    }
}

export default PreTrackTimerBox