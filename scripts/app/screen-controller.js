// import encoders from "./../vendor/encoders";
// import RecordRTC from "./../vendor/record-rtc";
//
// window.LZWEncoder = encoders.LZWEncoder;
// window.GIFEncoder = encoders.GIFEncoder;
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

        console.log("stream type is",stream.constructor.name);

        chrome.storage.sync.get(
            "gifsterOptions",
            (opts) => {
                const gifsterOptions = opts.gifsterOptions;
                let canvas = document.createElement('canvas');
                let context = canvas.getContext('2d');

                if (stream instanceof CanvasRenderingContext2D) {
                    context = stream;
                    canvas = context.canvas;
                } else if (stream instanceof HTMLCanvasElement) {
                    context = stream.getContext('2d');
                    canvas = stream;
                }

                gifsterOptions.workers = 20;

                const video = document.createElement('video');
                video.muted = true;
                video.autoplay = true;
                video.width = gifsterOptions.width;
                video.height = gifsterOptions.height;
                canvas.width = gifsterOptions.width;
                canvas.height = gifsterOptions.height;

                video.onloadedmetadata = function() {


                    // gif.render();
                };

                video.srcObject = stream;

                // if (typeof video.srcObject !== 'undefined') {
                //     video.srcObject = stream;
                // }
                // else {
                //     video.src = URL.createObjectURL(stream);
                // }
                this.isLoadedMetaData = true;
                let timer = null;
                const gif = new GIF(gifsterOptions);

                console.log("RECORDING STARTED")

                gif.on('progress', (p) => console.log("progress is ", p*100));

                gif.on('finished', function(blob) {
                    console.log("GIF FINISHED", blob)
                    window.open(URL.createObjectURL(blob));
                });

                video.addEventListener('play', function() {
                    console.log("VIDEO PLAY")
                    timer = setInterval(() => {
                        console.log("DRAW FRAME")
                        context.drawImage(video, 0, 0, canvas.width, canvas.height);
                        gif.addFrame(canvas, {copy: true, delay: 100});
                    }, 100);

                    setTimeout(() => {
                        console.log("VIDEO START")
                        clearInterval(timer);
                        gif.render();
                    },5000)
                });

                video.play();

                // const options = {
                //     type: "gif",
                //     height: gifsterOptions.height,
                //     width: gifsterOptions.width,
                //     quality: 21 - gifsterOptions.quality,
                //     frameRate: gifsterOptions.frameRate * 10,
                //     rafDisabled: this.rafDisabled
                // };
                //
                // this.rrtc = RecordRTC(stream, options);
                // this.rrtc.setRecordingDuration(gifsterOptions.duration * 1000, this.stop);
                // this.rrtc.startRecording();
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

        // this.rrtc.save(filename);
    }
}
