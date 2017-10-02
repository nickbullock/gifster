import RecordRTC from "./RecordRTC";

let rrtc;
let activeStream;

navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

function init() {
    chrome.runtime.onMessage.addListener(contentMessageListener);
}

function screenHandler() {
    const mediaOptions = {
        video: true,
        videoConstraints: {
            mandatory: {
                chromeMediaSource: 'tab'
            }
        }
    };

    function screenHandlerSuccess(stream) {
        activeStream = stream;
        const options = {
            type: "gif",
            showMousePointer: true,
        };

        rrtc = RecordRTC(stream, options);
        rrtc.setRecordingDuration(10000, recordSaveHandler);
        rrtc.startRecording();
    }

    chrome.tabCapture.capture(mediaOptions, screenHandlerSuccess);
}

function webcamHandler() {
    const mediaOptions = {
        video: true
    };

    function webcamHandlerSuccess(stream) {
        activeStream = stream;

        const options = {
            type: "gif"
        };

        rrtc = RecordRTC(stream, options);
        rrtc.setRecordingDuration(3000, recordSaveHandler);
        rrtc.startRecording();
    }

    navigator.getUserMedia(mediaOptions, webcamHandlerSuccess, defaultErrorHandler);
}

function recordSaveHandler() {
    activeStream.getVideoTracks().forEach(track => track.stop());

    rrtc.save();
}

function defaultErrorHandler(e) {
    console.log(e);
}

function contentMessageListener(request, sender, sendResponse) {
    console.log(sender.tab ? "from a content script:" + sender.tab.url : "from the extension", request);

    if (request.init) {
        console.log("content script initialized");
    }
    if (request.webcam) {
        webcamHandler();
        sendResponse({data: "webcam from runtime message started"});
    }
    if (request.screen) {
        screenHandler();
        sendResponse({data: "screen from runtime message started"});
    }
}

init();






