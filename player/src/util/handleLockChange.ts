import Input from '../input';
import * as React from "react";

export function handleLockChange(p:Input) {
    if (document.pointerLockElement) {
        document.addEventListener("keydown", (e) => {

            p.sendMessage({
                "keypress": {
                    "key": e.keyCode,
                }
            })
        })

        document.addEventListener("mousemove", (e) => {

            p.sendMessage({
                "mousemove": {
                    x: e.movementX,
                    y: e.movementY
                }
            })
        })

        document.addEventListener("click", (e) => {

            let button = "left";

            switch (e.button) {
                case 0:
                    button = "left";
                    break;

                case 1:
                    button = "center";
                    break;

                case 2:
                    button = "right";
                    break;

                default:
                    button = "left";
            }

            p.sendMessage({
                "mouseclick": {
                    button
                }
            })
        })

        document.addEventListener("wheel", (e) => {

            p.sendMessage({
                "mousescroll": {
                    x: e.deltaX,
                    y: e.deltaY
                }
            })
        })
    } else {
        document.removeEventListener("keydown", (e) => {

            // p.sendMessage({
            //     "keypress": {
            //         "key": e.key,
            //     }
            // })
        })

        document.removeEventListener("mousemove", (e) => {

            // p.sendMessage({
            //     "mousemove": {
            //         x: e.movementX,
            //         y: e.movementY
            //     }
            // })
        })

        document.removeEventListener("click", (e) => {

            let button = "left";

            switch (e.button) {
                case 0:
                    button = "left";
                    break;

                case 1:
                    button = "center";
                    break;

                case 2:
                    button = "right";
                    break;

                default:
                    button = "left";
            }

            // p.sendMessage({
            //     "mouseclick": {
            //         button
            //     }
            // })
        })

        document.removeEventListener("wheel", (e) => {
            // p.sendMessage({
            //     "mousescroll": {
            //         x: e.deltaX,
            //         y: e.deltaY
            //     }
            // })
        })
    }
}