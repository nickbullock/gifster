import ScreenController from "./screen";
import WebcamController from "./webcam";
import AreaController from "./area";

class BackgroundController {
    start() {
        chrome.runtime.onMessage.addListener(this.messageListener.bind(this));
        chrome.commands.onCommand.addListener(this.commandListener.bind(this));
        chrome.runtime.onInstalled.addListener(this.installListener.bind(this));
    }

    screenHandlerBG(options) {
        chrome.tabs.query({active: true}, (tabs) => {
            if(options.delay){
                chrome.tabs.sendMessage(tabs[0].id, {renderTimer: true});
            }

            setTimeout(() => {
                this.screenController = new ScreenController(options);
                this.screenController.start();
            }, options.delay ? 3300 : 0);
        });
    }

    webcamHandlerBG(options) {
        this.webcamController = new WebcamController(options);
        this.webcamController.start();
    }

    webcamHandler(options) {
        chrome.tabs.query({active: true}, (tabs) => chrome.tabs.sendMessage(tabs[0].id, {webcam: true, options}));
    }

    renderAreaWindow(options) {
        chrome.tabs.query({active: true}, (tabs) => chrome.tabs.sendMessage(tabs[0].id, {renderAreaWindow: true, options}));
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
                    this.webcamHandler(options);
                    sendResponse({data: "webcam from runtime message started"});
                }
                if (request.screen) {
                    this.screenHandlerBG(options);
                    sendResponse({data: "screen from runtime message started"});
                }
                if (request.area) {
                    this.renderAreaWindow(options);
                }
                if(request.areaStart) {
                    this.areaHandlerBG(options, request.bounds, request.screenHeight, request.screenWidth);
                }
                if(request.areaStop) {
                    if(this.areaController){
                        this.areaController.abort();
                    }
                }
                if (request.renderingProgressNotification) {
                    const notificationId = "render";
                    const progress = request.progress;

                    if (progress === 100) {
                        chrome.notifications.clear(notificationId);

                        return;
                    }

                    if (progress === 0 || !progress) {
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

                if (request.error) {
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

                            this.webcamHandlerBG(options);

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
        );
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
            case "area":
                this.renderAreaWindow();
                break;
            default:
                break;

        }
    }

    installListener(details) {
        if(details.reason === "install"){
            console.log("[BackgroundController.installListener] first install");

            const defaultOptions = {
                duration: 5,
                fps: 10,
                resolution: 2,
                quality: 10,
                width: 858,
                height: 480,
                preview: true,
                delay: true,
                cursor: false,
                scrollbar: false
            };

            chrome.storage.sync.set({gifsterOptions: defaultOptions});
        }
    }
}

const controller = new BackgroundController();

controller.start();






