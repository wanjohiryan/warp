import * as React from "react";
import Audio from "../audio"
import { MediaTransport } from "../transport"
import Video from "../video"

export interface PlayerInit {
	// canvas: React.RefObject<HTMLCanvasElement | null>;
	getLatency: (t: number) => void;

}

export default class Player {
	audio!: Audio;
	video!: Video;
	transport!: MediaTransport;
	getLatency: (t: number) => void;

	constructor(props: PlayerInit) {
		this.getLatency = props.getLatency
	}

	setCanvas(canvas: React.RefObject<HTMLCanvasElement | null>) {

		this.audio = new Audio()

		this.video = new Video({
			canvas: canvas.current!.transferControlToOffscreen(),
		})

		this.transport = new MediaTransport({
			path: "watch",
			getLatency: this.getLatency,

			audio: this.audio,
			video: this.video,
		})
	}

	resize(e: { height: number, width: number }) {
		this.video.resize({ width: e.width, height: e.height })
	}

	async close() {
		await this.transport.close()
	}

	async play() {
		// a promise that resolves if the audio.play does not return an error
		return new Promise<void>(async (resolve, reject) => {
			try {
				await this.audio.play({});
				resolve();
			} catch (error) {
				reject(error);
			}
		});

		// await this.audio.play({})
		//this.video.play()
	}

	onMessage(msg: any) {
		if (msg.sync) {
			msg.sync
		}
	}

	async setMaxBitrate(v: number) {
		await this.transport.setMaxBitrate(v)
	}
}