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

                area.appendChild(innerArea);

                area.style.width = `${gifsterOptions.width}px`;
                area.style.height = `${gifsterOptions.height}px`;
                area.style.left = `calc(50% - ${gifsterOptions.width/2}px)`;
                area.style.top = `calc(50% - ${gifsterOptions.height/2}px)`;

                area.className = "gifster-area";
                area.id = "gifster-area";

                innerArea.className = "gifster-inner-area";
                innerArea.id = "gifster-inner-area";

                // innerArea.onmouseenter = (ev) => {
                //     console.log("enter", ev, ev.target.classList.contains("gifster-area-through"))
                //     if(!ev.target.classList.contains("gifster-area-through")){
                //         ev.target.classList.add("gifster-area-through");
                //         ev.target.parentNode.classList.add("gifster-area-through");
                //     }
                // };
                // innerArea.onmouseleave = (ev) => {
                //     console.log("leave", ev)
                //     ev.target.classList.remove("gifster-area-through");
                //     ev.target.parentNode.classList.remove("gifster-area-through");
                // };

                document.querySelector("body").appendChild(area);
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
