import React, { useRef } from "react";
import EmojiModal from "./emojiModal";
import { Toast } from "./toast";

type Props = {
}

export default function Chat({ }: Props) {
    const toast = new Toast()

    const buttonsRef = useRef<HTMLButtonElement[] | any>([]);
    const [openEmoji, setOpenEmoji] = React.useState(false);

    const handleButtonClick = (index: number) => {
        buttonsRef.current.forEach((button: any, i: any) => {
            const buttonSpan = button.classList.remove('active');
            if (i !== index && buttonSpan) {
                buttonSpan.remove();
            }
        });
        const button = buttonsRef.current[index];
        const buttonSpan = button.classList.remove('active');
        if (!buttonSpan) {
            button.classList.add('active');
        }
    };

    const handleFriendsInvite = async () => {
        await toast.showSuccess("Invite message copied to clipboard!");
    }


    return (
        <div className="chat_panel" style={{ opacity: 1, transform: " translateX(0px) translateZ(0px)" }}>
            <div className="panel">
                <div className="head">
                    <div className="tabs">
                        <button
                            onClick={() => handleButtonClick(0)}
                            ref={(el) => (buttonsRef.current[0] = el)}
                            className="tab_button active">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 950 980"
                            >
                                <path fill="currentColor" d="M371.5.6c-39.9 2.6-88.8 12.5-122.9 24.9-76.4 27.7-138.4 72.4-183.1 132-36 47.9-56.2 98.6-63.6 159-1.8 14.5-1.5 54.8.5 73.2 5.2 47.9 16.5 87.5 36.2 126.3 18.2 36.1 44.2 70.4 73.5 97l10.4 9.4.5 86.8.5 86.7 19.5-11.3c10.7-6.2 49.4-28.6 86-49.8l66.5-38.5 13.8 1.8c32 4.1 54.3 5.4 90.2 5.4 36.6-.1 45.4-.8 72.5-5.6 140.5-25 248.7-124.6 282.9-260.4 11-43.9 13.8-92.6 7.6-134C743.6 177.9 643.8 64.9 511.6 19.4 488.3 11.4 460.9 5.1 435 2 426.1.9 381.9 0 371.5.6zM208.2 307.1c14.3 3 25.8 12 32.5 25.5 3.7 7.7 3.8 8 3.8 19.3s-.1 11.8-3.7 19.4c-14 29.2-51 35.6-73.8 12.8-3.5-3.5-6.9-8.2-9-12.6-3.1-6.3-3.5-8-3.8-17.5-.3-8.7 0-11.5 1.7-16.4 5.4-15.2 16.7-25.8 32.1-29.8 7.7-2 13-2.2 20.2-.7zm182.9-.1c13.6 2.5 27.5 13.1 33.3 25.4 13.1 27.6-4.2 60.2-34.4 64.9-21.4 3.3-42.2-9-49.8-29.4-12.2-32.8 16.6-67.3 50.9-60.9zm184 0c23.8 4.4 41 28.3 37.1 51.7-4.5 27-30.6 44.4-56.6 37.7-20.1-5.2-34.6-23.8-34.6-44.4 0-28.1 26.5-50.1 54.1-45z" />
                                <path fill="currentColor" d="M826.5 332.2c0 55.4-.5 63.1-5.6 93.4-11.1 66.4-37.5 125.7-79 178-13.3 16.8-43.8 47.3-60.9 60.8-66.7 53-150.5 86.4-243 97-28.5 3.3-41.4 3.9-100.5 4.5l-61 .6 12.5 11.4c50.9 46.3 103.5 75.6 163 90.6 31.7 8 52.3 10.5 90.5 11.2 30.6.5 49.6-.5 73-4.1 8.2-1.3 9.3-1.3 12 .3 1.7 1 40 24.6 85.2 52.4C758 956.2 795.4 979 796 979c.7 0 1-28.5 1-86.4v-86.5l8.8-6.3c37.1-26.7 71.1-62.9 95.5-101.5 8.3-13.2 23.3-43.3 28.3-56.8 22.7-61.8 26.1-125.5 9.9-187-11.7-44.6-30.4-81.3-62.5-122.7-6.1-8-48.1-50.8-49.7-50.8-.4 0-.8 23.1-.8 51.2z" />
                            </svg>
                            Chat
                        </button>
                        <button
                            onClick={() => handleButtonClick(1)}
                            ref={(el) => (buttonsRef.current[1] = el)}
                            className="tab_button">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 251 201"
                            >
                                <path fill="currentColor" d="M111.7 15C93.1 21.6 82 37.1 82 56.6c0 29.9 28.3 50.3 57.3 41.4 24.9-7.7 37-37.5 25.1-61.5-3.8-7.6-12.4-15.8-20.8-19.6-6.2-2.9-8.3-3.4-16.6-3.6-7.6-.3-10.7.1-15.3 1.7zM29.2 39.2c-4.7 1.6-12.2 8.5-14.3 13.3-4.3 9.3-1.2 22.8 6.7 29.4 4.9 4 13.2 6.5 19.1 5.7 14-1.9 24.1-15.6 21.3-29C59.5 46.3 51.2 39 39.2 38.4c-3.7-.2-8.2.2-10 .8zM204.7 39.4c-8.2 3-14.7 11-16.2 20.3s4.7 20.8 13.7 25.4c12.2 6.2 27.6.9 33.4-11.5 4.6-10 2.8-20.3-5.1-28.1-7.1-7.2-16.5-9.4-25.8-6.1zM15.4 102.4c-4.5 2-10.2 7.4-12.7 12C.8 118 .5 120.1.5 130.7c0 10.8.2 12.5 2.1 15 3.1 4.2 7.4 5.2 22.1 5.2l13.3.1.6-2.8c3.4-15.4 12.2-29.1 23.6-36.7 2.4-1.6 4.5-3 4.7-3.2.9-.6-2.7-3.8-6.4-5.4-3.4-1.6-6.7-1.9-23-1.8-13.7 0-19.9.4-22.1 1.3zM190.5 102.9c-3.7 1.6-7.3 4.8-6.4 5.4.2.2 2.4 1.6 4.8 3.2 10.3 6.9 19.6 20.6 22.4 33.1l1.4 5.9h14.9c16.7 0 19.4-.9 22-7.2 1.9-4.4 1.8-18.7-.2-25.4-1.9-6.6-9.2-14.2-15.1-15.8-2.1-.6-11.9-1.1-21.8-1.1-15.2 0-18.6.3-22 1.9zM86 114.1c-6.9 1.3-16.5 6.5-21.9 11.8-10.1 9.9-14.7 22.7-13.9 39.5.5 11.5 3.3 17.2 10.1 20.5 4.3 2.1 5.4 2.1 65.2 2.1 59.8 0 60.9 0 65.2-2.1 3-1.5 5.2-3.5 7.1-6.7 2.6-4.5 2.7-5.3 2.6-17.2-.1-9.8-.6-13.7-2.2-18.1-5.9-16.4-18.9-27.2-36-30.1-7.1-1.2-7.5-1.1-15.5 1.7-7.6 2.8-9.2 3-21.7 3-12.3-.1-14.1-.3-20.4-2.8-7.1-2.8-10.9-3.1-18.6-1.6z" />
                            </svg>
                            Friends
                        </button>
                    </div>
                </div>
                <div className="fragments"
                    style={{
                        transform: "none",
                        transformOrigin: "50% 50% 0px"
                    }}>
                    <div className="panel_fragment chat controls">
                        {/*Inside here that is where the chat will go */}
                        <div className="panel_option chat">
                            <div className="share_banner">
                                <div className="h_text">
                                    <span>Invite friends and other players to your party</span>
                                    <button onClick={handleFriendsInvite}>
                                        <p>Copy invite link</p>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="chat_pane">
                    <div className="wrapper">
                        <div style={{ position: "relative" }} className="panel_option chat_input">
                            <input type="text" className="input_text chat" placeholder="Send a message" />
                            <div style={{ position: "absolute", right: "0px", top: "0px" }} className="dropdown_menu stream_settings_drop">
                                <div className="button_wrapper">
                                    <button
                                        onClick={() => { setOpenEmoji(f => !f) }}
                                        className="btn_lg_icon tip">
                                        <svg fill="currentColor" version="1.1" viewBox="0 0 20 20"><g><path d="M7 11a1 1 0 100-2 1 1 0 000 2zM14 10a1 1 0 11-2 0 1 1 0 012 0zM10 14a2 2 0 002-2H8a2 2 0 002 2z"></path><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-2 0a6 6 0 11-12 0 6 6 0 0112 0z" clipRule="evenodd"></path></g></svg>
                                        <div className="tooltip" style={{ top: "-70%", right: 0 }}>Emojis</div>
                                    </button>
                                </div>
                                {/* <EmojiModal /> */}
                                {openEmoji && <EmojiModal />}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}