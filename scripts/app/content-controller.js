import WebcamController from "./webcam-controller";
import interact from "interact";

class ContentController {
    constructor() {
        console.log("[ContentController] constructor init");
    }

    start() {
        this.timer = null;
        chrome.runtime.sendMessage({contentInit: true});
        chrome.runtime.onMessage.addListener(this.messageListener.bind(this));
    }

    messageListener(request, sender, sendResponse) {
        console.log("[ContentController.messageLister] incoming message", request);

        if (request.webcam) {
            this.renderTimer();

            setTimeout(() => new WebcamController(true).start(), 3300);
        }
        if(request.renderAreaWindow){
            this.renderAreaWindow();
        }
        if (request.renderTimer) {
            this.renderTimer();
        }
    }

    renderAreaWindow() {
        chrome.storage.sync.get(
            "gifsterOptions",
            (opts) => {
                console.log("[ContentController.process] render area window", opts.gifsterOptions);

                const gifsterOptions = opts.gifsterOptions;
                const area = document.createElement("div");
                const innerArea = document.createElement("div");
                const toolbar = document.createElement("div");
                const closeButton = document.createElement("button");
                const startButton = document.createElement("button");
                // const resizer = document.createElement("div");

                innerArea.style.width = `${gifsterOptions.width}px`;
                innerArea.style.height = `${gifsterOptions.height}px`;
                area.style.left = `calc(50% - ${gifsterOptions.width/2}px)`;
                area.style.top = `calc(50% - ${gifsterOptions.height/2}px)`;
                closeButton.innerHTML = "Close";
                startButton.innerHTML = "Start";

                innerArea.className = "gifster-inner-area";
                innerArea.id = "gifster-inner-area";
                area.className = "gifster-area";
                area.id = "gifster-area";
                toolbar.className = "gifster-toolbar";
                toolbar.id = "gifster-toolbar";
                closeButton.className = "gifster-close-button";
                closeButton.id = "gifster-close-button";
                startButton.className = "gifster-start-button";
                startButton.id = "gifster-start-button";
                // resizer.className = "gifster-resizer";
                // resizer.id = "gifster-resizer";

                closeButton.onclick = () => area.remove();
                startButton.onclick = () => {
                    this.renderTimer(innerArea);

                    setTimeout(() => {
                        chrome.runtime.sendMessage({
                            areaStart: true,
                            bounds: innerArea.getBoundingClientRect(),
                            screenWidth: window.innerWidth,
                            screenHeight: window.innerHeight
                        });
                    }, 3300)
                };

                area.appendChild(innerArea);
                area.appendChild(toolbar);
                // area.appendChild(resizer);
                toolbar.appendChild(closeButton);
                toolbar.appendChild(startButton);

                document.querySelector("body").appendChild(area);

                const calculateBounds = (ev) => {
                    const innerAreaBounds = innerArea.getBoundingClientRect();
                    const insideInnerAreaCondition = ev.clientX >= innerAreaBounds.left
                        && ev.clientX <= innerAreaBounds.right
                        && ev.clientY >= innerAreaBounds.top
                        && ev.clientY <= innerAreaBounds.bottom;

                    if (insideInnerAreaCondition) {
                        area.style.pointerEvents = "none";
                        innerArea.style.pointerEvents = "none";
                    }
                    else {
                        area.style.pointerEvents = "auto";
                        innerArea.style.pointerEvents = "auto";
                    }
                };
                // const moveArea = (ev, shiftX, shiftY) => {
                //     area.style.left = ev.clientX - shiftX + "px";
                //     area.style.top = ev.clientY - shiftY + "px";
                // };
                // const calculateBoundsAndMove = (shiftX, shiftY, ev) => {
                //     ev.stopPropagation();
                //
                //     moveArea(ev, shiftX, shiftY);
                //     calculateBounds(ev);
                //
                //     return false;
                // };
                // const stopMove = () => {
                //     console.log("MOUSE UP")
                //     document.removeEventListener("mousemove", calculateBoundsAndMove);
                //     document.addEventListener("mousemove", calculateBounds);
                //     document.removeEventListener("mouseup", stopMove);
                // };
                //
                // // document.onmousemove = (ev) => calculateBounds(ev);
                document.addEventListener("mousemove", calculateBounds);



                // area.onmousedown = (ev) => {
                //     area.style.pointerEvents = "auto";
                //     innerArea.style.pointerEvents = "auto";
                //
                //     const areaBounds = area.getBoundingClientRect();
                //     const shiftX = ev.clientX - areaBounds.left;
                //     const shiftY = ev.clientY - areaBounds.top;
                //
                //     document.removeEventListener("mousemove", calculateBounds);
                //     document.addEventListener("mousemove", calculateBoundsAndMove.bind(null, shiftX, shiftY));
                //     document.addEventListener("mouseup", stopMove);
                // };
                //
                // area.ondragstart = function() {
                //     return false;
                // };
                //
                // resizer.onmousedown = (ev) => {
                //     console.log(">>>>resize mousedown", ev)
                //     const startX = ev.clientX;
                //     const startY = ev.clientY;
                //     const startWidth = parseInt(area.style.width, 10);
                //     const startHeight = parseInt(area.style.height, 10);
                //
                //     function resize(ev) {
                //         console.log(">>>>resize mousemove", ev)
                //         area.style.width = (startWidth + ev.clientX - startX) + 'px';
                //         area.style.height = (startHeight + ev.clientY - startY) + 'px';
                //     }
                //     function stopResize(ev) {
                //         document.removeEventListener('mousemove', resize, false);
                //         document.removeEventListener('mouseup', stopResize, false);
                //     }
                //
                //     document.addEventListener("mousemove", resize);
                //     document.addEventListener("mouseup", stopResize);
                // }
            }
        );
    }

    renderTimer(element) {
        if (!this.timer) {
            this.timer = document.createElement("div");

            this.timer.id = "gifster-timer";

            this.timer.innerHTML = 3;
            let counter = 0;

            if(element){
                this.timer.className = "gifster-timer-inside";
                element.appendChild(this.timer);
            }
            else{
                this.timer.className = "gifster-timer";
                document.querySelector("body").appendChild(this.timer);
            }

            const interval = setInterval(() => {
                counter++;

                switch (counter) {
                    case 3:
                        clearInterval(interval);
                        this.timer.remove();
                        this.timer = null;
                        break;
                    default:
                        this.timer.innerHTML--;
                        break;
                }
            }, 1000)
        }
    }
}

const controller = new ContentController();

controller.start();
