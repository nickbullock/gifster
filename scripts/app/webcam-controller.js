import encoders from "./../vendor/encoders";
import RecordRTC from "./../vendor/record-rtc";

window.LZWEncoder = encoders.LZWEncoder;
window.GIFEncoder = encoders.GIFEncoder;

export default class WebcamController {

    constructor() {
        this.rrtc = null;
        this.activeStream = null;
        this.mediaOptions = {
            video: true
        };
        this.previewSelector = "#gifster-webcam-preview";

        this.preview = this.preview.bind(this);
        this.start = this.start.bind(this);
        this.process = this.process.bind(this);
        this.error = this.error.bind(this);
        this.stop = this.stop.bind(this);
        this.download = this.download.bind(this);
    }

    preview(stream) {
        const videoExists = document.querySelector(this.previewSelector);

        if (!videoExists) {
            const video = document.createElement('video');

            video.autoplay = true;
            video.muted = true;
            video.style = "position:fixed;width:300px;border-radius:150px;left:50px;bottom:50px";
            video.srcObject = stream;
            video.id = this.previewSelector;

            document.querySelector("body").appendChild(video);
        }
    }

    start() {
        navigator.getUserMedia(this.mediaOptions, this.process, this.error);
    }

    process(stream) {
        this.activeStream = stream;

        this.preview(stream);

        chrome.storage.sync.get(
            "gifsterOptions",
            (opts) =>  {
                const gifsterOptions = opts.gifsterOptions;

                const options = {
                    type: "gif",
                    width: gifsterOptions.width,
                    height: gifsterOptions.height,
                    quality: 21 - gifsterOptions.quality,
                    frameRate: gifsterOptions.fps * 10
                };

                this.rrtc = RecordRTC(stream, options);
                this.rrtc.setRecordingDuration(gifsterOptions.duration * 1000, this.stop);
                this.rrtc.startRecording();
            }
        )
    }

    error(e) {
        console.error(e);

        switch (e.name) {
            case "DevicesNotFoundError":
                chrome.notifications.create({
                    type: "basic",
                    iconUrl: chrome.extension.getURL("icon128.png"),
                    title: "Device not found",
                    message: "Gifster didn't find requested device"
                });
                break;
            default:
                chrome.notifications.create({
                    type: "basic",
                    iconUrl: chrome.extension.getURL("icon128.png"),
                    title: "Gifster got an error :(",
                    message: "Please contact developer"
                });
                break;
        }
    }

    stop() {
        const preview = document.getElementById(this.previewSelector);

        if(preview){
            preview.remove();
        }
        this.activeStream.getVideoTracks().forEach(track => track.stop());
        this.activeStream = null;

        this.download();
    }

    download() {
        const filename = `webcam-${Date.now()}`;

        this.rrtc.save(filename);
    }
}