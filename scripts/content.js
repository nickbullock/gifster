import $ from "jQuery";

chrome.runtime.sendMessage({init: true}, function(response) {
    console.log(response.data);
});

$(function() {
    const downButtonHash = {};

    $(document)
        .keydown(e => {
            downButtonHash[e.keyCode] = true;
        })
        .keyup(e => {
            // CTRL+SHIFT+W
            if(downButtonHash[17] && downButtonHash[16] && downButtonHash[87]){
                chrome.runtime.sendMessage({webcam: true}, function(response) {
                    console.log(response.data);
                });
            }
            // CTRL+SHIFT+S
            if(downButtonHash[17] && downButtonHash[16] && downButtonHash[83]){
                chrome.runtime.sendMessage({screen: true}, function(response) {
                    console.log(response.data);
                });
            }
            downButtonHash[e.keyCode] = false;
        })
});