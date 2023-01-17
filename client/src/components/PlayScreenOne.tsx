import React, { RefObject, useEffect, useState } from "react";

interface Props {
    videoRef: RefObject<HTMLVideoElement | null>;
}

export default function PlayScreenOne({videoRef}:Props) {

    const [showContainer, setShowContainer] = useState(true); //by default, show

   
    //   vidRef.volume = 0.5;

    useEffect(() => {

        if(videoRef.current){
        
            function playFunc(e:any) {
                setShowContainer(false);
        
                // Only fire once to restore pause/play functionality
                videoRef.current!.removeEventListener("play", playFunc);
            }
        
            videoRef.current.addEventListener("play", playFunc);
        }
    }, []);



    return (
        <>
            {showContainer && (<div id="play">
                <div
                    onClick={(e)=>{
                        videoRef.current && videoRef.current.play();//we have already checked for `null`

                        e.preventDefault();
                    }}
                    id="play-btn">
                    <img src="../icons/Play.svg" id="play-icon" />
                </div>
            </div>)}
        </>
    )
}