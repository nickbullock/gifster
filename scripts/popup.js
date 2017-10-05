import "./../style/popup.css";
import "./../static/webcam.png";
import "./../static/screen.png";
import "./../static/settings.png";

document.addEventListener("DOMContentLoaded",
    function popupController() {
        const SCREEN = ".list__item_screen";
        const WEBCAM = ".list__item_webcam";
        const OPTIONS = ".list__item_options";

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





