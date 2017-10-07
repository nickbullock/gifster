import RecordRTC from "./record-rtc";

let rrtc;
let activeStream;

navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

function init() {
    chrome.runtime.onMessage.addListener(messageListener);
    chrome.commands.onCommand.addListener(commandListener);
}

function screenHandler() {
    chrome.storage.sync.get(
        "gifsterOptions",
        (options) => {
            const gifsterOptions = options.gifsterOptions;

            const mediaOptions = {
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

            function screenHandlerSuccess(stream) {
                activeStream = stream;
                const options = {
                    type: "gif",
                    height: gifsterOptions.height,
                    width: gifsterOptions.width,
                    quality: 21 - gifsterOptions.quality,
                    frameRate: gifsterOptions.frameRate
                };

                rrtc = RecordRTC(stream, options);
                rrtc.setRecordingDuration(gifsterOptions.duration, recordSaveHandler.bind({filename: `screen-${Date.now()}.gif`}));
                rrtc.startRecording();

                createRecordingProgressNotification(gifsterOptions.duration);
            }

            chrome.tabCapture.capture(mediaOptions, screenHandlerSuccess);
        }
    );

}

function webcamHandler() {
    chrome.tabs.query({active: true}, (tabs) => {
        chrome.tabs.executeScript(tabs[0].id, {file: "webcam.js"});
    });
}

function defaultErrorHandler(e) {
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

    switch (command) {
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


function createRecordingProgressNotification(timeout) {
    if (!timeout) {
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

            const interval = setInterval(function () {
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
            }, (timeout / 10))
        }
    );
}

init();






