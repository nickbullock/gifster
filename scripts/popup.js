import $ from "jQuery";
import "../manifest.json";
import "../static/icon16.png";
import "../static/icon128.png";

$(function() {
    const SCREEN = ".screen";
    const WEBCAM = ".webcam";
    const OPTIONS = ".options";

    function init () {
        registerButtonCallbackList();
    }

    function registerButtonCallbackList () {
        $(SCREEN).click(screenHandler);
        $(WEBCAM).click(webcamHandler);
        $(OPTIONS).click(openOptionsPage)
    }

    function screenHandler() {
        chrome.runtime.sendMessage({screen: true}, function(response) {
            console.log(response.data);
        });
    }

    function webcamHandler() {
        chrome.runtime.sendMessage({webcam: true}, function(response) {
            console.log(response.data);
        });
    }

    function openOptionsPage() {
        if (chrome.runtime.openOptionsPage) {
            chrome.runtime.openOptionsPage();
        } else {
            window.open(chrome.runtime.getURL('options.html'));
        }
    }

    init();
});





