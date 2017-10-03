import "../manifest.json";
import "../static/icon16.png";
import "../static/icon128.png";

document.addEventListener("DOMContentLoaded",
    function popupController() {
        const SCREEN = ".screen";
        const WEBCAM = ".webcam";
        const OPTIONS = ".options";

        function init() {
            registerButtonCallbackList();
        }

        function registerButtonCallbackList() {
            document.querySelector(SCREEN).addEventListener("click", screenHandler);
            document.querySelector(WEBCAM).addEventListener("click", webcamHandler);
            document.querySelector(OPTIONS).addEventListener("click", openOptionsPage);
        }

        function screenHandler() {
            chrome.runtime.sendMessage({screen: true}, function (response) {
                console.log(response.data);
            });
            window.close();
        }

        function webcamHandler() {
            chrome.runtime.sendMessage({webcam: true}, function (response) {
                console.log(response.data);
            });
            window.close();
        }

        function openOptionsPage() {
            if (chrome.runtime.openOptionsPage) {
                chrome.runtime.openOptionsPage();
            } else {
                window.open(chrome.runtime.getURL('options.html'));
            }
        }

        init();
    }
);





