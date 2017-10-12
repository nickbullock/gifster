import GIF from "gif";

/**
 * Can be called from background and content scripts
 */
export default class WebcamController {

    constructor(fromContent) {
        console.log("[WebcamController] constructor init", fromContent);

        this.activeStream = null;
        this.mediaOptions = {
            video: true
        };
        this.previewSelector = "#gifster-webcam-preview";
        this.fromContent = fromContent;

        this.preview = this.preview.bind(this);
        this.start = this.start.bind(this);
        this.process = this.process.bind(this);
        this.error = this.error.bind(this);
        this.stop = this.stop.bind(this);
        this.download = this.download.bind(this);
    }

    preview(stream) {
        const previewExists = document.querySelector(this.previewSelector);

        if (!previewExists) {
            const preview = document.createElement("video");

            preview.autoplay = true;
            preview.muted = true;
            preview.srcObject = stream;
            preview.id = this.previewSelector;
            preview.className = "gifster-webcam-preview preview-fade-in";

            document.querySelector("body").appendChild(preview);
        }
    }

    start() {
        navigator.getUserMedia(this.mediaOptions, this.process, this.error);
    }

    process(stream) {
        const self = this;

        this.activeStream = stream;
        this.preview(stream);

        chrome.storage.sync.get(
            "gifsterOptions",
            (opts) => {
                console.log("[WebcamController.process] start capturing", opts.gifsterOptions);

                function render(code){
                    const gifsterOptions = opts.gifsterOptions;
                    const canvas = document.createElement("canvas");
                    const context = canvas.getContext("2d");
                    const video = document.createElement("video");

                    const gif = new GIF({
                        workerScript: (code ? URL.createObjectURL(new Blob([code], {type: "text/javascript"})) : chrome.extension.getURL("gif.worker.js")),
                        workers: Math.round((gifsterOptions.duration * gifsterOptions.fps) + 0.5*(gifsterOptions.duration * gifsterOptions.fps)),
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

                    gif.on("start", () => {
                        console.time("render");
                    });

                    gif.on("progress", (p) => {
                        console.log(`[WebcamController.process] progress ${Math.round(p * 100)}%`);
                        if(!chrome.notifications){
                            chrome.runtime.sendMessage({renderingProgressNotification: true, progress: Math.round(p*100)});
                        }
                        else{
                            self.createRenderingProgressNotification(Math.round(p*100));
                        }

                    });

                    gif.on("finished", (blob) => {
                        console.timeEnd("render");
                        self.stop(blob);
                    });

                    video.addEventListener("play", function() {
                        const interval = setInterval(() => {
                            if(!self.isLoadedMetaData){
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

                if(self.fromContent){
                    const xhr = new XMLHttpRequest();

                    xhr.open("GET", chrome.extension.getURL("gif.worker.js"), true);
                    xhr.send();

                    xhr.onreadystatechange = (data) => {
                        if (xhr.readyState !== 4){
                            return;
                        }

                        render(data.target.response);
                    };
                }
                else{
                    render();
                }
            }
        );
    }

    error(e) {
        console.error("[WebcamController.error] ", e);
        chrome.runtime.sendMessage({error: {name: e.name}});
    }

    stop(blob) {
        const url = window.URL.createObjectURL(blob);
        const preview = document.getElementById(this.previewSelector);

        if (preview) {
            preview.className = "gifster-webcam-preview preview-fade-out";
        }

        this.download(url);

        setTimeout(() => {
            this.activeStream.getVideoTracks().forEach(track => track.stop());
            this.activeStream = null;
            preview.remove();
        }, 1500);
    }

    download(url) {
        const filename = `webcam-${Date.now()}`;
        const a = document.createElement("a");

        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
    }

    createRenderingProgressNotification(progress) {
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