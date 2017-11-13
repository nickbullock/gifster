import GIF from "gif";
import BaseController from "./base";

/**
 * Can be called from background script only
 */
export default class AreaController extends BaseController {

    constructor(options, bounds, screenHeight, screenWidth) {
        console.log("[AreaController] constructor init", arguments);

        super();

        this.activeStream = null;
        this.options = options;
        this.gif = null;
        this.mediaOptions = {
            video: true,
            videoConstraints: {
                mandatory: {
                    minHeight: screenHeight,
                    maxHeight: screenHeight,
                    minWidth: screenWidth,
                    maxWidth: screenWidth
                }
            }
        };
        this.screenWidth = screenWidth;
        this.screenHeight = screenHeight;
        this.bounds = bounds;

        this.start = this.start.bind(this);
        this.process = this.process.bind(this);
        this.stop = this.stop.bind(this);
    }

    start() {
        chrome.tabCapture.capture(this.mediaOptions, this.process);
    }

    process(stream) {
        this.activeStream = stream;

        console.log("[AreaController.process] start capturing",
            this.options, this.screenHeight, this.screenWidth, this.bounds, stream);

        const self = this;
        const gifsterOptions = this.options;
        const MAX_WIDTH = gifsterOptions.width;
        const MAX_HEIGHT = gifsterOptions.height;
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        const video = document.createElement("video");
        const maxToBoundsWidthRatio = MAX_WIDTH / this.bounds.width;
        const maxToBoundsHeightRatio = MAX_HEIGHT / this.bounds.height;
        const ratio = Math.min(maxToBoundsWidthRatio, maxToBoundsHeightRatio);
        const LEFT_TOP_ACCURACY_ERROR = 1;
        const WIDTH_HEIGHT_ACCURACY_ERROR = 2;
        this.gif = new GIF({
            workerScript: chrome.extension.getURL("gif.worker.js"),
            workers: Math.round((gifsterOptions.duration * gifsterOptions.fps) + 0.3 * (gifsterOptions.duration * gifsterOptions.fps)),
            quality: 21 - gifsterOptions.quality,
            width: ratio < 1 ? this.bounds.width * ratio : this.bounds.width,
            height: ratio < 1 ? this.bounds.height * ratio : this.bounds.height
        });

        video.muted = true;
        video.autoplay = true;
        video.srcObject = stream;
        video.onloadedmetadata = () => {
            setTimeout(() => {
                self.isLoadedMetaData = true;
            }, 1000);
        };

        canvas.width = this.bounds.width;
        canvas.height = this.bounds.height;

        if (ratio < 1) {
            context.scale(ratio, ratio);
        }

        this.gif.on("start", () => console.time("render"));

        this.gif.on("progress", (p) => {
            console.log(`[AreaController.process] progress ${Math.round(p * 100)}%`);
            if (!chrome.notifications) {
                chrome.runtime.sendMessage({renderingProgressNotification: true, progress: Math.round(p * 100)});
            }
            else {
                self.createRenderingProgressNotification(Math.round(p * 100));
            }
        });

        this.gif.on("finished", (blob) => {
            console.timeEnd("render");
            this.stop(blob);
        });

        video.addEventListener("play", () => {
            this.recordInterval = setInterval(() => {
                if (!self.isLoadedMetaData) {
                    return;
                }
                context.drawImage(video,
                    this.bounds.left + LEFT_TOP_ACCURACY_ERROR,
                    this.bounds.top + LEFT_TOP_ACCURACY_ERROR,
                    canvas.width - WIDTH_HEIGHT_ACCURACY_ERROR,
                    canvas.height - WIDTH_HEIGHT_ACCURACY_ERROR,
                    0, 0, canvas.width, canvas.height);
                this.gif.addFrame(canvas, {copy: true, delay: (1000 / gifsterOptions.fps)});
            }, (1000 / gifsterOptions.fps) - 5);

            setTimeout(() => {
                if (this.gif) {
                    clearInterval(this.recordInterval);
                    this.gif.render();
                    this.gif = null;
                }
            }, (gifsterOptions.duration * 1000) + 1000)
        });

        video.play();
    }

    abort() {
        clearInterval(this.recordInterval);
        this.gif.render();
        this.gif = null;
    }

    stop(blob) {
        const url = window.URL.createObjectURL(blob);

        this.activeStream.getVideoTracks().forEach(track => track.stop());
        this.activeStream = null;
        this.download(url, "area");
    }
}