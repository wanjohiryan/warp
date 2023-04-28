import * as React from "react";

const emojiNames = [
    "grinning-face-with-big-eyes",
    "grinning-face-with-smiling-eyes",
    "hot-face",
    "face-with-peeking-eye",
    "face-with-steam-from-nose",
    "zany-face",
    "hugging-face",
    "face-screaming-in-fear",
    "grinning-face-with-sweat",
    "loudly-crying-face",
    "money-mouth-face",
    "thinking-face",
    "face-with-raised-eyebrow",
    "angry-face",
    "face-with-symbols-on-mouth",
    "confused-face",
    "anguished-face",
    "cowboy-hat-face"
]

export default function EmojiModal() {
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
                width: 270,
                opacity: 1,
                transform: "translateY(0px) scale(1) translateZ(0px)",
            }}>
            <h5>Emojis</h5>
            <div className="panel_option stream_format">
                <div className="switch">
                    <div className="styles_wrapper">
                        <div className="col-4">
                            {emojiNames.map((name, index) => (
                                <button key={`emoji-${index}`} className="emoji_button">
                                    <img loading="eager" src={`https://raw.githubusercontent.com/MKAbuMattar/fluentui-emoji/main/icons/modern/${name}.svg`} />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            {/* <div className="stream_details">
                <div className="row">
                    <span>Imag</span>
                    <p>1920x1080</p>
                </div>
            </div> */}
        </div>
    )
}