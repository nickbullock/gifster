import "./../style/simple-grid.css";
import "./../style/options.css";

document.addEventListener("DOMContentLoaded",
    function OptionsController() {
        let options = {};

        const REC_TIME = "input#rec-time";
        const FRAME_RATE = "input#frame-rate";
        const RESOLUTION = "input#resolution";
        const QUALITY = "input#quality";

        chrome.runtime.sendMessage({optionsInit: true});

        document.querySelector(REC_TIME).addEventListener("change", changeRecTimeBlockValue);
        document.querySelector(FRAME_RATE).addEventListener("change", changeFrameRateBlockValue);
        document.querySelector(RESOLUTION).addEventListener("change", changeResolutionBlockValue);
        document.querySelector(QUALITY).addEventListener("change", changeQualityBlockValue);

        function changeRecTimeBlockValue (event) {
            options[event.target.id] = event.target.value;
            event.target.parentNode.previousSibling.previousSibling.children[0].innerHTML = event.target.value + "s";
        }
        function changeFrameRateBlockValue (event) {
            options[event.target.id] = event.target.value;
            event.target.parentNode.previousSibling.previousSibling.children[0].innerHTML = event.target.value + "fps";
        }
        function changeResolutionBlockValue (event) {
            console.log(event.target.value)
            switch(event.target.value){
                case "0":
                    options.width = 480;
                    options.height = 360;
                    break;
                case "1":
                    options.width = 858;
                    options.height = 480;
                    break;
                case "2":
                    options.width = 1280;
                    options.height = 720;
                    break;
                case "3":
                    options.width = 1920;
                    options.height = 1080;
                    break;
            }
            event.target.parentNode.previousSibling.previousSibling.children[0].innerHTML = `${options.width}/${options.height}px`;
        }
        function changeQualityBlockValue (event) {
            options[event.target.id] = event.target.value;
            event.target.parentNode.previousSibling.previousSibling.children[0].innerHTML = event.target.value;
        }



    }
);