import ScreenController from "./screen";
import AreaController from "./area";
import BaseController from "./base";

class BackgroundController extends BaseController {
    start() {
        chrome.runtime.onMessage.addListener(this.messageListener.bind(this));
        chrome.commands.onCommand.addListener(this.commandListener.bind(this));
        chrome.runtime.onInstalled.addListener(this.installListener.bind(this));
    }

    screenHandlerBG(options) {
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            if (options.delay) {
                chrome.tabs.sendMessage(tabs[0].id, {renderTimer: true});
            }

            setTimeout(() => {
                this.screenController = new ScreenController(options);
                this.screenController.start();
            }, options.delay ? 3300 : 0);
        });
    }

    webcamHandlerBG(options) {
        chrome.windows.create({
            left: 0,
            top: 0,
            width: 480,
            height: 360,
            focused: true,
            type: "popup",
            url: chrome.extension.getURL("pages/webcam.html")
        });
    }

    renderAreaWindow(options) {
        chrome.tabs.query({
            active: true,
            currentWindow: true
        }, tabs => chrome.tabs.sendMessage(tabs[0].id, {renderAreaWindow: true, options}));
    }

    areaHandlerBG(options, bounds, screenHeight, screenWidth) {
        this.areaController = new AreaController(...arguments);
        this.areaController.start();
    }

    messageListener(request, sender, sendResponse) {
        console.log(sender.tab ? "from a content script:" + sender.tab.url : "from the extension", request);

        chrome.storage.sync.get(
            "gifsterOptions",
            (opts) => {
                const options = opts.gifsterOptions;

                if (request.contentInit) {
                    console.log("content controller initialized");
                }
                if (request.optionsInit) {
                    console.log("options controller initialized");
                }
                if (request.webcam) {
                    this.webcamHandlerBG(options);
                    sendResponse({data: "webcam from runtime message started"});
                }
                if (request.screen) {
                    this.screenHandlerBG(options);
                    sendResponse({data: "screen from runtime message started"});
                }
                if (request.area) {
                    this.renderAreaWindow(options);
                }
                if (request.areaStart) {
                    this.areaHandlerBG(options, request.bounds, request.screenHeight, request.screenWidth);
                }
                if (request.areaStop) {
                    if (this.areaController) {
                        this.areaController.abort();
                    }
                }
                if (request.renderingProgressNotification) {
                    this.createRenderingProgressNotification(request.progress);
                }

                if (request.error) {
                    switch (request.error.name) {
                        case "DevicesNotFoundError":
                            chrome.notifications.create({
                                type: "basic",
                                iconUrl: chrome.extension.getURL("static/icon128.png"),
                                title: "Device not found",
                                message: "Gifster didn't find requested device"
                            });
                            break;
                        default:
                            chrome.notifications.create({
                                type: "basic",
                                iconUrl: chrome.extension.getURL("static/icon128.png"),
                                title: "Gifster got an error :(",
                                message: "Please contact developer"
                            });
                            break;
                    }
                }
            }
        );
    }

    commandListener(command) {
        console.log("[BackgroundController.commandListener]: incoming command ", command);

        chrome.storage.sync.get(
            "gifsterOptions",
            (opts) => {
                const options = opts.gifsterOptions;

                switch (command) {
                    case "webcam":
                        this.webcamHandlerBG(options);
                        break;
                    case "screen":
                        this.screenHandlerBG(options);
                        break;
                    case "area":
                        this.renderAreaWindow(options);
                        break;
                    default:
                        break;

                }
            }
        );
    }

    installListener(details) {
        if (details.reason === "install") {
            console.log("[BackgroundController.installListener] first install");

            const defaultOptions = {
                preview: true,
                delay: true,
                duration: 3,
                fps: 8,
                resolution: 1,
                quality: 10,
                width: 480,
                height: 360
            };

            chrome.storage.sync.set({gifsterOptions: defaultOptions});
        }
    }
}

console.log("start");
const controller = new BackgroundController();
controller.start();






