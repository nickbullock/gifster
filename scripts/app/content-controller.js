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
                const startButton = document.createElement("button");

                innerArea.style.width = `${gifsterOptions.width}px`;
                innerArea.style.height = `${gifsterOptions.height}px`;
                area.style.left = `calc(50% - ${gifsterOptions.width/2}px)`;
                area.style.top = `calc(50% - ${gifsterOptions.height/2}px)`;

                innerArea.className = "gifster-inner-area";
                innerArea.id = "gifster-inner-area";
                area.className = "gifster-area";
                area.id = "gifster-area";
                toolbar.className = "gifster-toolbar";
                toolbar.id = "gifster-toolbar";
                startButton.className = "gifster-start-button";
                startButton.id = "gifster-start-button";

                startButton.onClick = () => chrome.runtime.sendMessage({areaStart: true});

                area.appendChild(innerArea);
                area.appendChild(toolbar);
                toolbar.appendChild(startButton);

                document.querySelector("body").appendChild(area);

                HelperService.makeAreaDraggable(area, innerArea);
            }
        );
    }

    renderTimer() {
        if (!this.timer) {
            this.timer = document.createElement("div");

            this.timer.id = "gifster-timer";
            this.timer.className = "gifster-timer";

            this.timer.innerHTML = 3;
            let counter = 0;

            document.querySelector("body").appendChild(this.timer);

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
