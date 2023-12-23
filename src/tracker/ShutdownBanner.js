import fireEvent from "../utils/fireEvent"

class ShutdownBanner {
    constructor(props) {
        this.settingsMgr = props.settingsMgr
    }

    fireShutdownBanner() {
        if (!this.settingsMgr.get("haveShownShutdownBanner")) {
            setTimeout(() => {
                fireEvent("alertShow", {message: "track.easterbunny.cc will no longer run after Easter 2024. Visit the news page to read the full announcement.", severity: "success", nonblocking: "false", timeout: 15})
                this.settingsMgr.set("haveShownShutdownBanner", true)
            }, 2000)
        }
    }
}

export default ShutdownBanner