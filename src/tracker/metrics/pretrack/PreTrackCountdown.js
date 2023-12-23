import { Duration } from "luxon"
import React from "react"
import "./Metrics.css"

class PreTrackCountdown extends React.Component {
    constructor(props) {
        super(props)
        this.dataMgr = props.dataMgr
        this.updateTimer = null;
        this.state = {
            timer: this.dataMgr.t_starts_unix - new Date().getTime() / 1000 + 1,
            context: props.rendercontext
        }
    }

    setTimer() {
        this.setState({timer: this.dataMgr.t_starts_unix - new Date().getTime() / 1000 + 1})
    }

    componentDidMount() {
        this.updateTimer = setInterval(this.setTimer.bind(this), 100)
    }

    componentWillUnmount() {
        clearInterval(this.updateTimer)
    }

    render() {
        if (this.state.context === "mobile") {
            return (
                <span className="mobilehide" >Time until take off: {Duration.fromMillis(this.state.timer * 1000).toFormat("h:mm:ss")}</span>
            )
        } else {
            return (
                <span className="mobilehide" >{Duration.fromMillis(this.state.timer * 1000).toFormat("h:mm:ss")}</span>
            )
        }
    }
}

export default PreTrackCountdown