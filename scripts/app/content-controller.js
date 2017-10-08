import WebcamController from "./webcam-controller";

chrome.runtime.sendMessage({contentInit: true});
chrome.runtime.onMessage.addListener(messageListener);

function messageListener(request, sender, sendResponse) {
    if(request.webcam){
        const controller = new WebcamController();

        controller.start();
    }
}