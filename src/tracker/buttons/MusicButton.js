import { AttachMoney } from "@mui/icons-material";
import { MDBBtn, MDBModal, MDBModalContent, MDBModalDialog, MDBModalHeader, MDBModalTitle, MDBModalBody, MDBModalFooter } from "mdb-react-ui-kit";
import React, { useState } from "react";
import AudioPlayer from "../music/AudioPlayer";
import './Buttons.css'

export default function DonateButton() {
    const [donateModal, setDonateModal] = useState(false);
    const [hasRenderediFrame, setHasRenderediFrame] = useState(false);

    const toggleDonateModal = () => {
        setTimeout(() => {
            document.getElementById("donateModalDialog").scrollIntoView()
        }, donateModal ? 250 : 5)
        setDonateModal(!donateModal)
    }

    function play1() {
        var audio = document.getElementById("audio1");
        audio.play();
    }
    function play2() {
        var audio = document.getElementById("audio2");
        audio.play();
    }
    function play3() {
        var audio = document.getElementById("audio3");
        audio.play();
    }
    function play4() {
        var audio = document.getElementById("audio4");
        audio.play();
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

    document.addEventListener('play', function(e) {
        var audios = document.getElementsByTagName('audio');
    
        for (var i = 0, len = audios.length; i < len; i++) {
            if (audios[i] != e.target) {
                audios[i].pause();
            }
        }
    }, true);

    return (
        <>
            {/* <button className="classicButton" id="donateButton" onClick={toggleDonateModal} style={{ marginTop: "8px", paddingTop: "8px !important", paddingBottom: "8px !important", paddingRight: "22px !important", pointerEvents: "auto" }} title="Click to show information about donating">
            <img src="https://santatracker.live/icons/settings.png" className="icons" />
            </button> */}
            <button className="classicButton" onClick={toggleDonateModal} style={{ marginTop: "5px", pointerEvents: "auto" }} title="Click to change tracker preferences">
        <img src="https://santatracker.live/icons/music.png" className="icons" />
        </button><br></br>
            <MDBModal id="donateModal" appendToBody show={donateModal} setShow={setDonateModal} tabIndex='-1'>
                <MDBModalDialog id="donateModalDialog">
                    <MDBModalContent className="align" id="mobile-music">
                        <h1 class="styled">Some fun holiday music! Press each one to play!</h1>
                        <p  class="styled">You are free to stream this music!</p>
                        <button className="MusicButtonNew" onClick={play1} title="Click to play music option one" style={{marginTop: "40px"}}>
                        Candy Cane Lane
                            <audio id="audio1" src="https://santatracker.live/sounds/candycanelane.wav" loop></audio>
                        </button><br/>
                        <button className="MusicButtonNew" onClick={play2} title="Click to play music option two">
                            Tinsel
                            <audio id="audio2" src="https://santatracker.live/sounds/tinsel.wav" loop></audio>
                        </button><br/>
                        <button className="MusicButtonNew" onClick={play3} title="Click to play music option three">
                            Holly
                            <audio id="audio3" src="https://santatracker.live/sounds/nonloop.mp3" loop></audio>
                        </button><br/>
                        {/* <button className="MusicButton" onClick={play4} title="Click to play music option one">
                            Pop Beat 1
                            <audio id="audio4" src="https://santatracker.live/sounds/loop3.wav" loop></audio>
                        </button> */}
                        <MDBBtn color='secondary' onClick={toggleDonateModal} title="Click to close this modal">
                                Close
                            </MDBBtn>

                    </MDBModalContent>
                </MDBModalDialog>
            </MDBModal>
        </>
    )
}