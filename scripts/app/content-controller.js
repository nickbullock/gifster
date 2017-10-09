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
        if(request.renderTimer){
            this.renderTimer();
        }
        if(request.killTimer){
            this.killTimer();
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
                    timer.style.left = `calc(50% - ${timer.offsetWidth})`;
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
