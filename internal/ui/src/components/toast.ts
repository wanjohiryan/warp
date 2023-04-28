import * as React from "react";
//@ts-ignore for some reason react-hot-toast does not have type definitions in the @types dir :(
import { Toaster, toast } from "react-hot-toast";
//@ts-ignore
import Notif from "../../public/audios/notification.mp3";

export class Toast {
    audio: HTMLAudioElement;

    constructor() {
        this.audio = new Audio(Notif);
    }

    async showError(msg: string) {
        toast.error(msg, {
            className: "toaster_error"
        })
        await this.audio.play()
    };

    async showSuccess(msg: string) {
        toast.error(msg, {
            className: "toaster_success"
        })
        await this.audio.play()
    }

}