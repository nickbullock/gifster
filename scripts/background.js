import RecordRTC from "./record-rtc";

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
                chromeMediaSource: 'tab',
                maxWidth: 1920,
                maxHeight: 1080,
                maxFrameRate: 30,
                minFrameRate: 30,
                minWidth: 1280,
                minHeight: 1024,
                minAspectRatio: 1.77
            }
        }
    };

    function screenHandlerSuccess(stream) {
        activeStream = stream;
        const options = {
            type: "gif",
            //заменить на значения из настроек
            showMousePointer: null,
            height: null,
            width: null
        };

        rrtc = RecordRTC(stream, options);
        rrtc.setRecordingDuration(3000, recordSaveHandler.bind({filename: `screen-${Date.now()}.gif`}));
        rrtc.startRecording();

        createRecordingProgressNotification(3000);
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
        rrtc.setRecordingDuration(3000, recordSaveHandler.bind({filename: `webcam-${Date.now()}.gif`}));
        rrtc.startRecording();

        createRecordingProgressNotification(3000);
    }

    navigator.getUserMedia(mediaOptions, webcamHandlerSuccess, defaultErrorHandler);
}

function recordSaveHandler() {
    const filename = this.filename;

    activeStream.getVideoTracks().forEach(track => track.stop());
    activeStream = null;
    rrtc.save(filename);
}

function defaultErrorHandler(e) {
    console.error(e);
    switch (e.name){
        case "DevicesNotFoundError":
            chrome.notifications.create({
                type: "basic",
                iconUrl: chrome.extension.getURL("icon128.png"),
                title: "Device not found",
                message: "gifster didn't find requested device"
            });
            break;
        default:
            break;
    }
}

function messageListener(request, sender, sendResponse) {
    console.log(sender.tab ? "from a content script:" + sender.tab.url : "from the extension", request);

    if (request.contentInit) {
        console.log("content controller initialized");
    }
    if (request.optionsInit) {
        console.log("options controller initialized");
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
            break;
    }
}

function createRecordingProgressNotification(timeout){
    if(!timeout){
        console.error("[createRecordingProgressNotification] timeout is not provided");
        return;
    }

    chrome.notifications.create(
        {
            type: "progress",
            iconUrl: chrome.extension.getURL("icon128.png"),
            title: "Recording!",
            message: "gifster started recording",
            progress: 0
        },
        (id) => {
            let progress = 0;

            const interval = setInterval(function() {
                progress += 10;
                if (progress <= 100) {
                    chrome.notifications.update(id, {progress: progress}, function (updated) {
                        if (!updated) {
                            // the notification was closed
                            clearInterval(interval);
                        }
                    });
                } else {
                    chrome.notifications.clear(id);
                    clearInterval(interval);
                }
            }, (timeout/10))
        }
    );
}

init();






