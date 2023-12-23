import React from "react";
import InfoButton from "./InfoButton";
import DonateButton from "./DonateButton";
import SettingsButton from "./SettingsButton";
import MusicButton from "./MusicButton"
import "./Buttons.css"
import UncenterButton from "./UncenterButton";
import FullscreenButton from "./FullscreenButton";

export default function ButtonsBase(props) {
    return (
        <div id="buttonsBase" style={{ position: "fixed", pointerEvents: "none" }}>
            <UncenterButton settingsMgr={props.settingsMgr} dataMgr={props.dataMgr} />
            <FullscreenButton settingsMgr={props.settingsMgr} />
            <MusicButton settingsMgr={props.settingsMgr} dataMgr={props.dataMgr} geoMetrics={props.geoMetrics} />
            <SettingsButton settingsMgr={props.settingsMgr} dataMgr={props.dataMgr} geoMetrics={props.geoMetrics} />
        </div>
    )
}