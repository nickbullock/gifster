import GIF from "gif";

/**
 * Can be called from background script only
 */
export default class AreaController {

    constructor(options) {
        console.log("[AreaController] constructor init");

        this.activeStream = null;
        this.mediaOptions = {
            video: true
        };
        this.options = options;

        this.start = this.start.bind(this);
        this.process = this.process.bind(this);
        this.error = this.error.bind(this);
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
                console.log("[AreaController.process] start capturing", opts.gifsterOptions);

                const gifsterOptions = opts.gifsterOptions;


            }
        );
    }

    stop(blob) {
        const url = window.URL.createObjectURL(blob);

        this.download(url);

        setTimeout(() => {
            this.activeStream.getVideoTracks().forEach(track => track.stop());
            this.activeStream = null;
            preview.remove();
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