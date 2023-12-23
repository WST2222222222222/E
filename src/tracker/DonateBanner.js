import fireEvent from "../utils/fireEvent";

class DonateBanner {
    constructor(props) {
        this.settingsMgr = props.settingsMgr
        this.dataMgr = props.dataMgr
        this.lastRouteState = this.dataMgr.routeState
        document.addEventListener("routeStateChange", this.onRouteStateChange.bind(this))
    }

    onRouteStateChange(e) {
        // Fire whenever the route state is 2, and the last route state is not the saved route state
        if (e.detail.state >= 2 && this.lastRouteState !== e.detail.state) {
            this.fireDonateBanner()
        }
    }

    // This method is intended to be called once the data manager scaffolds
    manuallyFireDonateBanner() {
        if (this.dataMgr.routeState >= 2) {
            this.fireDonateBanner()
        }
    }

    fireDonateBanner(bypass) {
        let message;
        if (this.dataMgr.routeState <= 2) {
            message = "Enjoying the tracker? Please consider donating to support the tracker so we can stay ad-free! :)"
        } else if (this.dataMgr.routeState === 3) {
            message = "Enjoyed the tracker? Please consider donating to support the tracker so we can stay ad-free! :)"
        }

        if (Math.random() <= parseFloat(process.env.REACT_APP_DONATE_BANNER_CHANCE) || bypass) {
            setTimeout(() => {
                if (!this.settingsMgr.get("shownDonateBanner") || process.env.REACT_APP_DONATE_BANNER_BYPASS === "true") {
                    if (document.visibilityState !== "visible") {
                        setTimeout(() => {this.fireDonateBanner(true)}, 60000)
                    } else {
                        fireEvent("alertShow", {message: message, severity: "success", nonblocking: "false", timeout: parseInt(process.env.REACT_APP_DONATE_BANNER_DURATION) / 1000})
                        this.settingsMgr.set("shownDonateBanner", true)
                    }
                }
            }, bypass ? 0 : parseInt(process.env.REACT_APP_DONATE_BANNER_TIMEOUT))
        } else {
            return
        }
    }
}

export default DonateBanner