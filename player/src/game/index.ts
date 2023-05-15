import * as React from "react";
import getUrl from "../transport/getUrl";

export interface GameProps { }

//TODO: add webtransport to handle what the server does
export default class Game {

    constructor() {
        //starts the game
        fetch(getUrl("game"))
            .catch(err => {
                console.error(err);
                throw err;
            })
    }
}