import ScreenController from "./screen-controller";

class BackgroundController {
    start() {
        chrome.runtime.onMessage.addListener(this.messageListener.bind(this));
        chrome.commands.onCommand.addListener(this.commandListener.bind(this));
    }

    screenHandler() {
        const controller = new ScreenController();

        controller.start();
    }

    webcamHandler() {
        chrome.tabs.query({active: true}, (tabs) => chrome.tabs.sendMessage(tabs[0].id, {webcam: true}));
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
            this.screenHandler();
            sendResponse({data: "screen from runtime message started"});
        }
    }

    commandListener(command) {
        console.log("[commandListener]: command is", command);

        switch (command) {
            case "webcam":
                this.webcamHandler();
                break;
            case "screen":
                this.screenHandler();
                break;
            default:
                break;

        }
    }
}

const controller = new BackgroundController();

controller.start();






