import { AttachMoney } from "@mui/icons-material";
import { MDBBtn, MDBModal, MDBModalContent, MDBModalDialog, MDBModalHeader, MDBModalTitle, MDBModalBody, MDBModalFooter } from "mdb-react-ui-kit";
import React, { useState } from "react";

export default function DonateButton() {
    const [donateModal, setDonateModal] = useState(false);
    const [hasRenderediFrame, setHasRenderediFrame] = useState(false);

    const toggleDonateModal = () => {
        setTimeout(() => {
            document.getElementById("donateModalDialog").scrollIntoView()
        }, donateModal ? 250 : 5)
        setDonateModal(!donateModal)
    }

    // Conditionally render the iFrame if the modal is active or not.
    // Normal lazy tag did not work nicely
    const renderKofiFrame = () => {
        if (donateModal) {
            if (!hasRenderediFrame) {
                setHasRenderediFrame(true)
            }
            return (
                <iframe id='kofiframe' src='https://ko-fi.com/trackeasterbunnycc/?hidefeed=true&widget=true&embed=true' style={{ border: "none", width: "100%", padding: "4px", background: "#f9f9f9"}} height="712" title='Ko-fi embed'></iframe>
            )
        } else {
            if (!hasRenderediFrame) {
                return (<></>)
            } else {
                return (
                    <iframe id='kofiframe' src='https://ko-fi.com/trackeasterbunnycc/?hidefeed=true&widget=true&embed=true' style={{ border: "none", width: "100%", padding: "4px", background: "#f9f9f9"}} height="712" title='Ko-fi embed'></iframe>
                )
            }
        }
    }

    return (
        <>
            <MDBBtn id="donateButton" onClick={toggleDonateModal} style={{ marginTop: "8px", paddingTop: "8px !important", paddingBottom: "8px !important", paddingRight: "22px !important", pointerEvents: "auto" }} title="Click to show information about donating">
                <AttachMoney fontSize="small" style={{ position: "relative", bottom: "0.1rem" }}></AttachMoney>
                <span style={{ fontSize: "15px", position: "relative", top: "0.04rem", left: "0.16rem" }}>Donate!</span>
            </MDBBtn>
            <MDBModal id="donateModal" appendToBody show={donateModal} setShow={setDonateModal} tabIndex='-1'>
                <MDBModalDialog id="donateModalDialog">
                    <MDBModalContent>
                        <MDBModalHeader>
                            <MDBModalTitle>Donate to track.easterbunny.cc</MDBModalTitle>
                            <MDBBtn className='btn-close' color='none' onClick={toggleDonateModal} title="Click to close this modal"></MDBBtn>
                        </MDBModalHeader>
                        <MDBModalBody>
                            Hi! I'm Owen, the developer of track.easterbunny.cc. If you've enjoyed tracking and want to help keep TEBCC ad-free, please consider donating! While going ad-free makes for an amazing tracking experience, I can't easily recoup costs of the running the tracker (which are getting higher every year). Any donation big or small is greatly appreciated!
                            <hr></hr>
                            {renderKofiFrame()}
                            <hr></hr>
                            If you'd prefer, you can donate directly on our Ko-fi page instead: <a href="https://ko-fi.com/trackeasterbunnycc" target="_blank" rel="noreferrer">https://ko-fi.com/trackeasterbunnycc</a>
                        </MDBModalBody>
                        <MDBModalFooter>
                            <MDBBtn color='secondary' onClick={toggleDonateModal} title="Click to close this modal">
                                Close
                            </MDBBtn>
                        </MDBModalFooter>
                    </MDBModalContent>
                </MDBModalDialog>
            </MDBModal>
        </>
    )
}