import encoders from "./../vendor/encoders";
import RecordRTC from "./../vendor/record-rtc";

window.LZWEncoder = encoders.LZWEncoder;
window.GIFEncoder = encoders.GIFEncoder;

export default class WebcamController {

    constructor(rafDisabled) {
        this.rrtc = null;
        this.activeStream = null;
        this.rafDisabled = rafDisabled;
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
        const previewExists = document.querySelector(this.previewSelector);

        if (!previewExists) {
            const preview = document.createElement('video');

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
                    frameRate: gifsterOptions.fps * 10,
                    rafDisabled: this.rafDisabled
                };

                this.rrtc = RecordRTC(stream, options);
                this.rrtc.setRecordingDuration(gifsterOptions.duration * 1000, this.stop);
                this.rrtc.startRecording();
            }
        )
    }

    error(e) {
        console.error("[WebcamController.error] ", e);

        chrome.runtime.sendMessage({error: {name:  e.name}});
    }

    stop() {
        const preview = document.getElementById(this.previewSelector);

        if(preview){
            preview.className = "gifster-webcam-preview preview-fade-out";
        }

        this.download();

        setTimeout(() => {
            this.activeStream.getVideoTracks().forEach(track => track.stop());
            this.activeStream = null;
            preview.remove();
        }, 1500);
    }

    download() {
        const filename = `webcam-${Date.now()}`;

        this.rrtc.save(filename);
    }
}