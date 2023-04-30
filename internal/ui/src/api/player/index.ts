import React from "react";
import Audio from "../audio"
import Transport from "../transport"
import Video from "../video"

export interface PlayerInit {
	fingerprint?: WebTransportHash; // the certificate fingerprint, temporarily needed for local development
	canvas: React.RefObject<HTMLCanvasElement>;
}

export default class Player {
	audio: Audio;
	video: Video;
	transport: Transport;

	constructor(props: PlayerInit) {
		this.audio = new Audio()
		this.video = new Video({
			canvas: props.canvas.current!.transferControlToOffscreen(),
		})

		this.transport = new Transport({
			url: this.getUrl("api"),
			fingerprint: props.fingerprint,

			audio: this.audio,
			video: this.video,
		})
	}

	async close() {
		this.transport.close()
	}

	play() {
		this.audio.play({})
		//this.video.play()
	}

	onMessage(msg: any) {
		if (msg.sync) {
			msg.sync
		}
	}

	getUrl(path: string) {
		//to make sure there is no trailing slash ' /'
		let url = location.href.endsWith('/') ? location.href + path : location.href + '/' + path;
		return url;
	}
}