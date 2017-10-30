import WebcamController from "./webcam-controller";
import jQuery from "jquery";
import jQueryUI from "jquery-ui";

class ContentController {
    constructor() {
        console.log("[ContentController] constructor init", jQueryUI);
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
        if (request.renderAreaWindow) {
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
                area.style.left = `calc(50% - ${gifsterOptions.width / 2}px)`;
                area.style.top = `calc(50% - ${gifsterOptions.height / 2}px)`;
                closeButton.innerHTML = "Close";
                startButton.innerHTML = "Start";

                innerArea.className = "gifster-inner-area";
                area.className = "gifster-area";
                toolbar.className = "gifster-toolbar";
                closeButton.className = "gifster-close-button";
                startButton.className = "gifster-start-button";

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

                const calculateBounds = (ev) => {
                    const innerAreaBounds = innerArea.getBoundingClientRect();
                    const insideInnerAreaCondition = ev.clientX >= innerAreaBounds.left
                        && ev.clientX <= innerAreaBounds.right
                        && ev.clientY >= innerAreaBounds.top
                        && ev.clientY <= innerAreaBounds.bottom;

                    if (insideInnerAreaCondition) {
                        area.style.pointerEvents = "none";
                        innerArea.style.pointerEvents = "none";
                    }
                    else {
                        area.style.pointerEvents = "auto";
                        innerArea.style.pointerEvents = "auto";
                    }
                };
                document.addEventListener("mousemove", calculateBounds);

                jQuery(area).draggable().resizable({minWidth: 250, minHeight: 200});

                area.resize = (ev) => {
                    innerArea.style.width = "100%";
                    innerArea.style.height = "calc(100% - 52px)";
                }
            }
        );
    }

    renderTimer(element) {
        if (!this.timer) {
            this.timer = document.createElement("div");

            this.timer.innerHTML = 3;
            let counter = 0;

            if (element) {
                this.timer.className = "gifster-timer-inside";
                element.appendChild(this.timer);
            }
            else {
                this.timer.className = "gifster-timer";
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
