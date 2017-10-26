import HelperService from "./helper-service";
import WebcamController from "./webcam-controller";

class ContentController {
    constructor() {
        console.log("[ContentController] constructor init");
    }

    start() {
        this.timer = null;
        chrome.runtime.sendMessage({contentInit: true});
        chrome.runtime.onMessage.addListener(this.messageListener.bind(this));
    }

    messageListener(request, sender, sendResponse) {
        console.log("[ContentController.messageLister] incoming message", request);

        if (request.webcam) {
            this.renderTimer();

            setTimeout(() => new WebcamController(true).start(), 3300);
        }
        if(request.renderAreaWindow){
            this.renderAreaWindow();
        }
        if (request.renderTimer) {
            this.renderTimer();
        }
    }

    renderAreaWindow() {
        chrome.storage.sync.get(
            "gifsterOptions",
            (opts) => {
                console.log("[ContentController.process] render area window", opts.gifsterOptions);

                const gifsterOptions = opts.gifsterOptions;
                const area = document.createElement("div");
                const innerArea = document.createElement("div");
                const toolbar = document.createElement("div");
                const closeButton = document.createElement("button");
                const startButton = document.createElement("button");

                innerArea.style.width = `${gifsterOptions.width}px`;
                innerArea.style.height = `${gifsterOptions.height}px`;
                area.style.left = `calc(50% - ${gifsterOptions.width/2}px)`;
                area.style.top = `calc(50% - ${gifsterOptions.height/2}px)`;
                closeButton.innerHTML = "Close";
                startButton.innerHTML = "Start";

                innerArea.className = "gifster-inner-area";
                innerArea.id = "gifster-inner-area";
                area.className = "gifster-area";
                area.id = "gifster-area";
                toolbar.className = "gifster-toolbar";
                toolbar.id = "gifster-toolbar";
                closeButton.className = "gifster-close-button";
                closeButton.id = "gifster-close-button";
                startButton.className = "gifster-start-button";
                startButton.id = "gifster-start-button";

                closeButton.onclick = () => area.remove();
                startButton.onclick = () => {
                    this.renderTimer(innerArea);

                    setTimeout(() => {
                        chrome.runtime.sendMessage({
                            areaStart: true,
                            bounds: innerArea.getBoundingClientRect(),
                            screenWidth: window.innerWidth,
                            screenHeight: window.innerHeight
                        });
                    }, 3300)
                };

                area.appendChild(innerArea);
                area.appendChild(toolbar);
                toolbar.appendChild(closeButton);
                toolbar.appendChild(startButton);

                document.querySelector("body").appendChild(area);

                HelperService.makeAreaDraggable(area, innerArea);
            }
        );
    }

    renderTimer(element) {
        if (!this.timer) {
            this.timer = document.createElement("div");

            this.timer.id = "gifster-timer";
            this.timer.className = "gifster-timer";

            this.timer.innerHTML = 3;
            let counter = 0;

            if(element){
                element.appendChild(this.timer);
            }
            else{
                document.querySelector("body").appendChild(this.timer);
            }

            const interval = setInterval(() => {
                counter++;

                switch (counter) {
                    case 3:
                        clearInterval(interval);
                        this.timer.remove();
                        this.timer = null;
                        break;
                    default:
                        this.timer.innerHTML--;
                        break;
                }
            }, 1000)
        }
    }
}

const controller = new ContentController();

controller.start();
