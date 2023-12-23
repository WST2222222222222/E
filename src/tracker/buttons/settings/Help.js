import React from "react"

class HelpSettings extends React.Component {
    constructor(props) {
        super(props)
        this.settingsMgr = props.settingsMgr
        this.dataMgr = props.dataMgr
        this.state = {
            windowHeight: window.innerHeight,
            windowWidth: window.innerWidth
        }
        this.geoMetricsErrorState = props.geoMetricsErrorState
    }

    onWindowSizeChange(e) {
        this.setState({windowHeight: window.innerHeight, windowWidth: window.innerWidth})
    }

    componentDidMount() {
        window.addEventListener("resize", this.onWindowSizeChange.bind(this))
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.onWindowSizeChange.bind(this))
    }

    rendermacOS1015warning() {
        if (this.settingsMgr.browser.os.name === "macOS" && this.settingsMgr.browser.os.version.includes("10.15")) {
            return (
                <>
                <br></br>
                <b>Note: </b>The OS version your browser is reporting is probably wrong. When sending diagnostic data, please correct this to your actual OS version.
                </>
            )
        } else {
            return
        }
    }

    redactCoordinate(field) {
        field = field.toString().split(".")
        if (field[1] !== undefined) {
            field[1] = Array(field[1].length + 1).join("X")
        }
        return field.join(".")
    }

    renderSettingsJSON() {
        let localSettings = JSON.parse(JSON.stringify(this.settingsMgr.settings))

        localSettings.curLocLat = this.redactCoordinate(localSettings.curLocLat)
        localSettings.curLocLng = this.redactCoordinate(localSettings.curLocLng)

        if (localSettings.curLocLocation.length > 5) {
            localSettings.curLocLocation = localSettings.curLocLocation.substring(0, 5) + Array(localSettings.curLocLocation.length - 4).join("X")
        }

        return JSON.stringify(localSettings, null, 2)
    }

    wrapPlatformRender() {
        if (this.settingsMgr.browser.platform.type === "mobile") {
            return "Phone"
        } else if (this.settingsMgr.browser.platform.type === "desktop") {
            return "Desktop"
        } else if (this.settingsMgr.browser.platform.type === "tablet") {
            return "Tablet"
        } else if (this.settingsMgr.browser.platform.type === "tv") {
            return "TV"
        } else if (this.settingsMgr.browser.platform.type === "" || this.settingsMgr.browser.platform.type === undefined) {
            return "N/A"
        } else {
            return this.settingsMgr.browser.platform.type
        }
    }

    render() {
        return (
            <>
            <h5>Tracker Help</h5>
            If you're having problems with the tracker, please don't hesistate to reach out. We're here to help! <br></br><br></br>
            You can contact us on Twitter (<a href="https://twitter.com/bunny_tracking" target="_blank" rel="noreferrer">@bunny_tracking</a>) and mention/DM us. We also can provide support over email: <a href="mailto:support@easterbunny.cc" target="_blank" rel="noreferrer">support@easterbunny.cc</a>. <br></br><br></br>
            Support is availabile all throughout tracking and we'll try to respond within a couple hours. Before requesting help, please check the <a href="/knownissues" target="_blank">Known Issues</a> page as the issue you're having may be a known issue in the tracker.
            <hr></hr>
            <h5>Tips for streaming</h5>
            If you're streaming track.easterbunny.cc, we've got lots of ways to support how you stream. <br></br><br></br>
            First - we recommend enabling the optimized streamer settings, which is a compilation of the most popular tracker stream settings. Then, you can customize tracker settings to your liking! <br></br><br></br>
            If you're using an OBS Browser Source to stream the tracker, you can control zoom by changing the page CSS to <code>body &#123;zoom: 125%&#125;</code>, or whatever zoom you prefer. Make sure to turn on chrome map fix if you do this!<br></br><br></br>
            Lastly - ensure you keep the estimated arrival time off to avoid revealing your location. Have fun streaming the tracker and reach out if you encounter any issues!
            <hr></hr>
            <h5>Diagnostic information</h5>
            When receiving support we may ask you for your diagnostic information. Please copy the entirety of the below fields. This will help us troubleshoot your problems!<br></br><br></br>
            <b>Browser: </b><code>{this.settingsMgr.browser.browser.name} {this.settingsMgr.browser.browser.version === undefined ? "" : this.settingsMgr.browser.browser.version}</code><br></br>
            <b>OS: </b><code>{this.settingsMgr.browser.os.name} {this.settingsMgr.browser.os.version === undefined ? "" : this.settingsMgr.browser.os.version}</code><br></br>
            <b>Platform: </b><code>{this.wrapPlatformRender()}</code><br></br>
            <b>Engine: </b><code>{this.settingsMgr.browser.engine.name} {this.settingsMgr.browser.engine.version === undefined ? "" : this.settingsMgr.browser.engine.version}</code><br></br>
            <b>Languages: </b><code>{JSON.stringify(navigator.languages)}</code><br></br>
            <b>Window Size: </b><code>{this.state.windowWidth}x{this.state.windowHeight}</code><br></br>
            <b>Device Time: </b><code>{new Date().toString()}</code><br></br>
            <b>Data Sync Time: </b><code>{this.dataMgr.dataSyncTime}</code><br></br>
            <b>Settings: </b><br></br>
            <pre className="code" style={{ marginBottom: "0.25rem" }}>{this.renderSettingsJSON()}</pre>
            <small>Precise location information has been partially redacted for your privacy.</small><br></br>
            {this.rendermacOS1015warning()}
            </>
        )
    }
}

export default HelpSettings