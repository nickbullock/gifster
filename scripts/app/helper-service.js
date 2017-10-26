
export default class HelperService {

    static makeAreaDraggable(area, innerArea) {

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

            document.onmousemove = function(ev) {
                ev.stopPropagation();

                moveArea(ev, shiftX, shiftY);
                calculateBounds(ev);

                return false;
            };

            document.onmouseup = function() {
                document.onmousemove = (ev) => calculateBounds(ev);
                document.onmouseup = null;
            };
        };

        area.ondragstart = function() {
            return false;
        };
    }
}