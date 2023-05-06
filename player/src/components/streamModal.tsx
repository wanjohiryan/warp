import * as React from "react";

type Props = {}

export default function StreamModal({ }: Props) {
    const buttonsStreamRef = React.useRef<HTMLButtonElement[] | any>([]);


    const handleButtonClickStream = (index) => {
        buttonsStreamRef.current.forEach((button, i) => {
            const buttonSpan = button.querySelector('span.active_indicator');
            if (i !== index && buttonSpan) {
                buttonSpan.remove();
            }
        });
        const button = buttonsStreamRef.current[index];
        const buttonSpan = button.querySelector('span.active_indicator');
        if (!buttonSpan) {
            const newSpan = document.createElement('span');
            newSpan.classList.add('active_indicator');
            button.appendChild(newSpan);
        }
    };
    return (
        <div
            className="drop_menu"
            style={{
                top: "unset",
                bottom: "calc(100% + 10px)",
                width: 248,
                opacity: 1,
                transform: "translateY(0px) scale(1) translateZ(0px)",
            }}>
            <h5>Stream Settings</h5>
            <div className="panel_option stream_format">
                <h6>Stream To</h6>
                <div className="switch">
                    <button
                        className="switch_button only_label"
                        onClick={() => handleButtonClickStream(0)}
                        ref={(el) => (buttonsStreamRef.current[0] = el)}>
                        <p>Youtube</p >
                        <span className="active_indicator"></span>
                    </button>
                    <button
                        className="switch_button only_label"
                        onClick={() => handleButtonClickStream(1)}
                        ref={(el) => (buttonsStreamRef.current[1] = el)}>
                        <p>Twitch</p >
                    </button>
                </div>
            </div>
            <div style={{ position: "relative" }} className="panel_option stream_url">
                <input type="text" className="input_text" placeholder="Stream Url" />
                {/* <div className="url_icon" style={{ background: "rgb(194, 225, 194)" }}></div> */}
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"> <path d="M6.354 5.5H4a3 3 0 0 0 0 6h3a3 3 0 0 0 2.83-4H9c-.086 0-.17.01-.25.031A2 2 0 0 1 7 10.5H4a2 2 0 1 1 0-4h1.535c.218-.376.495-.714.82-1z" /> <path d="M9 5.5a3 3 0 0 0-2.83 4h1.098A2 2 0 0 1 9 6.5h3a2 2 0 1 1 0 4h-1.535a4.02 4.02 0 0 1-.82 1H12a3 3 0 1 0 0-6H9z" /> </svg>
            </div>
            <div className="stream_details">
                <div className="row">
                    <span>Stream Resolution</span>
                    <p>1920x1080</p>
                </div>
            </div>
        </div>
    )
}