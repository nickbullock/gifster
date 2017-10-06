import "./../style/simple-grid.css";
import "./../style/options.css";

document.addEventListener("DOMContentLoaded",
    function OptionsController() {
        let options = {};
        const defaultOptions = {
            duration: 5,
            fps: 15,
            width: 858,
            height: 480,
            quality: 10
        };

        const DURATION = "input#duration";
        const FRAME_RATE = "input#fps";
        const RESOLUTION = "input#resolution";
        const QUALITY = "input#quality";

        chrome.runtime.sendMessage({optionsInit: true});

        document.querySelector(DURATION).addEventListener("change", changeDurationValue);
        document.querySelector(FRAME_RATE).addEventListener("change", changeFrameRateValue);
        document.querySelector(RESOLUTION).addEventListener("change", changeResolutionValue);
        document.querySelector(QUALITY).addEventListener("change", changeQualityValue);

        function changeDurationValue (event) {
            options[event.target.id] = event.target.value;
            document.querySelector(".settings__block_duration > .block__title > .block__value").innerHTML = event.target.value + "s";
        }
        function changeFrameRateValue (event) {
            options[event.target.id] = event.target.value;
            document.querySelector(".settings__block_fps > .block__title > .block__value").innerHTML = event.target.value + "fps";
        }
        function changeResolutionValue (event) {
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
            document.querySelector(".settings__block_resolution > .block__title > .block__value").innerHTML = `${options.height}p`;
        }
        function changeQualityValue (event) {
            options[event.target.id] = event.target.value;
            document.querySelector(".settings__block_quality > .block__title > .block__value").innerHTML = event.target.value;
        }

        function init(options, isFirstInit) {
            if(isFirstInit){
                chrome.storage.set("gifsterOptions", defaultOptions);
            }

            changeDurationValue({target:{value: defaultOptions.duration}});
            changeFrameRateValue({target:{value: defaultOptions.fps}});
            changeQualityValue({target:{value: defaultOptions.quality}});
            changeResolutionValue({target:{value: "1"}});
        }

        function save() {
            console.log("save", options);

            chrome.storage.set("gifsterOptions", options);
        }

        chrome.storage.sync.get(
            "gifsterOptions",
            (options) => {
                if(options){
                    init(options, false);
                }
                else{
                    init(defaultOptions, true)
                }
            }
        );



    }
);