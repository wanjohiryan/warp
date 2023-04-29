import { Slider } from "@mui/material";
import React, { useRef, useState } from "react";
import StreamModal from "./streamModal";
import Controller from "../svg/gpad"
import Logo from "../svg/logo";
import LogoName from "../svg/logoName";
import { Toast } from "./toast";

type Props = {
    onPressFeedback: () => void;
}

export default function Sidebar({ onPressFeedback }: Props) {
    const toast = new Toast();
    const buttonsRef = useRef<HTMLButtonElement[] | any>([]);

    const [sliderValue, setSliderValue] = useState(0);
    const [openStream, setOpenStream] = useState(false);


    const handleGitBtnClick = () => {
        window.open("https://github.com/wanjohiryan/qwantify");
    }
    const handleButtonClick = (index, clicked = true) => {
        buttonsRef.current.forEach((button, i) => {
            const buttonSpan = button.querySelector('span.active_indicator');
            if (i !== index && buttonSpan) {
                buttonSpan.remove();
            }
        });
        const button = buttonsRef.current[index];
        const buttonSpan = button.querySelector('span.active_indicator');
        if (!buttonSpan) {
            const newSpan = document.createElement('span');
            newSpan.classList.add('active_indicator');
            button.appendChild(newSpan);
        }
        //prevent the thumb from freezing
        if (clicked) {
            setSliderValue(index * 50)
        }
    };

    return (
        <div className="sidebar">

            <nav className="navbar">
                {/*TODO:add the official arc3dia website link here */}
                <div className="name">
                    <div className="logo_svg">
                        <Logo className="logo" />
                    </div>
                    <div className="arc3dia_tag">
                        {/* ARC3DIA */}
                        <LogoName fill="currentColor" />
                        <span className="beta_tag"><sup>BETA</sup></span>
                    </div>
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" clipRule="evenodd" d="M16.243 22.141a10.606 10.606 0 0 1-4.25.859c-1.498 0-2.91-.286-4.236-.859a11.122 11.122 0 0 1-3.508-2.385 11.364 11.364 0 0 1-2.384-3.517A10.518 10.518 0 0 1 1 12c0-1.5.288-2.912.865-4.24a11.423 11.423 0 0 1 2.377-3.516A11.04 11.04 0 0 1 7.743 1.86 10.572 10.572 0 0 1 11.98 1a10.6 10.6 0 0 1 4.25.859 11.202 11.202 0 0 1 3.514 2.385 11.306 11.306 0 0 1 2.391 3.517C22.712 9.088 23 10.5 23 12s-.288 2.912-.865 4.24a11.364 11.364 0 0 1-2.384 3.516 11.122 11.122 0 0 1-3.508 2.385Zm1.077-9.405c.245-.245.367-.495.367-.75 0-.245-.122-.49-.367-.736l-3.61-3.64c-.164-.163-.382-.244-.654-.244a.886.886 0 0 0-.913.913c0 .245.09.468.272.668l1.172 1.158 1.308 1.05-2.507-.11H7.225a.913.913 0 0 0-.674.267.914.914 0 0 0-.266.674c0 .273.089.498.266.675a.913.913 0 0 0 .674.266h5.163l2.52-.095-1.321 1.05-1.171 1.144a.908.908 0 0 0-.273.668.91.91 0 0 0 .259.661c.172.177.39.266.654.266a.886.886 0 0 0 .654-.26l3.61-3.625Z" fill="CurrentColor"></path></svg>
                </div>
                <div className="right">
                    {/* this sends feedback back to me */}
                    <button onClick={onPressFeedback} className="btn_list_icon tip">
                        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M17.91 14.32c-.26.25-.38.61-.32.97l.88 4.92c.07.41-.11.83-.45 1.08-.35.25-.8.28-1.17.08l-4.43-2.31c-.16-.09-.33-.13-.5-.14h-.28c-.1.01-.19.04-.27.09l-4.43 2.32c-.22.11-.47.14-.71.11-.6-.12-.99-.68-.89-1.28l.89-4.92a1.14 1.14 0 0 0-.32-.98l-3.611-3.5c-.31-.3-.41-.74-.27-1.13.13-.4.476-.69.88-.75l4.97-.73c.37-.04.71-.27.88-.61l2.18-4.49c.05-.1.11-.2.2-.27l.09-.07c.04-.06.1-.1.16-.13l.1-.04.17-.07h.42c.37.03.7.26.88.6l2.21 4.47c.16.32.47.55.83.6l4.97.72c.42.06.77.35.91.75.13.4.01.84-.29 1.12l-3.74 3.54Z"></path></svg>
                        <div className="tooltip"
                            style={{
                                top: "120%",
                                left: "-100%"
                            }}>Feedback</div>
                    </button>
                    {/* this refers back to github repo */}
                    <button onClick={handleGitBtnClick} className="btn_list_icon tip">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 496 512"><path fill="currentColor" d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3.3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5.3-6.2 2.3zm44.2-1.7c-2.9.7-4.9 2.6-4.6 4.9.3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3.7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3.3 2.9 2.3 3.9 1.6 1 3.6.7 4.3-.7.7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3.7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3.7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9 1.6 2.3 4.3 3.3 5.6 2.3 1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z" /></svg>
                        <div className="tooltip"
                            style={{
                                top: "120%",
                                left: "-100%"
                            }}>Github</div>
                    </button>
                </div>
            </nav>
            <div className="panel">
                <div className="fragments"
                    style={{
                        transform: "none",
                        transformOrigin: "50% 50% 0px"
                    }}>
                    <div className="panel_fragment controls">
                        <div className="panel_option gpad">
                            <h6>Controller</h6>
                            <div onClick={() => { toast.showError("Controller not implemented yet") }} className="gpad_background">
                                <Controller height={150} width={300} />
                            </div>
                        </div>
                        <div className="panel_option buffer">
                            <h6>Video Buffer Health</h6>
                            <div className="slider">
                                <div className="number_icon" >
                                    <p>0%</p>
                                </div>
                                <Slider
                                    aria-label="bandwidth"
                                />
                                <div className="number_icon">
                                    <p>100%</p>
                                </div>
                            </div>
                        </div>
                        <div className="panel_option buffer">
                            <h6>Audio Buffer Health</h6>
                            <div className="slider">
                                <div className="number_icon" >
                                    <p>0%</p>
                                </div>
                                <Slider
                                    aria-label="bandwidth"
                                />
                                <div className="number_icon">
                                    <p>100%</p>
                                </div>
                            </div>
                        </div>
                        <div className="panel_option bandwidth">
                            <h6>Resolution</h6>
                            <div className="slider">
                                <div className="number_icon" >
                                    {
                                        //FIXME: change this values on the server too
                                    }
                                    <p>15 mb/s</p>
                                </div>
                                <Slider
                                    value={sliderValue}
                                    onChange={(e: any) => {
                                        const v = e.target.value
                                        setSliderValue(v)

                                        if (v <= 40) {
                                            handleButtonClick(0, false)
                                        } else if (v >= 50) {
                                            handleButtonClick(1, false)
                                        }
                                        // } else if (v >= 70) {
                                        //     handleButtonClick(2, false)
                                        // }
                                    }}
                                    aria-label="bandwidth"
                                />
                                <div className="number_icon" >
                                    <p>30 mb/s</p>
                                </div>
                            </div>
                            <div className="switch">
                                <button
                                    className="switch_button"
                                    onClick={() => handleButtonClick(0)}
                                    ref={(el) => (buttonsRef.current[0] = el)}>
                                        <div>720p</div>
                                    <span className="active_indicator" />
                                </button>
                                <button
                                    className="switch_button"
                                    onClick={() => handleButtonClick(1)}
                                    ref={(el) => (buttonsRef.current[1] = el)}>
                                        <div>1080p</div>
                                </button>
                                <button
                                    className="switch_button"
                                    // ref={(el) => (buttonsRef.current[2] = el)}
                                    onClick={() => {toast.showError("4k is not implemented yet")}}>
                                        <div>2160p</div>
                                </button>
                            </div>
                        </div>
                        <div className="panel_option">
                            <div className="latency_details" >
                                <div className="row">
                                    <span className="truncate">Latency</span>
                                    <p>200 ms</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="stream_options">
                    <div className="wrapper">
                        <button onClick={() => { toast.showError("Cloud Stream not implemented yet") }} className="stream_btn btn_lg_mix bg_blur idle ">
                            <div className="light" />
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width={800}
                                height={800}
                                viewBox="0 0 32 32"
                            >
                                <title>{"signal-stream"}</title>
                                <path d="M16 11.75A4.25 4.25 0 1 0 20.25 16 4.255 4.255 0 0 0 16 11.75zm0 6A1.75 1.75 0 1 1 17.75 16 1.752 1.752 0 0 1 16 17.75zM3.25 16a14.058 14.058 0 0 1 3.784-8.789l-.007.008a1.25 1.25 0 0 0-1.77-1.766A16.337 16.337 0 0 0 .751 15.962L.75 16a16.368 16.368 0 0 0 4.514 10.553l-.006-.006a1.249 1.249 0 1 0 1.767-1.765 13.936 13.936 0 0 1-3.774-8.743l-.002-.038zm6.113 0a9.667 9.667 0 0 1 2.6-6.026l-.005.005a1.25 1.25 0 0 0-1.77-1.765 12.058 12.058 0 0 0-3.323 7.759l-.001.028a12.078 12.078 0 0 0 3.329 7.79l-.005-.005a1.249 1.249 0 1 0 1.767-1.765 9.565 9.565 0 0 1-2.591-5.993l-.001-.027zM26.744 5.453a1.25 1.25 0 1 0-1.772 1.766 14.013 14.013 0 0 1 3.775 8.741l.002.04a14.045 14.045 0 0 1-3.784 8.789l.007-.008a1.25 1.25 0 0 0 1.772 1.766 16.343 16.343 0 0 0 4.504-10.509l.001-.038a16.373 16.373 0 0 0-4.512-10.553l.006.007zm-4.933 2.761a1.25 1.25 0 0 0-1.77 1.766 9.642 9.642 0 0 1 2.594 5.992l.001.028a9.687 9.687 0 0 1-2.601 6.027l.005-.005a1.25 1.25 0 0 0 1.772 1.766 12.073 12.073 0 0 0 3.323-7.759l.001-.028a12.075 12.075 0 0 0-3.331-7.791l.005.005z" />
                            </svg>                                    <div>
                                <span>Stream</span>
                                <p>Connect to Twitch or Youtube</p>
                            </div>
                        </button>
                        <div className="dropdown_menu stream_settings_drop">
                            <div className="button_wrapper">
                                <button onClick={() => { setOpenStream(f => !f) }} className="stream_settings_btn btn_lg_icon tip">
                                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" fillRule="evenodd" d="M17.38 13.7c1.71 0 3.11 1.38 3.11 3.09 0 1.7-1.4 3.09-3.12 3.09-1.72 0-3.12-1.39-3.12-3.1 0-1.71 1.39-3.1 3.11-3.1Zm0 1.5c-.89 0-1.62.71-1.62 1.59 0 .88.72 1.59 1.61 1.59.88 0 1.61-.72 1.61-1.6 0-.88-.73-1.6-1.62-1.6Zm-7.31.88a.749.749 0 1 1 0 1.5H3.76c-.42 0-.75-.34-.75-.75 0-.42.33-.75.75-.75h6.3ZM6.1 3.98c1.71 0 3.11 1.39 3.11 3.09s-1.4 3.09-3.12 3.09c-1.72 0-3.12-1.388-3.12-3.1 0-1.71 1.39-3.1 3.11-3.1Zm0 1.5c-.89 0-1.62.71-1.62 1.59 0 .88.72 1.59 1.61 1.59.89 0 1.61-.72 1.61-1.6 0-.89-.73-1.6-1.62-1.6Zm13.07.9a.749.749 0 1 1 0 1.5h-6.3c-.42 0-.75-.34-.75-.75 0-.42.33-.75.75-.75h6.3Z"></path></svg>
                                    <div className="tooltip" style={{ top: "-100%", left: "-100%" }}>Stream Settings</div>
                                </button>
                            </div>
                            {openStream && <StreamModal />}
                        </div>
                    </div>
                    <button
                        onClick={() => { toast.showError("Save Game State not implemented yet") }}
                        style={{
                            borderRadius: 10,
                        }}
                        className="btn_lg_icon bg_gray_icon bg_blur state_btn tip" >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 1024 1024"
                        >
                            <path fill="currentColor" d="M128 384a42.667 42.667 0 0 0 42.667-42.667v-128a42.667 42.667 0 0 1 42.666-42.666h128a42.667 42.667 0 0 0 0-85.334h-128a128 128 0 0 0-128 128v128A42.667 42.667 0 0 0 128 384zm213.333 469.333h-128a42.667 42.667 0 0 1-42.666-42.666v-128a42.667 42.667 0 0 0-85.334 0v128a128 128 0 0 0 128 128h128a42.667 42.667 0 0 0 0-85.334zm170.667-512A170.667 170.667 0 1 0 682.667 512 170.667 170.667 0 0 0 512 341.333zm0 256A85.333 85.333 0 1 1 597.333 512 85.333 85.333 0 0 1 512 597.333zm298.667-512h-128a42.667 42.667 0 0 0 0 85.334h128a42.667 42.667 0 0 1 42.666 42.666v128a42.667 42.667 0 0 0 85.334 0v-128a128 128 0 0 0-128-128zM896 640a42.667 42.667 0 0 0-42.667 42.667v128a42.667 42.667 0 0 1-42.666 42.666h-128a42.667 42.667 0 0 0 0 85.334h128a128 128 0 0 0 128-128v-128A42.667 42.667 0 0 0 896 640z" />
                        </svg>
                        <div className="tooltip" style={{ top: "-100%", left: "-80%" }}>Save game state</div>
                    </button>
                </div>
            </div>
        </div>
    )
}