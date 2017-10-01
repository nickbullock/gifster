import "../manifest.json";
import "../static/icon16.png";
import "../static/icon48.png";
import "../static/icon128.png";
import $ from "jQuery";
import "materialize-css/dist/js/materialize.js";
import "materialize-css/dist/css/materialize.css";
import RecordRTC from "recordrtc";

navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

$(function() {
    const SCREEN = ".screen";
    const WEBCAM = ".webcam";
    const STOP = ".stop";
    const OPTIONS = ".options";
    let rrtc;

    function init () {
        registerButtonCallbackList();
    }

    function registerButtonCallbackList () {
        $(SCREEN).click(screenHandler);
        $(WEBCAM).click(webcamHandler);
        $(STOP).click(recordStopper);
        $(OPTIONS).click(openOptionsPage)
    }

    function screenHandler() {
        const mediaOptions = {
            video: true
        };
        
        function screenHandlerSuccess(stream) {

            const options = {
                type: "gif"
            };

            rrtc = RecordRTC(stream, options);
            rrtc.startRecording();
        }

        navigator.getUserMedia(mediaOptions, screenHandlerSuccess, defaultErrorHandler);
    }

    function webcamHandler() {
        const mediaOptions = {
            video: true
        };

        function webcamHandlerSuccess(stream) {

            const options = {
                type: "gif"
            };

            rrtc = RecordRTC(stream, options);
            rrtc.startRecording();
        }

        navigator.getUserMedia(mediaOptions, webcamHandlerSuccess, defaultErrorHandler);
    }

    function recordStopper() {
        rrtc.stopRecording((data) => console.log(data))
        rrtc.save();
    }

    function openOptionsPage() {
        if (chrome.runtime.openOptionsPage) {
            chrome.runtime.openOptionsPage();
        } else {
            window.open(chrome.runtime.getURL('options.html'));
        }
    }

    function defaultErrorHandler(e) {
        console.log(e);
    }

    init();
});





