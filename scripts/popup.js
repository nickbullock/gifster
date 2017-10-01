import $ from "jQuery";
import "../manifest.json";
import "../static/icon16.png";
import "../static/icon48.png";
import "../static/icon128.png";
import "materialize-css/dist/js/materialize.js";
import "materialize-css/dist/css/materialize.css";

$(function() {
    const SCREEN = ".screen";
    const WEBCAM = ".webcam";
    const OPTIONS = ".options";
    let downButtonHash = {};

    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

    function init () {
        registerButtonCallbackList();
        registerHotKeyCallbackList();
    }

    function registerButtonCallbackList () {
        $(SCREEN).click(screenHandler);
        $(WEBCAM).click(webcamHandler);
        $(OPTIONS).click(openOptionsPage)
    }

    function registerHotKeyCallbackList () {
        $(document)
            .keydown(e => {
                downButtonHash[e.keyCode] = true;
            })
            .keyup(e => {
                if(downButtonHash[17] && downButtonHash[16] && downButtonHash[87]){
                    webcamHandler();
                }
                if(downButtonHash[17] && downButtonHash[16] && downButtonHash[83]){
                    screenHandler();
                }
                downButtonHash[e.keyCode] = false;
            })
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





