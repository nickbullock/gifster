
export default class HelperService {

    static makeAreaDraggable(area, innerArea) {

        const calculateBounds = (ev) => {
            const innerAreaBounds = innerArea.getBoundingClientRect();
            console.log("calculating bounds", ev.screenX, ev.screenY, innerAreaBounds)

            if (ev.screenX >= innerAreaBounds.left && ev.screenX <= innerAreaBounds.right &&
                ev.screenY >= innerAreaBounds.top && ev.screenY <= innerAreaBounds.bottom) {
                if(!innerArea.pointerEvents || innerArea.pointerEvents === "auto"){
                    console.log("NONE")
                    area.style.pointerEvents = "none";
                    innerArea.style.pointerEvents = "none";
                    // innerArea.classList.add("gifster-area-through");
                    // innerArea.parentNode.classList.add("gifster-area-through");
                }
            }
            else {
                if(!innerArea.pointerEvents || innerArea.pointerEvents === "none"){
                    console.log("AUTO")
                    area.style.pointerEvents = "auto";
                    innerArea.style.pointerEvents = "auto";
                    // innerArea.classList.remove("gifster-area-through");
                    // innerArea.parentNode.classList.remove("gifster-area-through");
                }
            }
        };

        // const moveArea = (ev) => {
        //     const areaBounds = area.getBoundingClientRect();
        //     const shiftX = ev.screenX - areaBounds.left;
        //     const shiftY = ev.screenY - areaBounds.top;
        //
        //     area.style.left = ev.screenX - shiftX + "px";
        //     area.style.top = ev.screenY - shiftY + "px";
        // };

        document.onmousemove = (ev) => calculateBounds(ev);

        document.click = (ev) => console.log("CLICK", ev.screenX, ev.screenY);

        // area.onmousedown = function(ev) {
        //     ev.stopPropagation();
        //
        //     let isDragging = true;
        //
        //     document.onmousemove = function(ev) {
        //         calculateBounds(ev);
        //         moveArea(ev);
        //     };
        //
        //     document.onmouseup = function() {
        //         if(isDragging){
        //             isDragging = false;
        //
        //             document.onmousemove = (ev) => calculateBounds(ev);
        //             document.onmouseup = null;
        //         }
        //     };
        //
        //     calculateBounds(ev);
        //     moveArea(ev);
        // };

        area.ondragstart = function() {
            return false;
        };
    }
}