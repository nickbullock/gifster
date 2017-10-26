import GIF from "gif";

/**
 * Can be called from background script only
 */
export default class AreaController {

    constructor(bounds, screenHeight, screenWidth) {
        console.log("[AreaController] constructor init", arguments);

        this.activeStream = null;
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
        this.download = this.download.bind(this);
    }

    renderAreaWindow() {
        chrome.tabs.query({active: true}, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, {renderAreaWindow: true});
        })
    }

    start() {
        chrome.tabCapture.capture(this.mediaOptions, this.process);
    }

    process(stream) {
        const self = this;

        this.activeStream = stream;

        chrome.storage.sync.get(
            "gifsterOptions",
            (opts) => {
                console.log("[AreaController.process] start capturing",
                    opts.gifsterOptions, this.screenHeight, this.screenWidth, this.bounds, stream);

                const gifsterOptions = opts.gifsterOptions;
                const canvas = document.createElement("canvas");
                const context = canvas.getContext("2d");
                const video = document.createElement("video");
                const LEFT_TOP_ACCURACY_ERROR = 1;
                const WIDTH_HEIGHT_ACCURACY_ERROR = 2;
                const gif = new GIF({
                    workerScript: chrome.extension.getURL("gif.worker.js"),
                    workers: Math.round((gifsterOptions.duration * gifsterOptions.fps) + 0.3*(gifsterOptions.duration * gifsterOptions.fps)),
                    quality: 21 - gifsterOptions.quality,
                    width: this.bounds.width,
                    height: this.bounds.height
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

                gif.on("start", () => {
                    console.time("render");
                });

                gif.on("progress", (p) => {
                    console.log(`[AreaController.process] progress ${Math.round(p * 100)}%`);
                    if(!chrome.notifications){
                        chrome.runtime.sendMessage({renderingProgressNotification: true, progress: Math.round(p*100)});
                    }
                    else{
                        self.createRenderingProgressNotification(Math.round(p*100));
                    }
                });

                gif.on("finished", (blob) => {
                    console.timeEnd("render");
                    this.stop(blob);
                });

                video.addEventListener("play", () => {
                    const interval = setInterval(() => {
                        if(!self.isLoadedMetaData){
                            return;
                        }
                        context.drawImage(video,
                            this.bounds.left + LEFT_TOP_ACCURACY_ERROR,
                            this.bounds.top + LEFT_TOP_ACCURACY_ERROR,
                            canvas.width - WIDTH_HEIGHT_ACCURACY_ERROR,
                            canvas.height - WIDTH_HEIGHT_ACCURACY_ERROR,
                            0, 0, canvas.width, canvas.height);
                        gif.addFrame(canvas, {copy: true, delay: (1000 / gifsterOptions.fps)});
                    }, (1000 / gifsterOptions.fps) - 5);

                    setTimeout(() => {
                        clearInterval(interval);
                        gif.render();
                    }, (gifsterOptions.duration * 1000) + 1000)
                });

                video.play();
            }
        );
    }

    stop(blob) {
        const url = window.URL.createObjectURL(blob);

        this.download(url);

        setTimeout(() => {
            this.activeStream.getVideoTracks().forEach(track => track.stop());
            this.activeStream = null;
        }, 1500);
    }

    download(url) {
        const filename = `area-${Date.now()}`;
        const a = document.createElement("a");

        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
    }

    createRenderingProgressNotification(progress) {
        const notificationId = "render";

        if (progress === 100) {
            chrome.notifications.clear(notificationId);

            return;
        }

        if (progress === 0) {
            chrome.notifications.create(
                notificationId,
                {
                    type: "progress",
                    iconUrl: "icon128.png",
                    title: "Rendering... ",
                    message: "Gifster creates your gif :)",
                    progress: 0
                }
            )
        }
        else {
            chrome.notifications.update(
                notificationId,
                {progress}
            );
        }
    }
}