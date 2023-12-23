import { Duration } from "luxon";
import { MDBCol, MDBRow } from "mdb-react-ui-kit";
import React from "react";
import "./Countdown.css";

class CountdownBase extends React.Component {
    constructor(props) {
        super(props)
        this.dataMgr = props.dataMgr
        this.countdownTimer = null;
        this.state = {
            timer: this.dataMgr.pt_starts_unix - new Date().getTime() / 1000 + 1
        }
    }

    setTimer() {
        this.setState({timer: this.dataMgr.pt_starts_unix - new Date().getTime() / 1000 + 1})
    }

    renderDuration() {
        if (this.state.timer >= 86400) {
            return Duration.fromMillis(this.state.timer * 1000).toFormat("d:hh:mm:ss")
        } else if (this.state.timer >= 3600) {
            return Duration.fromMillis(this.state.timer * 1000).toFormat("h:mm:ss")
        } else if (this.state.timer >= 60) {
            return Duration.fromMillis(this.state.timer * 1000).toFormat("m:ss")
        } else {
            if (this.state.timer < 0) {
                return Duration.fromMillis(0).toFormat("s")
            } else {
                return Duration.fromMillis(this.state.timer * 1000).toFormat("s")
            }
        }
    }

    componentDidMount() {
        this.countdownTimer = setInterval(this.setTimer.bind(this), 100)
    }

    componentWillUnmount() {
        clearInterval(this.countdownTimer)
    }

    render() {
        return (
            <div className="App">
                <section className="main-container">
                    <h4 className="welcome">Welcome to</h4>
                    <h1 className="stl">santatracker.live!</h1>
                </section>

        
                <h1 class="countdownh1">{this.renderDuration()}</h1>
            </div>
                
        )
    }
}

export default CountdownBase