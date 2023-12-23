import { MDBBtn, MDBModal, MDBModalContent, MDBModalDialog, MDBModalHeader, MDBModalTitle, MDBModalBody, MDBModalFooter, MDBRow, MDBTabsContent, MDBTabsPane, MDBListGroup, MDBListGroupItem, MDBRipple } from "mdb-react-ui-kit";
import SettingsIcon from '@mui/icons-material/Settings'
import TrackChangesIcon from '@mui/icons-material/TrackChanges'
import MapIcon from '@mui/icons-material/Map'
import ShowChartIcon from '@mui/icons-material/ShowChart'
import RefreshIcon from '@mui/icons-material/Refresh'
import HelpIcon from '@mui/icons-material/Help'
import LanguageIcon from '@mui/icons-material/Language'
import './Buttons.css'

import React, { useEffect, useState } from "react";
import TrackerSettings from "./settings/Tracker";
import MapSettings from "./settings/Map";
import MetricsSettings from "./settings/Metrics";
import ResetSettings from "./settings/Reset";
import HelpSettings from "./settings/Help";
import LocalizationSettings from "./settings/Localization";

export default function SettingsButton(props) {
    const [settingsModal, setSettingsModal] = useState(false);
    const [activeSettingsTab, setActiveSettingsTab] = useState('tracker');
    const [settingsMgr, setSettingsMgr] = useState(props.settingsMgr)
    const [activeAppearance, setActiveAppearance] = useState(settingsMgr.get("appearance_actual"))
    const [geoMetricsErroredState, setGeoMetricsErroredState] = useState(0)
    const LOCALISATION_LOCALES = ["en-GB", "en-AU", "en-NZ", "en-IE"]
    const toggleSettingsModal = () => {
        setTimeout(() => {
            document.getElementById("settingsModalDialog").scrollIntoView()
        }, settingsModal? 250 : 5)
        setSettingsModal(!settingsModal)
    }

    const onAppearanceChange = (e) => {
        setActiveAppearance(settingsMgr.get("appearance_actual"))
    }

    const handleSettingsTabClick = (value) => {
        if (value === activeSettingsTab) {
            return
        }

        setActiveSettingsTab(value)
    }

    const rippleColor = () => {
        if (activeAppearance === "light") {
            return "light"
        } else if (activeAppearance === "dark") {
            return "light"
        }
    }

    const onGeoMetricsScaffolded = (e) => {
        setGeoMetricsErroredState(props.geoMetrics.geoAPIerrored)
    }

    const renderLocalization = () => {
        if (LOCALISATION_LOCALES.indexOf(navigator.language.toLowerCase()) !== -1) {
            return "Localisation"
        } else {
            return "Localization"
        }
    }

    useEffect(() => {
        document.addEventListener("appearanceChanged", onAppearanceChange.bind(this))
        document.addEventListener("geoAPIScaffolded", onGeoMetricsScaffolded.bind(this))
        return () => {
            document.removeEventListener("appearanceChanged", onAppearanceChange.bind(this))
            document.removeEventListener("geoAPIScaffolded", onGeoMetricsScaffolded.bind(this))
        }
    })

    return (
        <>
        <button className="settingsButton" onClick={toggleSettingsModal} style={{ marginTop: "-20px", pointerEvents: "auto" }} title="Click to change tracker preferences">
        <img src="https://santatracker.live/icons/settings.png" className="icons" />
        </button><br></br>
        <MDBModal id="settingsModal" appendToBody show={settingsModal} setShow={setSettingsModal} tabIndex='-1'>
            <MDBModalDialog id="settingsModalDialog" className="settingsModalDialog">
                <MDBModalContent>
                <MDBModalBody>
                    <MDBRow>
                        <div className='col-sm-4 col-md-3'>
                            <MDBListGroup light style={{ marginBottom: "10px" }}>
                                <MDBRipple rippleColor={rippleColor()} style={{ borderRadius: "0.5rem" }}>
                                    <MDBListGroupItem tag='button' action noBorders active={activeSettingsTab === 'reset'} onClick={() => handleSettingsTabClick('reset')} className='px-3' title="Click to reset tracker settings">
                                        <RefreshIcon fontSize="small" className="settings-icon" />Optimization
                                    </MDBListGroupItem>
                                </MDBRipple>
                                <MDBRipple rippleColor={rippleColor()} style={{ borderRadius: "0.5rem" }}>
                                    <MDBListGroupItem tag='button' action noBorders active={activeSettingsTab === 'help'} onClick={() => handleSettingsTabClick('help')} className='px-3' title="Click to view tracker help">
                                        <HelpIcon fontSize="small" className="settings-icon" />Help
                                    </MDBListGroupItem>
                                </MDBRipple>
                            </MDBListGroup>
                        </div>
                        <div className='col-sm-8 col-md-9'>
                            
                            {/* <MDBTabsContent style={{ marginLeft: "10px", marginRight: "10px" }}>
                                <MDBTabsPane show={activeSettingsTab === 'tracker'}>
                                    <TrackerSettings settingsMgr={props.settingsMgr} dataMgr={props.dataMgr} geoMetricsErrorState={geoMetricsErroredState} />
                                </MDBTabsPane>
                                <MDBTabsPane show={activeSettingsTab === 'localization'}>
                                    <LocalizationSettings settingsMgr={props.settingsMgr} dataMgr={props.dataMgr} geoMetrics={props.geoMetrics} />
                                </MDBTabsPane>
                                <MDBTabsPane show={activeSettingsTab === 'map'}>
                                    <MapSettings settingsMgr={props.settingsMgr} dataMgr={props.dataMgr} geoMetricsErrorState={geoMetricsErroredState} />
                                </MDBTabsPane>
                                <MDBTabsPane show={activeSettingsTab === 'metrics'}>
                                    <MetricsSettings settingsMgr={props.settingsMgr} geoMetricsErrorState={geoMetricsErroredState} />
                                </MDBTabsPane>
                                <MDBTabsPane show={activeSettingsTab === 'reset'}>
                                    <ResetSettings settingsMgr={props.settingsMgr} toggleSettingsModal={toggleSettingsModal} setSettingsModal={setSettingsModal} setActiveSettingsTab={setActiveSettingsTab} geoMetricsErrorState={geoMetricsErroredState} />
                                </MDBTabsPane>
                                <MDBTabsPane show={activeSettingsTab === 'help'}>
                                    <HelpSettings settingsMgr={props.settingsMgr} dataMgr={props.dataMgr} geoMetricsErrorState={geoMetricsErroredState} />
                                </MDBTabsPane>
                            </MDBTabsContent> */}
                        </div>
                    </MDBRow>
                </MDBModalBody>
                <MDBModalFooter>
                    <MDBBtn color='secondary' onClick={toggleSettingsModal} title="Click to close this modal">
                        Close
                    </MDBBtn>
                </MDBModalFooter>
                </MDBModalContent>
            </MDBModalDialog>
        </MDBModal>
        </>
    )
}