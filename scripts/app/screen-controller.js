import encoders from "./../vendor/encoders";
import RecordRTC from "./../vendor/record-rtc";

window.LZWEncoder = encoders.LZWEncoder;
window.GIFEncoder = encoders.GIFEncoder;

export default class ScreenController {
    constructor(rafDisabled) {
        this.rrtc = null;
        this.activeStream = null;
        this.rafDisabled = rafDisabled;
        this.mediaOptions = {
            video: true,
            videoConstraints: {
                mandatory: {
                    chromeMediaSource: 'tab',
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
                const gifsterOptions = opts.gifsterOptions;

                const options = {
                    type: "gif",
                    height: gifsterOptions.height,
                    width: gifsterOptions.width,
                    quality: 21 - gifsterOptions.quality,
                    frameRate: gifsterOptions.frameRate * 10,
                    rafDisabled: this.rafDisabled
                };

                this.rrtc = RecordRTC(stream, options);
                this.rrtc.setRecordingDuration(gifsterOptions.duration * 1000, this.stop);
                this.rrtc.startRecording();
            }
        );
    }

    stop() {
        this.activeStream.getVideoTracks().forEach(track => track.stop());
        this.activeStream = null;

        this.download();
    }

    download() {
        const filename = `screen-${Date.now()}`;

        this.rrtc.save(filename);
    }
}
