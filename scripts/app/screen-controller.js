import GIF from "gif";

/**
 * Can be called from background script only
 */
export default class ScreenController {
    constructor(rafDisabled) {
        this.rrtc = null;
        this.activeStream = null;
        this.rafDisabled = rafDisabled;
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
        this.download = this.download.bind(this);
    }

    start() {
        chrome.tabCapture.capture(this.mediaOptions, this.process);
    }

    process(stream) {
        this.activeStream = stream;

        chrome.storage.sync.get(
            "gifsterOptions",
            (opts) => {
                console.log("[ScreenController.process] start capturing", opts.gifsterOptions);

                const gifsterOptions = opts.gifsterOptions;
                const canvas = document.createElement("canvas");
                const context = canvas.getContext("2d");
                const video = document.createElement("video");
                const gif = new GIF({
                    workers: 50,
                    quality: gifsterOptions.quality,
                    width: gifsterOptions.width,
                    height: gifsterOptions.height
                });

                video.muted = true;
                video.autoplay = true;
                video.width = gifsterOptions.width;
                video.height = gifsterOptions.height;
                video.srcObject = stream;
                video.onloadedmetadata = () => {
                    this.isLoadedMetaData = true;
                };

                canvas.width = gifsterOptions.width;
                canvas.height = gifsterOptions.height;

                gif.on("start", () => {
                    console.time("render");
                });

                gif.on("progress", (p) => {
                    console.log(`[ScreenController.process] progress ${Math.round(p * 100)}%`);
                    this.createRenderProgressNotification(Math.round(p * 100));
                });

                gif.on("finished", (blob) => {
                    console.timeEnd("render");
                    this.stop(blob);
                });

                video.addEventListener("play", function() {
                    const interval = setInterval(() => {
                        console.log("draw frame");

                        context.drawImage(video, 0, 0, canvas.width, canvas.height);
                        gif.addFrame(canvas, {copy: true, delay: 100});
                    }, 100);

                    setTimeout(() => {
                        clearInterval(interval);
                        gif.render();
                    }, gifsterOptions.duration * 1000)
                });

                video.play();
            }
        );
    }

    stop(blob) {
        const url = window.URL.createObjectURL(blob);

        this.activeStream.getVideoTracks().forEach(track => track.stop());
        this.activeStream = null;
        this.download(url);
    }

    download(url) {
        const filename = `screen-${Date.now()}`;
        const a = document.createElement("a");

        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
    }

    createRenderProgressNotification(progress) {
        const notificationId = "render";

        if(progress === 100) {
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
