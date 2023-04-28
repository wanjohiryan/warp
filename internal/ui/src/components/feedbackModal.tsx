import React from "react";

type Props = {
    onPressFeedback: () => void;
}

const emojiNames = [
    "face-with-symbols-on-mouth",
    "neutral-face",
    "smirking-face",
    "smiling-face-with-smiling-eyes",
    "smiling-face-with-heart-eyes"
]

export default function FeedbackModal({ onPressFeedback }: Props) {
    const buttonsRef = React.useRef<HTMLButtonElement[] | any>([]);


    const handleButtonClick = (index) => {
        buttonsRef.current.forEach((button, i) => {
            const buttonSpan = button.classList.remove('is_active');
            if (i !== index && buttonSpan) {
                buttonSpan.remove();
            }
        });
        const button = buttonsRef.current[index];
        const buttonSpan = button.classList.remove('is_active');
        if (!buttonSpan) {
            button.classList.add('is_active');
        }
    };

    const renderEmoticon = (name: string) => {
        return
    }

    return (
        <div>
            <div
                className="modal_container"
                style={{
                    justifyContent: "center",
                    position: "fixed",
                    inset: 0,
                    zIndex: 9999,
                    opacity: 1,
                }}>
                <div className="modal_effects feedback_modal"
                    style={{
                        width: "calc(100 % - 24px)",
                        maxWidth: 360,
                        maxHeight: "calc(100vh - 32px)",
                        opacity: 1,
                        transform: "translateY(0px) scale(1) translateZ(0px)"
                    }}>
                    <div className="modal_nav modal_close">
                        <h4></h4>
                        <button onClick={onPressFeedback} className="btn bg_gray_icon bg_blur round">
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="20.211" height="2.021" rx="1.011" transform="scale(.99137 1.00855) rotate(45 -2.229 8.65)" fill="currentColor"></rect><rect width="20.211" height="2.021" rx="1.011" transform="matrix(.701 -.71316 .701 .71316 4.415 18.414)" fill="currentColor"></rect></svg>
                        </button>
                    </div>
                    <section className="reactions">
                        <h1 className="h3">
                            Send feedback,<br />
                            <span className="gray_text">We read them all!</span>
                        </h1>
                        <div className="reactions_list">
                            {emojiNames.map((name, key) => (
                                <button
                                    key={`emojif-${key}`}
                                    onClick={() => handleButtonClick(key)}
                                    ref={(el) => (buttonsRef.current[key] = el)}
                                    className="h1 round reaction_item">
                                    <img loading="eager" src={`https://raw.githubusercontent.com/MKAbuMattar/fluentui-emoji/main/icons/modern/${name}.svg`} />
                                </button>
                            ))}
                        </div>
                        <p className="h4">How can we improve your gaming experience?</p>
                    </section>
                    <section className="message" >
                        <textarea
                            placeholder="Write your feedback..."
                            className="multiline_input" rows={1} cols={1} wrap="on"
                            style={{ resize: "none", height: 198 }}></textarea>
                        <small className="danger"></small>
                        <button className="btn_lg_label">Send</button>
                    </section>
                </div>
            </div>
        </div >
    )
}