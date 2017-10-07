import encoders from "./encoders";
import RecordRTC from "./record-rtc";

console.log(">>>>enc", encoders)

window.LZWEncoder = encoders.LZWEncoder;
window.GIFEncoder = encoders.GIFEncoder;

let rrtc, activeStream;

const mediaOptions = {
    video: true
};

function createWebcamPreview(stream) {
    const videoExists = document.querySelector("#gifster-webcam-preview");

    if (!videoExists) {
        const video = document.createElement('video');

        video.setAttribute("autoplay", "autoplay");
        video.setAttribute("muted", "muted");
        video.style = "position:fixed;width:300px;border-radius:150px;left:50px;bottom:50px";
        video.srcObject = stream;
        video.id = "gifster-webcam-preview";

        document.querySelector("body").appendChild(video);
    }
}

function recordSaveHandler() {
    const filename = this.filename;

    activeStream.getVideoTracks().forEach(track => track.stop());
    activeStream = null;
    rrtc.save(filename);
}

function webcamHandlerSuccess(stream) {
    activeStream = stream;

    createWebcamPreview(stream);

    chrome.storage.sync.get(
        "gifsterOptions",
        (opts) =>  {
            const gifsterOptions = opts.gifsterOptions;

            const options = {
                type: "gif",
                width: gifsterOptions.width,
                height: gifsterOptions.height,
                quality: 21 - gifsterOptions.quality,
                frameRate: gifsterOptions.fps
            };

            rrtc = RecordRTC(stream, options);
            rrtc.setRecordingDuration(gifsterOptions.duration*1000, recordSaveHandler.bind({filename: `webcam-${Date.now()}.gif`}));
            rrtc.startRecording();

            // createRecordingProgressNotification(gifsterOptions.duration);
        }
    )
}


navigator.getUserMedia(mediaOptions, webcamHandlerSuccess, function(e){console.error(e)});