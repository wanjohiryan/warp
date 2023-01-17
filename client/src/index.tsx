import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import ReactDOM from "react-dom/client";
import PlayScreenOne from "./components/PlayScreenOne";
import PlayScreenTwo from "./components/PlayScreenTwo";
import { Player } from "./player/index";

function App(props: any) {
    const [player, setPlayer]  = useState<any>();

    const vidRef = useRef<HTMLVideoElement>(null);
    const infoRef = useRef<HTMLDivElement>(null);
    const settingsRef = useRef<HTMLDivElement>(null);
    const playerRef = useRef<HTMLDivElement>(null);
    const params = new URLSearchParams(window.location.search);

    const getUrl = () => {
        if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
            // we are in localhost
            return "https://localhost:8080/api"
        } else {
            //we are in some remote instance
            return window.location.protocol + "//" + window.location.host + '/' + window.location.pathname + "/api"
        }
    }


    // const player = {
    //     goLive:() => {}
    // }

    useEffect(() => {
        const p = new Player({
            url: params.get("url") || getUrl(),
            vidRef,
            infoRef
        });

        setPlayer(p)
    }, [])


    //   Try to autoplay but ignore errors on mobile; they need to click
    //vidRef.play().catch((e) => console.warn(e))

    return (
        <div ref={playerRef} id="player">
            <div id="screen">

                <PlayScreenOne videoRef={vidRef} />

                <PlayScreenTwo {...{ settingsRef, infoRef, player, playerRef, vidRef }} />

                <video ref={vidRef} id="video"></video>
            </div>

        </div>
    )
}

const root = ReactDOM.createRoot(document.querySelector("#qwantify-app")!)
root.render(<App />);