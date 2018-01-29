import GIF from "gif";
import BaseController from "./base";
import ContentController from "./content";
import "./../../../style/content.css";

/**
 * Can be called from background script
 */
export default class WebcamController extends BaseController {

    constructor(options) {
        console.log("[WebcamController] constructor init");

        super();

        this.activeStream = null;
        this.options = options;
        this.mediaOptions = {
            video: true
        };
        this.previewSelector = "gifster-webcam-preview";
        this.timer = null;

        this.preview = this.preview.bind(this);
        this.start = this.start.bind(this);
        this.process = this.process.bind(this);
        this.error = this.error.bind(this);
        this.stop = this.stop.bind(this);
    }

    preview(stream) {
        const previewExists = document.getElementById(this.previewSelector);

        if (!previewExists) {
            const preview = document.createElement("video");

            preview.autoplay = true;
            preview.muted = true;
            preview.srcObject = stream;
            preview.id = this.previewSelector;
            preview.className = "gifster-webcam-preview preview-fade-in";

            document.body.appendChild(preview);
        }
    }

    start() {
        navigator.getUserMedia(this.mediaOptions, this.process, this.error);
    }

    process(stream) {
        const self = this;
        let rendering;

        this.activeStream = stream;

        console.log("[WebcamController.process] start capturing", this.options);

        const render = () => {
            const options = self.options;
            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d");
            const video = document.createElement("video");

            const gif = new GIF({
                workerScript: chrome.extension.getURL("scripts/gif.worker.js"),
                workers: Math.round((options.duration * options.fps) + 0.3 * (options.duration * options.fps)),
                quality: 21 - options.quality,
                width: options.width,
                height: options.height
            });

            video.muted = true;
            video.autoplay = true;
            video.width = options.width;
            video.height = options.height;
            video.srcObject = stream;
            video.onloadedmetadata = () => {
                setTimeout(() => {
                    self.isLoadedMetaData = true;
                }, 1000);
            };

            canvas.width = options.width;
            canvas.height = options.height;

            gif.on("start", () => {
                console.time("render");
            });

            gif.on("progress", p => {
                console.log(`[WebcamController.process] progress ${Math.round(p * 100)}%`);
                if (!chrome.notifications) {
                    chrome.runtime.sendMessage({renderingProgressNotification: true, progress: Math.round(p * 100)});
                }
                else {
                    self.createRenderingProgressNotification(Math.round(p * 100));
                }
            });

            gif.on("finished", blob => {
                console.timeEnd("render");
                rendering.innerHTML = "[RENDERED]";
                rendering.className = "gifster-rendering-success";

                self.stop(blob);
            });

            video.addEventListener("play", () => {
                const interval = setInterval(() => {
                    if (!self.isLoadedMetaData) {
                        return;
                    }
                    context.drawImage(video, 0, 0, canvas.width, canvas.height);
                    gif.addFrame(canvas, {copy: true, delay: (1000 / options.fps)});
                }, (1000 / options.fps) - 5);

                setTimeout(() => {
                    const preview = document.getElementById(this.previewSelector);

                    if (preview) {
                        preview.className = "gifster-webcam-preview preview-fade-out";
                    }

                    rendering = document.createElement("div");

                    rendering.className = "gifster-rendering";
                    rendering.innerHTML = "[RENDERING]";

                    document.body.appendChild(rendering);

                    clearInterval(interval);
                    gif.render();
                }, (options.duration * 1000) + 1000)
            });

            video.play();
        };

        if(self.options.delay){
            const renderTimer = ContentController.renderTimer.bind(this);

            renderTimer();

            setTimeout(() => {
                this.preview(stream);
                render();
            }, 3300);
        }
        else {
            this.preview(stream);
            render();
        }
    }

    error(e) {
        console.error("[WebcamController.error] ", e);
    }

    stop(blob) {
        const url = window.URL.createObjectURL(blob);
        const preview = document.getElementById(this.previewSelector);

        this.download(url, "webcam");

        setTimeout(() => {
            this.activeStream.getVideoTracks().forEach(track => track.stop());
            this.activeStream = null;
            if(preview){
                preview.remove();
            }

        }, 1500);
    }
}

chrome.storage.sync.get(
    "gifsterOptions",
    (opts) => {
        const options = opts.gifsterOptions;
        const controller = new WebcamController(options);

        controller.start();
    }
);
