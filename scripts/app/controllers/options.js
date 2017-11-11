import "./../../../style/simple-grid.css";
import "./../../../style/options.css";

class OptionsController {
    constructor () {
        this.options = {};
        this.defaultOptions = {
            duration: 5,
            fps: 10,
            resolution: 2,
            quality: 10,
            width: 858,
            height: 480
        };

        this.durationSelector = "input#duration";
        this.fpsSelector = "input#fps";
        this.resolutionSelector = "input#resolution";
        this.qualitySelector = "input#quality";
        this.saveSelector = "a.save-btn";
    }

    start () {
        chrome.runtime.sendMessage({optionsInit: true});

        this.getValue = this.getValue.bind(this);
        this.setValue = this.setValue.bind(this);
        this.renderValue = this.renderValue.bind(this);
        this.initValues = this.initValues.bind(this);
        this.saveValues = this.saveValues.bind(this);


        document.querySelector(this.durationSelector).addEventListener("change", this.getValue.bind(null, "duration"));
        document.querySelector(this.fpsSelector).addEventListener("change", this.getValue.bind(null, "fps"));
        document.querySelector(this.resolutionSelector).addEventListener("change", this.getValue.bind(null, "resolution"));
        document.querySelector(this.qualitySelector).addEventListener("change", this.getValue.bind(null, "quality"));
        document.querySelector(this.saveSelector).addEventListener("click", this.saveValues);

        chrome.storage.sync.get(
            "gifsterOptions",
            (options) => {
                if(options && options.gifsterOptions && Object.keys(options.gifsterOptions).length > 0){
                    this.initValues(options.gifsterOptions, false);
                }
                else{
                    this.initValues(this.defaultOptions, true)
                }
            }
        );
    }

    getValue (key, event) {
        this.options[event.target.id] = event.target.value;
        this.renderValue(key, event.target.value)
    }

    setValue(key, value) {
        document.querySelector(`input#${key}`).value = value;
        this.renderValue(key, value)
    }

    renderValue(key, value) {
        document.querySelector(`.settings__block_${key} > .block__title > .block__value`).innerHTML = value;
    }

    initValues(optionsInit, isFirstInit) {
        if(isFirstInit){
            chrome.storage.sync.set({gifsterOptions: this.defaultOptions});

            optionsInit = this.defaultOptions;
        }

        console.log("[OptionsController.initValues] options", optionsInit, isFirstInit);

        Object.assign(this.options, optionsInit);

        this.setValue("duration", this.options.duration);
        this.setValue("resolution", this.options.resolution);
        this.setValue("fps", this.options.fps);
        this.setValue("quality", this.options.quality);
    }

    saveValues () {
        const optionsInit = {};

        Object.assign(optionsInit, this.options);
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
}

document.addEventListener("DOMContentLoaded",
     () => {
        const controller = new OptionsController();

        controller.start();
    }
);