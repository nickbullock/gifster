import "./../../../style/simple-grid.css";
import "./../../../style/options.css";

class OptionsController {
    constructor () {
        this.options = {};
        this.defaultOptions = {
            preview: true,
            timer: true,
            duration: 5,
            fps: 10,
            resolution: 2,
            quality: 10,
            width: 858,
            height: 480
        };

        this.saveId = "save";
        this.optionsValuesHash = {
            duration: Array.apply(null, {length: 10}).map((item, index) => `${index+1}s`),
            fps: Array.apply(null, {length: 10}).map((item, index) => `${index+1}fps`),
            resolution: ["360p", "480p", "720p"],
            quality: Array.apply(null, {length: 10}).map((item, index) => index)
        };
        this.optionsIdList = [
            "duration",
            "fps",
            "resolution",
            "quality",
            "preview",
            "delay"
        ]
    }

    start () {
        chrome.runtime.sendMessage({optionsInit: true});

        this.getValue = this.getValue.bind(this);
        this.setValue = this.setValue.bind(this);
        this.renderValue = this.renderValue.bind(this);
        this.initValues = this.initValues.bind(this);
        this.saveValues = this.saveValues.bind(this);

        document.getElementById(this.saveId).addEventListener("click", this.saveValues);
        this.optionsIdList.forEach(selector =>
            document.getElementById(selector).addEventListener("change", this.getValue));

        chrome.storage.sync.get(
            "gifsterOptions",
            (options) => {
                if(options && options.gifsterOptions && Object.keys(options.gifsterOptions).length > 0){
                    return this.initValues(options.gifsterOptions, false);
                }

                return this.initValues(this.defaultOptions, true);
            }
        );
    }

    getValue (event) {
        if(event.target.type !== "checkbox"){
            this.options[event.target.id] = event.target.value;

            return this.renderValue(event.target.id, event.target.value);
        }

        this.options[event.target.id] = event.target.checked;

        return null;
    }

    setValue(key, value) {
        const element = document.getElementById(key);

        if(element){
            if(element.type === "checkbox"){
                element.checked = value;
            }
            else{
                element.value = value;

                return this.renderValue(key, value)
            }
        }

        return null;
    }

    renderValue(key, value) {
        if(this.optionsValuesHash.hasOwnProperty(key)){
            return document.querySelector(`.settings__block_${key} > .block__title > .block__value`).innerHTML = this.optionsValuesHash[key][value-1];
        }

        return document.querySelector(`.settings__block_${key} > .block__title > .block__value`).innerHTML = value;
    }

    initValues(optionsInit, isFirstInit) {
        if(isFirstInit){
            chrome.storage.sync.set({gifsterOptions: this.defaultOptions});

            optionsInit = this.defaultOptions;
        }

        console.log("[OptionsController.initValues] options", optionsInit, isFirstInit);

        Object.assign(this.options, optionsInit);
        Object.keys(this.options).forEach(key => this.setValue(key, this.options[key]));
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

        Object.keys(optionsInit).forEach(key =>
            optionsInit[key] = isNaN(parseInt(optionsInit[key])) ? optionsInit[key] : parseInt(optionsInit[key]));

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