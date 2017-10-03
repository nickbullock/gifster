import RecordRTC from "./RecordRTC";

let rrtc;
let activeStream;

navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

function init() {
    chrome.runtime.onMessage.addListener(messageListener);
    chrome.commands.onCommand.addListener(commandListener);
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
    activeStream = null;
    rrtc.save();
}

function defaultErrorHandler(e) {
    console.error(e);
    switch (e.name){
        case "DevicesNotFoundError":
            chrome.notifications.create({
                type: "basic",
                iconUrl: chrome.extension.getURL("icon128.png"),
                title: "Устройство не обнаружено",
                message: "gifster не смог найти запрашиваемое устройство"
            });
            break;
        default:
            break;
    }
}

function messageListener(request, sender, sendResponse) {
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

function commandListener(command) {
    console.log("[commandListener]: command is", command);

    switch(command){
        case "webcam":
            webcamHandler();
            break;
        case "screen":
            screenHandler();
            break;
        default:
            console.log("[commandListener]: unexpected command", command);
            break;
    }
}

init();






