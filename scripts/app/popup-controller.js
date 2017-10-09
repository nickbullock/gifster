import "./../../style/popup.css";
import "./../../static/webcam.png";
import "./../../static/screen.png";
import "./../../static/settings.png";

class PopupController {
    constructor () {
        this.screenSelector = ".list__item_screen";
        this.webcamSelector = ".list__item_webcam";
        this.optionsSelector = ".list__item_options";

        this.start = this.start.bind(this);
        this.registerButtonCallbackList = this.registerButtonCallbackList.bind(this);
        this.screenHandler = this.screenHandler.bind(this);
        this.webcamHandler = this.webcamHandler.bind(this);
        this.optionsHandler = this.optionsHandler.bind(this);
    }

    start () {
        this.registerButtonCallbackList();
    }

    registerButtonCallbackList() {
        document.querySelector(this.screenSelector).addEventListener("click", this.screenHandler);
        document.querySelector(this.webcamSelector).addEventListener("click", this.webcamHandler);
        document.querySelector(this.optionsSelector).addEventListener("click", this.optionsHandler);
    }

    screenHandler() {
        chrome.runtime.sendMessage({screen: true}, function (response) {
            console.log(response.data);
        });
        window.close();
    }

    webcamHandler() {
        chrome.runtime.sendMessage({webcam: true}, function (response) {
            console.log(response.data);
        });
        window.close();
    }

    optionsHandler() {
        if (chrome.runtime.openOptionsPage) {
            chrome.runtime.openOptionsPage();
        } else {
            window.open(chrome.runtime.getURL('options.html'));
        }
    }
}

document.addEventListener("DOMContentLoaded", function () {
    const controller = new PopupController();

    controller.start();
});





