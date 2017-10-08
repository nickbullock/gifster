import WebcamController from "./webcam-controller";

class ContentController {
    start () {
        chrome.runtime.sendMessage({contentInit: true});
        chrome.runtime.onMessage.addListener(this.messageListener);
    }

    messageListener(request, sender, sendResponse) {
        if(request.webcam){
            const controller = new WebcamController();

            controller.start();
        }
    }
}

const controller = new ContentController();

controller.start();
