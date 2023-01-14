import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom/client";

function App(props: any) {

    const vidRef = useRef<HTMLVideoElement>(null);
    const vidRes = useRef<HTMLDivElement>(null);
    const playerRef = useRef<HTMLDivElement>(null);
    const switchRef = useRef<HTMLInputElement>(null);
    const videoCodec = useRef<HTMLDivElement>(null);
    const audioCodec = useRef<HTMLDivElement>(null);
    const audioBufferRef = useRef<HTMLDivElement>(null);
    const videoBufferRef = useRef<HTMLDivElement>(null);
    const latencySource = useRef<HTMLDivElement>(null);

    //state
    const [latencyMode, setLatencyMode] = useState<"Low" | "Normal">("Low");
    const [hideInfoContainer, setHideInfoContainer] = useState<boolean>(true);
    const [hideSettingsContainer, setHideSettingsContainer] = useState<boolean>(true);
    const [hidePlayContainer, setHidePlayContainer] = useState<boolean>(false);

    const params = new URLSearchParams(window.location.search);

    const getUrl = () => {
        if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
            // we are in localhost
            return "https://localhost:3000/api"
        } else {
            //we are in some remote instance
            return window.location.protocol + "//" + window.location.host + "/api"
        }
    }
    //   const player = new Player({
    //     url: params.get("url") || getUrl() ,

    //     vid: vidRef,
    //     audioBuffer: audioBufferRef,
    //     videoBuffer: videoBufferRef,
    //     audioCodec,
    //     videoCodec,
    //     vidRes,
    //     latencySource
    //   });

    useEffect(() => {
        console.log(switchRef.current)
        console.log(vidRef.current)
        
        if ( !vidRef.current) {
            return;
        }

        switchRef.current && switchRef.current.addEventListener("change", (event: any) => {
            let runForever;

            //TODO: tighten this check? Too loose
            if (event.target.checked) {
                //@ts-ignore
                localStorage.setItem("live", true);
                setLatencyMode("Low")
                //TODO: call go live if buffer goes beyond a certain threshold
                // player.goLive();
            } else {
                //@ts-ignore
                localStorage.setItem("live", false);
                setLatencyMode("Normal");
            }
        });

        const playFunc = () => {
            setHidePlayContainer(true);

            // Only fire once to restore pause/play functionality
            //@ts-ignore
            vidRef.current.removeEventListener("play", playFunc);
        }

        vidRef.current.addEventListener("play", playFunc);

        // document.getElementById("play-btn")!.addEventListener("click", (e) => {
        //     // vidRef.play();
        //     console.log("Play button clicked")
        //     e.preventDefault();
        // });

    }, [])


    if (switchRef.current && localStorage.getItem("live")) {
        switchRef.current.checked = true;
        setLatencyMode("Low");
    }



    return (
        <div ref={playerRef} id="player">
            <div id="screen">
                {!hidePlayContainer && (
                    <div id="play">
                        <div
                            onClick={(e) => {
                                    if (!vidRef.current) {
                                        return;
                                    }

                                    vidRef.current.play();

                                    e.preventDefault();
                                }} 
                            id="play-btn">
                            <img src="../icons/Play.svg" id="play-icon" />
                        </div>
                    </div>
                )}
                <div id="play2">
                    {!hideInfoContainer && (
                        <div id="info-container" className="info-container">
                            <div id="close-info-tab">
                                <div id="close-btn">
                                    <img
                                        onClick={() => {
                                            setHideInfoContainer(false);
                                        }}
                                        src="../icons/Close.svg"
                                        id="info-close-icon"
                                        className="close-icon"
                                    />
                                </div>
                            </div>

                            <div id="name-value-container">
                                <div id="duo-containers">Name</div>
                                <div id="duo-containers">Value</div>
                            </div>

                            <div id="name-value-container">
                                <div className="text-style">Video Codec</div>
                                <div ref={videoCodec} id="video-codec" className="text-style"></div>
                            </div>

                            <div id="name-value-container">
                                <div className="text-style">Audio Codec</div>
                                <div ref={audioCodec} id="audio-codec" className="text-style"></div>
                            </div>

                            <div id="name-value-container">
                                <div className="text-style">Video Buffer</div>
                                <div ref={videoBufferRef} id="video-buffer" className="buffer-style"></div>
                            </div>

                            <div id="name-value-container">
                                <div className="text-style">Audio Buffer</div>
                                <div ref={audioBufferRef} id="audio-buffer" className="buffer-style"></div>
                            </div>

                            <div id="name-value-container">
                                <div className="text-style">Latency from source</div>
                                <div ref={latencySource} id="latency-source" className="text-style"></div>
                            </div>

                            <div id="name-value-container">
                                <div className="text-style">Video resolution</div>
                                <div ref={vidRes} id="vid-res" className="text-style"></div>
                            </div>

                            <div id="name-value-container">
                                <div className="text-style">Latency mode</div>
                                <div id="latency-mode" className="text-style">{latencyMode}</div>
                            </div>
                        </div>
                    )}

                    {/* <div id="name-value-container">
                                <div className="text-style">Protocol</div>
                                <div className="text-style">HLS</div>
                        </div> */}

                    {!hideSettingsContainer && (
                        <div id="settings-container" className="settings-container">
                            <div id="close-settings-tab">
                                <div id="close-settings-btn">
                                    <img
                                        onClick={() => { setHideSettingsContainer(true) }}
                                        src="../icons/Close.svg"
                                        id="settings-close-icon"
                                        className="close-icon"
                                    />
                                </div>
                            </div>

                            <div id="latency-setting">
                                <div className="settings-text-style">Lowest latency</div>
                                {/* <!-- use a ticker --> */}
                                <div className="radio-latency-style">
                                    <label className="switch">
                                        <input ref={switchRef} id="switch" type="checkbox" />
                                        <span className="slider"></span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}


                    {/* <!-- <div id="info-container"></div> --> */}
                    <div id="bottom-container">
                        <div id="bottom-controls">
                            <div id="bottom-btn">
                                <img
                                    onClick={() => { setHideInfoContainer(false) }}
                                    src="../icons/Info Square.svg"
                                    id="info-icon"
                                    className="bottom-icon"
                                />
                            </div>

                            <div id="bottom-btn">
                                <img
                                    onClick={() => {
                                        setHideSettingsContainer(false);
                                    }}
                                    src="../icons/Setting.svg"
                                    id="settings-icon"
                                    className="bottom-icon"
                                />
                            </div>

                            <div id="bottom-btn">
                                <img
                                    src="../icons/Volume On.svg"
                                    id="volume-up-icon"
                                    className="bottom-icon hide-display"
                                />
                                <img
                                    src="../icons/Volume Off.svg"
                                    id="volume-down-icon"
                                    className="bottom-icon"
                                />
                            </div>

                            <div id="bottom-btn">
                                <img
                                    src="../icons/Fullscreen.svg"
                                    id="fullscreen-icon"
                                    className="bottom-icon"
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <video id="video" ref={vidRef}></video>
                <div id="more-info"></div>
            </div>

            {/* <!-- <div id="controls">
              <button type="button" id="throttle">Throttle: None</button>
          </div> --> */}
        </div>
    )
}

const root = ReactDOM.createRoot(document.querySelector("#qwantify-app")!)
root.render(<App />);