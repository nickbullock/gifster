import WebcamController from "./webcam-controller";

class ContentController {
    constructor () {
        console.log("[ContentController] constructor init");
    }
    start () {
        this.timer = null;
        chrome.runtime.sendMessage({contentInit: true});
        chrome.runtime.onMessage.addListener(this.messageListener.bind(this));
    }

    messageListener(request, sender, sendResponse) {
        console.log("[ContentController.messageLister] incoming message", request);

        if(request.webcam){
            this.renderTimer();

            setTimeout(() => new WebcamController(true).start(), 3300);
        }
        if(request.renderTimer){
            this.renderTimer();
        }
    }

    renderTimer () {
        if(!this.timer){
            this.timer = document.createElement("div");

            this.timer.id = "gifster-timer";
            this.timer.className = "gifster-timer";

            this.timer.innerHTML = 3;
            let counter = 0;

            document.querySelector("body").appendChild(this.timer);

            const interval = setInterval(() => {
                counter++;

                switch (counter){
                    case 3:
                        clearInterval(interval);
                        // this.timer.remove();
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

controller.renderTimer()
