import * as Message from "./message"
import * as Stream from "../stream"
import getUrl from "./getUrl";


export interface TransportInit {
    path: string;
}

export default class InputTransport {
    quic: Promise<WebTransport>;
    api: Promise<WritableStream>;


    constructor(props: TransportInit) {
        this.quic = this.connect(props)

        // Create a unidirectional stream for all of our messages
        this.api = this.quic.then((q) => {
            return q.createUnidirectionalStream()
        })

        // async functions
        this.receiveStreams()
    }

    async close() {
        (await this.quic).close()
    }

    // Helper function to make creating a promise easier
    private async connect(props: TransportInit): Promise<WebTransport> {

        const url = getUrl(props.path)

        const quic = new WebTransport(url)
        await quic.ready
        return quic
    }

    async sendMessage(msg: any) {
        const payload = JSON.stringify(msg)
        const size = payload.length + 8

        const stream = await this.api

        const writer = new Stream.Writer(stream)
        await writer.uint32(size)
        await writer.string("warp")
        await writer.string(payload)
        writer.release()
    }

    async receiveStreams() {
        const q = await this.quic
        const streams = q.incomingUnidirectionalStreams.getReader()

        while (true) {
            const result = await streams.read()
            if (result.done) break

            const stream = result.value
            this.handleStream(stream) // don't await
        }
    }

    async handleStream(stream: ReadableStream) {
        let r = new Stream.Reader(stream)

        while (!await r.done()) {
            const size = await r.uint32();
            const typ = new TextDecoder('utf-8').decode(await r.bytes(4));

            if (typ != "warp") throw "expected warp atom"
            if (size < 8) throw "atom too small"

            const payload = new TextDecoder('utf-8').decode(await r.bytes(size - 8));
            const msg = JSON.parse(payload)

            //TODO: handle heartbeat type of messages
            console.log(msg)

            // if (msg.init) {
            // 	return this.handleInit(r, msg.init as Message.Init)
            // } else if (msg.segment) {
            // 	return this.handleSegment(r, msg.segment as Message.Segment)
            // }
        }
    }

}
