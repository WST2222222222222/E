import { Fullscreen, FullscreenExit } from "@mui/icons-material";
import { MDBBtn } from "mdb-react-ui-kit";
import React from "react";
import getBrowserVersionInt from "../../utils/getBrowserVersionInt";
import getBrowserVersionInt2 from "../../utils/getBrowserVersionInt2";

class FullscreenButton extends React.Component {
    constructor(props) {
        super(props);
        this.settingsMgr = props.settingsMgr;
        this.state = {
            isFullScreen: document.fullscreen,
            fullScreenAbility: document.fullscreenEnabled, 
        }
    }

    setTitleText() {
        if (document.fullscreen) {
            this.setState({titleText: "Click to exit fullscreen mode"})
        } else {
            this.setState({titleText: "Click to enter fullscreen mode"})
        }
    }

    async onclick() {
        if (this.state.isFullScreen) {
            await document.exitFullscreen()
            this.setState({isFullScreen: document.fullscreen})
        } else if (!this.state.isFullScreen) {
            await document.getElementsByTagName("html")[0].requestFullscreen()
            this.setState({isFullScreen: document.fullscreen})
        }
        this.setTitleText()
    }

    rendericon() {
        if (this.state.isFullScreen) {
            return (<FullscreenExit fontSize="small"></FullscreenExit>)
        } else {
            return (<Fullscreen fontSize="small"></Fullscreen>)
        }
    }

    determineBrowserCompatibility() {
        try {
            if (!this.state.fullScreenAbility) {
                return false
            } else if (this.settingsMgr.browser.os.name === "iOS") {
                return false
            } else if (this.settingsMgr.browser.browser.name === "Safari") {
                if (getBrowserVersionInt(this.settingsMgr) > 16) {
                    return true
                } else if (getBrowserVersionInt(this.settingsMgr) === 16 && getBrowserVersionInt2(this.settingsMgr) >= 4) {
                    return true
                } else {
                    return false
                }
            } else if ((this.settingsMgr.browser.browser.name === "Chrome" || this.settingsMgr.browser.browser.name === "Chromium") && getBrowserVersionInt(this.settingsMgr) >= 71) {
                return true
            } else if (this.settingsMgr.browser.browser.name === "Microsoft Edge" && getBrowserVersionInt(this.settingsMgr) >= 79) {
                return true
            } else if (this.settingsMgr.browser.browser.name === "Firefox" && getBrowserVersionInt(this.settingsMgr) >= 64) {
                return true
            } else if (this.settingsMgr.browser.browser.name === "Opera" && getBrowserVersionInt(this.settingsMgr) >= 58) {
                return true
            } else if (this.settingsMgr.browser.browser.name === "Samsung Internet for Android" && getBrowserVersionInt(this.settingsMgr) >= 10) {
                return true
                // Quest 2 UA
            } else if (this.settingsMgr.browser.os.name === "Linux" && this.settingsMgr.browser.browser.name === "Samsung Internet for Android" && getBrowserVersionInt(this.settingsMgr) === 4) {
                return true
            } else if (this.settingsMgr.browser.browser.name === "Silk" && getBrowserVersionInt(this.settingsMgr) >= 80) {
                return true
            }
        } catch (e) {
            return false
        }
    }

    onFullScreenChange() {
        this.setState({isFullScreen: document.fullscreen})
        this.setTitleText()
    }

    componentDidMount() {
        document.addEventListener("fullscreenchange", this.onFullScreenChange.bind(this))
        this.setTitleText()
    }

    componentWillUnmount() {
        document.removeEventListener("fullscreenchange", this.onFullScreenChange.bind(this))
    }

    render() {
        if (this.determineBrowserCompatibility()) {
            return (
                <>
                <button className="classicButton" id="mobile" onClick={this.onclick.bind(this)} style={{ marginTop: "8px", paddingTop: "8px !important", paddingBottom: "8px !important", pointerEvents: "auto" }} title={this.state.titleText}>
                <img src="https://santatracker.live/icons/fullscreen.png" className="icons" />
                </button>
                {/* <MDBBtn onClick={this.onclick.bind(this)} style={{ marginTop: "8px", paddingTop: "8px !important", paddingBottom: "8px !important", pointerEvents: "auto" }} title={this.state.titleText}>
                    {this.rendericon()}
                </MDBBtn><br></br> */}
                </>
            )
        } else {
            return (<></>)
        }
    }
}

export default FullscreenButton
