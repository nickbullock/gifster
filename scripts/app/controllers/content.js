import WebcamController from "./webcam";
import jQuery from "jquery";
import "jquery-ui-dist/jquery-ui.js";

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
                const area = new DOMParser().parseFromString(`
                <div class="gifster-area" style="left: calc(50% - ${gifsterOptions.width / 2}px);top: calc(50% - ${gifsterOptions.height / 2}px)">
                    <div class="gifster-inner-area" style="width: ${gifsterOptions.width}px; height: ${gifsterOptions.height}px"></div>
                    <div class="gifster-toolbar">
                        <button class="gifster-button gifster-button-start">Start</button>
                        <button class="gifster-button gifster-button-stop">Stop</button>
                        <button class="gifster-button gifster-button-close">Close</button>
                    </div>
                </div>
                `, "text/html").getElementsByClassName("gifster-area")[0];
                const innerArea = area.getElementsByClassName("gifster-inner-area")[0];
                const startButton = area.getElementsByClassName("gifster-button-start")[0];
                const stopButton = area.getElementsByClassName("gifster-button-stop")[0];
                const closeButton = area.getElementsByClassName("gifster-button-close")[0];

                const sendAreaStartMessage = () => {
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
                const sendStopMessage = () => chrome.runtime.sendMessage({areaStop: true});

                closeButton.onclick = () => area.remove();
                startButton.onclick = () => sendAreaStartMessage();
                stopButton.onclick = () => sendStopMessage();

                document.getElementsByTagName("body")[0].appendChild(area);

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

                jQuery(area)
                    .draggable()
                    .resizable({
                        minWidth: 250,
                        minHeight: 50
                    });

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