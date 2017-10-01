import $ from "jQuery";

$(function() {
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

    const mediaOptions = {
        video: true
    };

    chrome.storage.sync.get('isPermissionGranted', (storage) => {
        /**
         * Определяем, есть ли у нас права на использвание webrtc api
         */
        if(storage.isPermissionGranted){
            console.log("All privileges were granted before");
        }
        /**
         * Спрашиваем у пользователя и записываем в стор
         */
        else{
            navigator.getUserMedia(
                mediaOptions,
                stream => {
                    chrome.storage.sync.set({'isPermissionGranted': true});
                    console.log("All privileges granted now")
                },
                e => console.error(e)
            )
        }
    });
});