import React, { RefObject, useState } from 'react';

interface Props {
    infoRef: RefObject<HTMLDivElement | null>;
    settingsRef: RefObject<HTMLDivElement | null>;
    playerRef: RefObject<HTMLDivElement | null>;
    vidRef: RefObject<HTMLVideoElement | null>;
}

export default function BottomContainer({ infoRef, settingsRef, playerRef, vidRef }: Props) {

    const [videoMuted, setVideoMuted] = useState(() => vidRef.current ? vidRef.current.muted : true);

    return (
        <div id="bottom-container">
            <div id="bottom-controls">
                <div
                    onClick={(e) => {
                        // close settings card and show info card
                        infoRef.current && infoRef.current.classList.remove("hide-display");
                        settingsRef.current && settingsRef.current.classList.add("hide-display");

                        e.preventDefault()
                    }}
                    id="bottom-btn">
                    <img
                        src="../icons/Info Square.svg"
                        id="info-icon"
                        className="bottom-icon"
                    />
                </div>

                <div
                    onClick={(e) => {
                        // show settings card and close info card
                        infoRef.current && infoRef.current.classList.add("hide-display");
                        settingsRef.current && settingsRef.current.classList.remove("hide-display");

                        e.preventDefault()
                    }}
                    id="bottom-btn">
                    <img
                        src="../icons/Setting.svg"
                        id="settings-icon"
                        className="bottom-icon"
                    />
                </div>

                <div
                    onClick={(e) => {

                        setVideoMuted(e => !e);
                        if (vidRef.current)
                            vidRef.current.muted = videoMuted; //.muted = true;

                        e.preventDefault();
                    }}
                    id="bottom-btn">
                    {videoMuted ? (
                        <img
                            src="../icons/Volume On.svg"
                            id="volume-up-icon"
                            className="bottom-icon"
                        />) : (
                        <img
                            src="../icons/Volume Off.svg"
                            id="volume-down-icon"
                            className="bottom-icon"
                        />
                    )}
                </div>


                <div
                    onClick={(e) => {
                        settingsRef.current && settingsRef.current.classList.add("hide-display");
                        infoRef.current && infoRef.current.classList.add("hide-display");

                        //make background fullscreen
                        playerRef.current && playerRef.current.requestFullscreen();
                    }}
                    id="bottom-btn">
                    <img
                        src="../icons/Fullscreen.svg"
                        id="fullscreen-icon"
                        className="bottom-icon"
                    />
                </div>
            </div>
        </div >
    )
}