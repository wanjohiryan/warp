import React, { useEffect, useRef, useState } from 'react';
import Player from '../player';
import Input from '../input';
import { handleLockChange } from '../util';
import Game from '../game';

type Props = {
    onPressFeedback: () => void;
    setLatency: (v:number) => void;
    // player: React.MutableRefObject<Player>;
}

export default function Canvas({ onPressFeedback, setLatency }: Props) {
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [exitedPlay, setExitedPlay] = useState<boolean>(true);
    const vidContainerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const player = useRef(new Player({ getLatency: (t) => setLatency(t) }))
    // const [player, setPlayer] = useState<Player>();

    useEffect(() => {
        player.current.setCanvas(canvasRef);

        //after the canvas has been handled, start the game in the server side
        new Game()

        // Listen for changes in height and width
        const observer = new ResizeObserver(entries => {
            for (let entry of entries) {
                player.current.resize({ width: entry.contentRect.width, height: entry.contentRect.height })
            }
        });

        observer.observe(canvasRef.current!);
    }, [])

    useEffect(() => {
        const p = new Input()

        document.addEventListener("pointerlockchange", () => { handleLockChange(p) });
    }, [])

    useEffect(() => {
        async function onFullscreenChange() {
            if (!document.fullscreenElement) {
                setExitedPlay(true)
            }
        }

        canvasRef.current?.addEventListener("fullscreenchange", onFullscreenChange)

        return () => canvasRef.current?.removeEventListener("fullscreenchange", onFullscreenChange)
    }, [])

    const playGame = async () => {
        if (canvasRef.current) {
            setIsPlaying(true);
            setExitedPlay(false);
            //@ts-ignore For some reason ts thinks this is wrong
            canvasRef.current.requestPointerLock({ unadjustedMovement: true });
            canvasRef.current?.requestFullscreen();

            try {
                await player.current.play();
            } catch (e) {
                console.warn("audio couldn't play:", e)
            }
        } else {
            console.warn("Canvas not found");
        }
    }

    return (
        <div className="canvas">
            <div
                ref={vidContainerRef}
                className="video_container preview"
                style={{
                    aspectRatio: "4 / 3",
                    width: "100%",
                    height: "auto",
                    display: "flex",
                    objectFit: "cover"
                }}>
                <canvas
                    ref={canvasRef}
                    className="canvasRef"
                />
            </div>
            {(!isPlaying && exitedPlay) && (<button
                onClick={playGame}
                className="video-play-button">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    xmlSpace="preserve"
                    viewBox="0 0 58.752 58.752">
                    <path d="M52.524 23.925 12.507.824c-1.907-1.1-4.376-1.097-6.276 0a6.294 6.294 0 0 0-3.143 5.44v46.205a6.29 6.29 0 0 0 3.131 5.435 6.263 6.263 0 0 0 6.29.005l40.017-23.103a6.3 6.3 0 0 0 3.138-5.439 6.315 6.315 0 0 0-3.14-5.442zm-3 5.687L9.504 52.716a.27.27 0 0 1-.279-.005.28.28 0 0 1-.137-.242V6.263a.28.28 0 0 1 .421-.243l40.01 23.098a.29.29 0 0 1 .145.249.283.283 0 0 1-.14.245z" />
                </svg>
            </button>)}
            {(exitedPlay && isPlaying) && (
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
                            <button onClick={onPressFeedback}>
                                <p>Submit feedback</p>
                            </button>
                            <button
                                onClick={() => {
                                    //FIXME: add logic to gracefully exit and kill the game, plus save current progress
                                    // setIsPlaying(false)
                                }}>
                                <p>Exit game</p>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div >
    )
}