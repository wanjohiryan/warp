import React, { useState, useEffect, useRef } from "react";
import Sidebar from "../components/sidebar";
import FeedbackModal from "../components/feedbackModal";
//@ts-ignore for some reason react-hot-toast does not have type definitions in the @types dir :(
import { Toaster } from "react-hot-toast";
import Chat from "../components/chat";
import Logo from "../svg/logo";
import Player from "../api/player/index";
import { Input } from "../api/input/index";
import { Toast } from "../components/toast";
// @ts-ignore embed the certificate fingerprint using bundler
import fingerprintHex from '../../fingerprint.hex';

//FIXME: Image loading animations are needed ASAP!!!

// Convert the hex to binary.
let fingerprint: any[] = [];
for (let c = 0; c < fingerprintHex.length - 1; c += 2) {
    fingerprint.push(parseInt(fingerprintHex.substring(c, c + 2), 16));
}


export default function Home() {
    const [isFeedback, setIsFeedback] = useState(false);
    const [exitedPlay, setExitedPlay] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const isOtherPlaying = useRef(false);
    const [input, setInput] = useState<Input>();
    const [showSplash, setShowSplash] = useState(true);
    const vidContainerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const toast = new Toast();

    try {
        const inpt = new Input();
        setInput(inpt)
    } catch (e) {
        isOtherPlaying.current = true
    }

    //on load show splash screen for 3 seconds then show normal view
    useEffect(() => {
        setTimeout(() => {
            setShowSplash(false);
        }, 100);

        if (showSplash) {

        }

        async function onFullscreenChange() {
            if (!document.fullscreenElement) {
                setExitedPlay(true)
                // setIsPlaying(false)
            }
        }

        canvasRef.current?.addEventListener('fullscreenchange', onFullscreenChange)

        return () => canvasRef.current?.removeEventListener("fullscreenchange", onFullscreenChange)
    }, [])

    useEffect(() => {
        function lockChange() {
            if (document.pointerLockElement === canvasRef.current) {
                input?.sendInput()
            } else {
                input?.stopInput()
            }
        }
        document.addEventListener("pointerlockchange", lockChange);
        return () => document.removeEventListener("pointerlockchange", lockChange);
    }, [])

    const playGame = () => {
        if (canvasRef.current) {

            if (isOtherPlaying) {
                setIsPlaying(true);

                toast.showError("someone is already playing")
                //just watch not fullscreen
                const player = new Player({
                    fingerprint: { // TODO remove when Chrome accepts the system CA
                        "algorithm": "sha-256",
                        "value": new Uint8Array(fingerprint),
                    },
                    canvas: canvasRef,
                })

                player.play()
            } else {
                setIsPlaying(true);

                //play
                const player = new Player({
                    fingerprint: { // TODO remove when Chrome accepts the system CA
                        "algorithm": "sha-256",
                        "value": new Uint8Array(fingerprint),
                    },
                    canvas: canvasRef,
                })
                player.play();
                //@ts-ignore For some reason ts thinks this is wrong
                canvasRef.current.requestPointerLock({ unadjustedMovement: true });
                canvasRef.current.requestFullscreen();
            }
        }
    }

    return (
        <>
            <main className="app_main">
                {showSplash && (
                    <div className="splash_screen">
                        <Logo />
                        <div className="preloader">
                            <svg><circle cx="8" cy="8" r="8"></circle></svg>
                        </div>
                    </div>
                )}
                <>
                    <div className="top">
                        <Toaster
                            position="top-center"
                            reverseOrder={false} />
                    </div>
                    {/*The left sidebar */}
                    <Sidebar onPressFeedback={() => { setIsFeedback(true) }} />
                    {/*Canvas */}
                    <div className="canvas">
                        <div
                            ref={vidContainerRef}
                            className="video_container preview"
                            style={{
                                aspectRatio: "4 / 3",
                                width: "100%",
                                height: "auto",
                            }}>
                            <canvas
                                ref={canvasRef}
                                hidden={!isPlaying}
                                style={{
                                    aspectRatio: "16 / 9 ",
                                    objectFit: "contain",
                                    width: "100%",
                                }}
                            />
                            <img
                                hidden={isPlaying}
                                loading="eager"
                                src="../../public/images/canvas.jpg"
                                style={{
                                    width: "100%",
                                    aspectRatio: "4 / 3",
                                    objectFit: "cover"
                                }} />
                        </div>
                        {!isPlaying && (<button
                            onClick={playGame}
                            className="video-play-button">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                xmlSpace="preserve"
                                viewBox="0 0 58.752 58.752">
                                <path d="M52.524 23.925 12.507.824c-1.907-1.1-4.376-1.097-6.276 0a6.294 6.294 0 0 0-3.143 5.44v46.205a6.29 6.29 0 0 0 3.131 5.435 6.263 6.263 0 0 0 6.29.005l40.017-23.103a6.3 6.3 0 0 0 3.138-5.439 6.315 6.315 0 0 0-3.14-5.442zm-3 5.687L9.504 52.716a.27.27 0 0 1-.279-.005.28.28 0 0 1-.137-.242V6.263a.28.28 0 0 1 .421-.243l40.01 23.098a.29.29 0 0 1 .145.249.283.283 0 0 1-.14.245z" />
                            </svg>
                        </button>)}
                        {exitedPlay && (
                            <div
                                className="modal_container play">
                                <div className="modal_effects feedback_modal"
                                    style={{
                                        width: "calc(100 % - 24px)",
                                        maxWidth: 360,
                                        maxHeight: "calc(100vh - 32px)",
                                        opacity: 1,
                                        transform: "translateY(0px) scale(1) translateZ(0px)"
                                    }}>

                                    <div className="play_modal">
                                        <button onClick={playGame}>
                                            <p>Continue playing</p>
                                        </button>
                                        <button onClick={() => { setIsFeedback(true) }}>
                                            <p>Submit feedback</p>
                                        </button>
                                        <button
                                            onClick={() => {
                                                //FIXME: add logic to gracefully exit and kill the game, plus save current progress
                                                setIsPlaying(false)
                                            }}>
                                            <p>Exit game</p>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div >
                    {/*Chat and friends panel*/}
                    < Chat />
                    {/*Footer elements */}
                    <div className="command_bar" >
                        <button className="tip"
                            onClick={async () => {
                                await toast.showError("Voice chat not implemented yet");
                            }}>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 512 512"
                            >
                                <path fill="currentColor" d="M243.5 37.1c-25.7 3.2-49.7 18.1-63.4 39.2-3.5 5.4-4.5 8-4.9 12.2-.9 10.6 5.8 17.6 17.2 18.3 7.7.4 10.4-1.2 18-10.7 9.8-12.2 20.7-18.9 35.8-21.9 23.4-4.6 48.1 7.3 58.3 28.1 6.2 12.7 6.5 15.4 6.5 71.5 0 55-.1 54.5 5.9 59.5 8.6 7.2 22.7 5 28-4.4 2.2-3.8 2.2-4 1.9-61.1l-.3-57.3-2.8-8.8c-7.7-24.7-24-44.3-46.2-55.4-8.6-4.4-20.6-7.9-31-9.2-10.1-1.2-13-1.2-23 0zM47.5 38.2c-3.2 1.7-7.6 6.1-9.1 9-1.7 3.2-1.8 10.5-.3 14.5.5 1.5 29.1 30.9 64 65.8l62.9 63v38.3c0 41.9.5 46.8 6 61 10.1 26.1 32.5 46.3 60 54.2 9.3 2.7 30.6 3.8 40.3 2.1 9.7-1.7 19.2-5.2 28.4-10.3l8.1-4.6 12.6 12.7 12.6 12.7-6.3 4.6c-19.1 14.1-46 22.8-70.2 22.8-46.2 0-87.9-23.8-111.3-63.6-10.4-17.6-17.2-42.2-17.2-62.3 0-13.5-7.1-20.6-19.7-19.9-6.6.4-10 2.1-13.6 7-2.9 3.8-3.5 9.1-2.6 22.7 1.6 23.1 7.2 43.2 18.1 64.2 22.2 43.2 66.3 75.9 113.8 84.4 5.2.9 10.5 1.8 11.7 2.1 2.2.4 2.2.6 2.5 23.3.3 25.2.4 25.5 7.2 30.5 4 3 17.2 3 21.2 0 6.8-5 6.9-5.3 7.2-30.4l.3-22.9 5.7-.6c23.6-2.7 50.9-13.6 70.3-27.9l8.6-6.4 43.9 43.9c24.2 24.2 45.3 44.6 47.1 45.4 3.9 1.9 11.6 1.9 15.1.1 3.1-1.6 7.4-6.1 9.1-9.3 1.6-3.1 1.4-10.9-.4-14.6-2-4.3-408.2-410.3-411.8-411.7-3.7-1.3-11.6-1.2-14.2.2zM392.8 240c-6 3.3-8 7.7-8.9 19.9-.4 5.8-1.6 16.1-2.5 22.7-1.7 11.5-1.7 12.4-.1 16.6 1 2.4 3.3 6 5.2 7.8 3.3 3.2 4.2 3.5 10.8 3.8 6.2.3 7.7.1 10.7-2 1.9-1.3 4.3-3.9 5.2-5.8 4-8.3 8.5-41.7 6.8-51-.9-4.7-3.2-8.3-7.3-11.4-4-3-14.9-3.3-19.9-.6z" />
                            </svg>
                            <div className="tooltip"
                                style={{
                                    bottom: "150%",
                                    left: "-60%"
                                }}>Voice Chat</div>
                        </button>
                    </div >
                </>
            </main >
            {/*Feedback modal */}
            {isFeedback && (<FeedbackModal onPressFeedback={() => { setIsFeedback(false) }} />)}
            <div className="resolution_popup">
                <img src="../../public/images/logo.png" className="logo" alt="Arc3dia logo" />
                <h2>Arc3dia for mobile is coming soon!</h2>
                <img src="../../public/images/res.png" alt="Mobile devices" />
                <p className="gray_text">Please use a laptop or a desktop to visit this page</p>
            </div>
        </>
    )
}