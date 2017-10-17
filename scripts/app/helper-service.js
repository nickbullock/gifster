
export default class HelperService{
    static makeElementDraggable(element) {
        element.onmousedown = function(e) {

            let bounds = element.getBoundingClientRect();
            let shiftX = e.screenX - bounds.left;
            let shiftY = e.screenY - bounds.top;

            moveAt(e);

            function moveAt(e) {
                element.style.left = e.screenX - shiftX + "px";
                element.style.top = e.screenY - shiftY + "px";
            }

            document.onmousemove = function(e) {
                moveAt(e);
            };

            element.onmouseup = function() {
                document.onmousemove = null;
                element.onmouseup = null;
                console.log("MOUSEUP", document)
            };

        };

        element.ondragstart = function() {
            return false;
        };

        return element;

    }
}