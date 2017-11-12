import GIF from "gif";
import BaseController from "./base";

/**
 * Can be called from background script only
 */
export default class ScreenController extends BaseController {
    constructor(options) {
        console.log("[ScreenController] constructor init");

        super();

        this.activeStream = null;
        this.options = options;
        this.mediaOptions = {
            video: true,
            videoConstraints: {
                mandatory: {
                    chromeMediaSource: "tab",
                    maxWidth: 1920,
                    maxHeight: 1080,
                    maxFrameRate: 60,
                    minFrameRate: 5,
                    minWidth: 480,
                    minHeight: 360,
                    minAspectRatio: 1.77
                }
            }
        };
        this.isLoadedMetaData = false;

        this.start = this.start.bind(this);
        this.process = this.process.bind(this);
        this.stop = this.stop.bind(this);
    }

    start() {
        chrome.tabCapture.capture(this.mediaOptions, this.process);
    }

    process(stream) {
        this.activeStream = stream;

        console.log("[ScreenController.process] start capturing", this.options);

        const self = this;
        const gifsterOptions = this.options;
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        const video = document.createElement("video");
        const gif = new GIF({
            workerScript: chrome.extension.getURL("gif.worker.js"),
            workers: Math.round((gifsterOptions.duration * gifsterOptions.fps) + 0.3 * (gifsterOptions.duration * gifsterOptions.fps)),
            quality: 21 - gifsterOptions.quality,
            width: gifsterOptions.width,
            height: gifsterOptions.height
        });

        video.muted = true;
        video.autoplay = true;
        video.width = gifsterOptions.width;
        video.height = gifsterOptions.height;
        video.srcObject = stream;
        video.onloadedmetadata = () => {
            setTimeout(() => {
                self.isLoadedMetaData = true;
            }, 1000);
        };

        canvas.width = gifsterOptions.width;
        canvas.height = gifsterOptions.height;

        canvas.style.cursor = "none";
        video.style.cursor = "none";

        gif.on("start", () => console.time("render"));

        gif.on("progress", (p) => {
            console.log(`[ScreenController.process] progress ${Math.round(p * 100)}%`);
            if (!chrome.notifications) {
                chrome.runtime.sendMessage({renderingProgressNotification: true, progress: Math.round(p * 100)});
            }
            else {
                self.createRenderingProgressNotification(Math.round(p * 100));
            }
        });

        gif.on("finished", (blob) => {
            console.timeEnd("render");
            this.stop(blob);
        });

        video.addEventListener("play", () => {
            const interval = setInterval(() => {
                if (!self.isLoadedMetaData) {
                    return;
                }
                context.drawImage(video, 0, 0, canvas.width, canvas.height);
                gif.addFrame(canvas, {copy: true, delay: (1000 / gifsterOptions.fps)});
            }, (1000 / gifsterOptions.fps) - 5);

            setTimeout(() => {
                clearInterval(interval);
                gif.render();
            }, (gifsterOptions.duration * 1000) + 1000)
        });

        video.play();
    }

    stop(blob) {
        const url = window.URL.createObjectURL(blob);

        this.activeStream.getVideoTracks().forEach(track => track.stop());
        this.activeStream = null;
        this.download(url, "screen");
    }
}
