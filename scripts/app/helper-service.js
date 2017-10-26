
export default class HelperService {

    static makeAreaDraggable(area, innerArea) {

        const calculateBounds = (ev) => {
            const innerAreaBounds = innerArea.getBoundingClientRect();

            if (ev.clientX >= innerAreaBounds.left && ev.clientX <= innerAreaBounds.right &&
                ev.clientY >= innerAreaBounds.top && ev.clientY <= innerAreaBounds.bottom) {
                if(!innerArea.pointerEvents || innerArea.pointerEvents === "auto"){
                    area.style.pointerEvents = "none";
                    innerArea.style.pointerEvents = "none";
                }
            }
            else {
                if(!innerArea.pointerEvents || innerArea.pointerEvents === "none"){
                    area.style.pointerEvents = "auto";
                    innerArea.style.pointerEvents = "auto";
                }
            }
        };

        const moveArea = (ev, shiftX, shiftY) => {
            area.style.left = ev.clientX - shiftX + "px";
            area.style.top = ev.clientY - shiftY + "px";
        };

        document.onmousemove = (ev) => calculateBounds(ev);

        area.onmousedown = function(ev) {
            area.style.pointerEvents = "auto";
            innerArea.style.pointerEvents = "auto";

            const areaBounds = area.getBoundingClientRect();
            const shiftX = ev.clientX - areaBounds.left;
            const shiftY = ev.clientY - areaBounds.top;
            let isDragging = true;

            document.onmousemove = function(ev) {
                ev.stopPropagation();
                ev.preventDefault();

                calculateBounds(ev);
                moveArea(ev, shiftX, shiftY);

                return false;
            };

            document.onmouseup = function() {
                if(isDragging){
                    isDragging = false;
                    area.style.pointerEvents = "none";
                    innerArea.style.pointerEvents = "none";

                    document.onmousemove = (ev) => calculateBounds(ev);
                    document.onmouseup = null;
                }
            };
        };

        area.ondragstart = function() {
            return false;
        };
    }
}