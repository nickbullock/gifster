import "./../../style/simple-grid.css";
import "./../../style/options.css";

document.addEventListener("DOMContentLoaded",
    function OptionsController() {
        const options = {};
        const defaultOptions = {
            duration: "5",
            fps: "15",
            resolution: "2",
            quality: "10"
        };

        const DURATION = "input#duration";
        const FPS = "input#fps";
        const RESOLUTION = "input#resolution";
        const QUALITY = "input#quality";
        const SAVE = "a.save-btn";

        chrome.runtime.sendMessage({optionsInit: true});

        document.querySelector(DURATION).addEventListener("change", getValue.bind(null, "duration"));
        document.querySelector(FPS).addEventListener("change", getValue.bind(null, "fps"));
        document.querySelector(RESOLUTION).addEventListener("change", getValue.bind(null, "resolution"));
        document.querySelector(QUALITY).addEventListener("change", getValue.bind(null, "quality"));
        document.querySelector(SAVE).addEventListener("click", save);

        function getValue (key, event) {
            options[event.target.id] = event.target.value;
            renderValue(key, event.target.value)
        }
        function setValue(key, value) {
            document.querySelector(`input#${key}`).value = value;
            renderValue(key, value)
        }
        function renderValue(key, value) {
            document.querySelector(`.settings__block_${key} > .block__title > .block__value`).innerHTML = value;
        }

        function init(optionsInit, isFirstInit) {
            if(isFirstInit){
                chrome.storage.sync.set({gifsterOptions: defaultOptions});
                optionsInit = defaultOptions;
            }

            console.log("[OptionsController.init] init options", optionsInit);

            Object.assign(options, optionsInit);

            setValue("duration", options.duration);
            setValue("resolution", options.resolution);
            setValue("fps", options.fps);
            setValue("quality", options.quality);
        }

        function save() {
            const optionsInit = {};
            Object.assign(optionsInit, options);
            switch(optionsInit.resolution.toString()) {
                case "1":
                    optionsInit.width = 480;
                    optionsInit.height = 360;
                    break;
                case "2":
                    optionsInit.width = 858;
                    optionsInit.height = 480;
                    break;
                case "3":
                    optionsInit.width = 1280;
                    optionsInit.height = 720;
                    break;
                case "4":
                    optionsInit.width = 1920;
                    optionsInit.height = 1080;
                    break;
            }

            Object.keys(optionsInit).forEach(key => optionsInit[key] = parseInt(optionsInit[key]));

            chrome.storage.sync.set(
                {gifsterOptions: optionsInit},
                () => {
                    console.log("[OptionsController.save] saved options", optionsInit);

                    chrome.notifications.create({
                        type: "basic",
                        iconUrl: chrome.extension.getURL("icon128.png"),
                        title: "Options saved",
                        message: "Gifster saved your options succesfully :)"
                    });
                }
            );
        }

        chrome.storage.sync.get(
            "gifsterOptions",
            (options) => {
                if(options && options.gifsterOptions && Object.keys(options.gifsterOptions).length > 0){
                    init(options.gifsterOptions, false);
                }
                else{
                    init(defaultOptions, true)
                }
            }
        );
    }
);