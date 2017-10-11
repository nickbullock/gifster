import ScreenController from "./screen-controller";
import WebcamController from "./webcam-controller";

class BackgroundController {
    start() {
        chrome.runtime.onMessage.addListener(this.messageListener.bind(this));
        chrome.commands.onCommand.addListener(this.commandListener.bind(this));
    }

    screenHandlerBG() {
        chrome.tabs.query({active: true}, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, {renderTimer: true});

            setTimeout(() => new ScreenController().start(), 3300);
        });
    }

    webcamHandlerBG() {
        new WebcamController().start();
    }

    webcamHandler() {
        chrome.tabs.query({active: true}, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, {webcam: true});
        });
    }

    messageListener(request, sender, sendResponse) {
        console.log(sender.tab ? "from a content script:" + sender.tab.url : "from the extension", request);

        if (request.contentInit) {
            console.log("content controller initialized");
        }
        if (request.optionsInit) {
            console.log("options controller initialized");
        }
        if (request.webcam) {
            this.webcamHandler();
            sendResponse({data: "webcam from runtime message started"});
        }
        if (request.screen) {
            this.screenHandlerBG();
            sendResponse({data: "screen from runtime message started"});
        }
        if(request.renderingProgressNotification){
            const notificationId = "render";
            const progress = request.progress;

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

        if (request.error){
            switch (request.error.name) {
                case "DevicesNotFoundError":
                    chrome.notifications.create({
                        type: "basic",
                        iconUrl: chrome.extension.getURL("icon128.png"),
                        title: "Device not found",
                        message: "Gifster didn't find requested device"
                    });
                    break;
                case "PermissionDeniedError":
                    chrome.notifications.create({
                        type: "basic",
                        iconUrl: chrome.extension.getURL("icon128.png"),
                        title: "Can't create preview",
                        message: "Gifster can't create preview on this site - it's not secure enough (secure sites urls start with 'https'). But gif will be recorded :)"
                    });

                    this.webcamHandlerBG();

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
    }

    commandListener(command) {
        console.log("[BackgroundController.commandListener]: incoming command ", command);

        switch (command) {
            case "webcam":
                this.webcamHandler();
                break;
            case "screen":
                this.screenHandlerBG();
                break;
            default:
                break;

        }
    }
}

const controller = new BackgroundController();

controller.start();






