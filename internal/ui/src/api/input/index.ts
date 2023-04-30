import * as Stream from "../stream"
// import { Message, MessageBeat } from "../src/api/common/message"


interface InputProps { }

export class Input {

	quic: Promise<WebTransport>;
	api: Promise<WritableStream>;

	interval!: number;

	timeRef?: DOMHighResTimeStamp;

	constructor() {


		//main path for playing
		const quic = new WebTransport(this.getUrl("play"))
		this.quic = quic.ready.then(() => { return quic }).catch((e) => { throw new Error("Someone is already playing") });

		// Create a unidirectional stream for all of our messages
		this.api = this.quic.then((q) => {
			return q.createUnidirectionalStream()
		})

		// async functions
		this.receiveStreams()
	}

	async close() {
		clearInterval(this.interval);
		(await this.quic).close()
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

	getUrl(path: string) {
		//to make sure there is no trailing slash ' /'
		let url = location.href.endsWith('/') ? location.href + path : location.href + '/' + path;
		return url;
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
		let r = new Stream.Reader(stream.getReader())

		while (!await r.done()) {
			const size = await r.uint32();
			const typ = new TextDecoder('utf-8').decode(await r.bytes(4));

			if (typ != "warp") throw "expected warp atom"
			if (size < 8) throw "atom too small"

			const payload = new TextDecoder('utf-8').decode(await r.bytes(size - 8));
			const msg = JSON.parse(payload) as any // Message

			if (msg.beat) {
				return this.handleHeartBeat(r, msg.beat)
			} else {
				// gracefully close the connection, we do not expect the server to send us anything
				await this.close()
			}
		}
	}
																				//msg: MessageBeat
	async handleHeartBeat(stream: Stream.Reader, msg: any) {
		//TODO: use the initial latency to calculate the network quality over time
		// const now = Date.now()
		// console.log("latency:", now - msg.timestamp);
		// nothing expected here

		while (1) {
			const data = await stream.read()
			if (!data) break

			const rightNow = Date.now()
			// gets the numbers only
			const t = new TextDecoder('utf-8').decode(data.slice(data.length - 15, data.length - 2));

			// this.latencyRef.innerHTML = rightNow - Number(t) + "ms"
		}
	}

	sendInput() {
		document.addEventListener("keydown", (e) => {
			e.preventDefault();

			this.sendMessage({
				"keyBoard": {
					"key": e.key,
				}
			})
		})

		document.addEventListener("mousemove", (e) => {
			e.preventDefault();

			this.sendMessage({
				"mouseMove": {
					x: e.movementX,
					y: e.movementY
				}
			})
		})

		document.addEventListener("click", (e) => {
			e.preventDefault();

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

			this.sendMessage({
				"mouseClick": {
					button
				}
			})
		})

		document.addEventListener("wheel", (e) => {
			e.preventDefault()

			this.sendMessage({
				"mouseScroll": {
					x: e.deltaX,
					y: e.deltaY
				}
			})
		})
	}

	stopInput() {
		document.removeEventListener("keydown", (e) => {
			e.preventDefault();

			this.sendMessage({
				"keyBoard": {
					"key": e.key,
				}
			})
		})

		document.removeEventListener("mousemove", (e) => {
			e.preventDefault();

			this.sendMessage({
				"mouseMove": {
					x: e.movementX,
					y: e.movementY
				}
			})
		})

		document.removeEventListener("click", (e) => {
			e.preventDefault();

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

			this.sendMessage({
				"mouseClick": {
					button
				}
			})
		})

		document.removeEventListener("wheel", (e) => {
			e.preventDefault()

			this.sendMessage({
				"mouseScroll": {
					x: e.deltaX,
					y: e.deltaY
				}
			})
		})

	}

}