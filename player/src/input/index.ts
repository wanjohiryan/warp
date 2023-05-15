import * as React from "react";
import { InputTransport } from "../transport"

export interface InputInit {}

export default class Input {
    transport: InputTransport;

    // constructor(props: InputInit) {
    constructor() {
        this.transport = new InputTransport({ path: "play" })
    }

    async sendMessage(message: any) {        
        await this.transport.sendMessage(message)
    }

    async close() {
        await this.transport.close()
    }
}