import { MDBCard, MDBCardHeader, MDBCol } from "mdb-react-ui-kit"
import React from "react"
import './Alerts.css'

class AlertBox extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            message: "None",
            alertVisible: false,
            background: "success"
        }
        this.hidetimeout = null
    }

    onAlertVisible(e) {
        if ((e.detail.nonblocking && !this.state.alertVisible) || !e.detail.nonblocking) {
            this.setState({message: e.detail.message, alertVisible: true, background: e.detail.severity})
            clearTimeout(this.hidetimeout)
            this.hidetimeout = setTimeout(() => {this.setState({alertVisible: false})}, e.detail.timeout * 1000)
        }
    }

    componentDidMount() {
        document.addEventListener("alertShow", this.onAlertVisible.bind(this))
    }

    componentWillUnmount() {
        document.removeEventListener("alertShow", this.onAlertVisible.bind(this))
    }

    render() {
        return (
            <div className={`alertbox-div ${this.state.alertVisible ? "alert-visible" : "alert-hidden"}`} style={{ position: "fixed", left: 70, bottom: 28, pointerEvents: "none" }}>
                <MDBCol size='9' sm='10' md='11' lg='12'>
                    <MDBCard background={this.state.background} className={`text-white alertbox`} style={{ backgroundColor: "#dbefdc !important", color: "#285b2a", maxWidth: "750px"}}>
                        <MDBCardHeader style={{ borderBottomWidth: "0px" }}>
                            {this.state.message}
                        </MDBCardHeader>
                    </MDBCard>
                </MDBCol>
            </div>
        )
    }
}

export default AlertBox