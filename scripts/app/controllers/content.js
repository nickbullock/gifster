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

    messageListener(request) {
        chrome.storage.sync.get(
            "gifsterOptions",
            (opts) => {
                console.log("[ContentController.messageLister] incoming message", request);

                const options = opts.gifsterOptions;

                if (request.webcam) {
                    if(options.delay){
                        this.renderTimer();
                    }

                    setTimeout(() => new WebcamController(options, true).start(), options.delay ? 3300 : 0);
                }
                if (request.renderAreaWindow) {
                    this.renderAreaWindow(options);
                }
                if (request.renderTimer) {
                    this.renderTimer();
                }
            }
        );
    }

    renderAreaWindow(options) {
        console.log("[ContentController.process] render area window", options);

        const gifsterOptions = options;
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
            if(options.delay){
                this.renderTimer(innerArea);
            }

            setTimeout(() => {

                chrome.runtime.sendMessage({
                    areaStart: true,
                    bounds: innerArea.getBoundingClientRect(),
                    screenWidth: window.innerWidth,
                    screenHeight: window.innerHeight
                });
            }, options.delay ? 3300 : 0)
        };
        const sendStopMessage = () => chrome.runtime.sendMessage({areaStop: true});

        closeButton.onclick = () => area.remove();
        startButton.onclick = () => sendAreaStartMessage();
        stopButton.onclick = () => sendStopMessage();

        document.body.appendChild(area);

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

        area.resize = () => {
            innerArea.style.width = "100%";
            innerArea.style.height = "calc(100% - 52px)";
        }
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
                document.body.appendChild(this.timer);
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
