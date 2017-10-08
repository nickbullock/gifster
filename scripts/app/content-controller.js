import WebcamController from "./webcam-controller";

class ContentController {
    start () {
        chrome.runtime.sendMessage({contentInit: true});
        chrome.runtime.onMessage.addListener(this.messageListener.bind(this));
    }

    messageListener(request, sender, sendResponse) {
        if(request.webcam){
            const controller = new WebcamController();

            controller.start();
        }
        if(request.timer){
            this.renderTimer();
        }
    }

    renderTimer () {
        const timer = document.createElement("div");

        timer.id = "gifster-timer";
        timer.className = "gifster-timer";

        timer.innerHTML = 3;
        let counter = 0;

        document.querySelector("body").appendChild(timer);

        const interval = setInterval(() => {
            counter++;

            switch (counter){
                case 3:
                    timer.innerHTML = "Recording";
                    break;
                case 4:
                    clearInterval(interval);
                    timer.remove();
                    break;
                default:
                    timer.innerHTML--;
                    break;
            }
        }, 1000)
    }
}

const controller = new ContentController();

controller.start();
