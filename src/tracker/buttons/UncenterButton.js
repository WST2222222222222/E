import fireEvent from "../../utils/fireEvent"
import { MDBBtn } from "mdb-react-ui-kit"
import React, { useEffect, useState } from "react"
import "./Buttons.css"
import { Height } from "@mui/icons-material"

export default function UncenterButton(props) {
    const [appearanceState, setAppearanceState] = useState(props.settingsMgr.get_actual_appearance())
    const [routeState, setRouteState] = useState(props.dataMgr.routeState)
    const [centeredState, setCenteredState] = useState(props.settingsMgr.map_centered)

    const onAppearanceChanged = (e) => {
        setAppearanceState(e.detail.color)
    }

    const onRouteStateChanged = (e) => {
        setRouteState(e.detail.state)
    }

    const renderButtonClass = () => {
        if (centeredState) {
            return "uncenter-icon"
        } else {
            return "center-icon"
        }
    }

    const toggleCenterButton = () => {
        if (!centeredState) {
            fireEvent("alertShow", {message: "Map is now centered on Santa", timeout: 5, severity: "success", nonblocking: false})
        } else {
            fireEvent("alertShow", {message: "Map is now uncentered on Santa", timeout: 5, severity: "success", nonblocking: false})
        }
        setCenteredState(!centeredState)
        props.settingsMgr.set_map_centered_state(!centeredState)
    }

    const renderTitle = () => {
        if (centeredState) {
            return "Click to uncenter the map on the Santa"
        } else {
            return "Click to center the map on the Santa"
        }
    }

    useEffect(() => {
        document.addEventListener("appearanceChanged", onAppearanceChanged.bind(this))
        document.addEventListener("routeStateChange", onRouteStateChanged.bind(this))
        return () => {
            document.removeEventListener("appearanceChanged", onAppearanceChanged.bind(this))
            document.removeEventListener("routeStateChange", onRouteStateChanged.bind(this))
        }
    })

    if (routeState === 2) {
        return (
            <>
            {/* <MDBBtn id="uncenterButton" onClick={toggleCenterButton} style={{ marginTop: "8px", pointerEvents: "auto" }} title={renderTitle()}>
                <i className={renderButtonClass()} style={{ right: "0.1rem", bottom: "0.15rem" }}></i>
            </MDBBtn><br></br> */}
            <button className="classicButton" onClick={toggleCenterButton} style={{ marginTop: "8px", pointerEvents: "auto" }} title={renderTitle()}>
                <i className={renderButtonClass()} style={{ right: "0.1rem", bottom: "0.15rem", height: "30px", width: "30px"}}></i>
            </button>
            </>
        )
    } else {
        return (<></>)
    }
}