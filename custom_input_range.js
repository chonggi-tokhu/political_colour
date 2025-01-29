class HTMLCustomInputRangeElement extends HTMLElement {
    constructor() {
        super();
    }
    connectedCallback() {
        this.shadow = this.attachShadow({ mode: "open" });
        var style_el = document.createElement("style");
        var range_el = document.createElement("div");
        range_el.className = "range-el";
        this.range_el = this.shadow.appendChild(range_el);
        var track_el = document.createElement("div");
        track_el.className = "track-el";
        this.track_el = this.range_el.appendChild(track_el);
        var thumb_el = document.createElement("div");
        thumb_el.className = "thumb-el";
        this.thumb_el = this.track_el.appendChild(thumb_el);
        var input_el_outer = document.createElement("div");
        input_el_outer.className = "input-el_outer";
        var moving_el = document.createElement("div");
        moving_el.className = "moving-el";
        this.moving_el = this.range_el.appendChild(moving_el);
        this.moving_el.style.position = 'absolute';
        this.moving_el.style.height = '100vw';
        this.moving_el.style.top = '0px';
        this.moving_el.style.zIndex = '-999';
        var input_el = document.createElement("input");
        input_el.className = "input-el";
        input_el.type = "range";
        input_el.max = this.getAttribute("max") !== null && !isNaN(Number(this.getAttribute("max"))) ? this.getAttribute("max") : 100;
        input_el.min = this.getAttribute("min") !== null && !isNaN(Number(this.getAttribute("min"))) ? this.getAttribute("min") : 0;
        input_el.value = this.getAttribute("value") !== null && this.getAttribute("value")?.length > 0 && !isNaN(Number(this.getAttribute("value"))) ? Number(this.getAttribute("value")) : 0;
        this.input_el_outer = this.shadow.appendChild(input_el_outer);
        this.input_el_outer_shadow = this.input_el_outer.attachShadow({ mode: "open" });
        this.input_el = this.input_el_outer_shadow.appendChild(input_el);
        this.input_el.style.display = 'none';
        this.onmoving = false;
        this.max = Number(this.input_el.max);
        this.min = Number(this.input_el.min);
        this.value = Number(this.input_el.value);
        this.unitWidth = this.getAttribute("unit-width");
        this.unitWidth = this.unitWidth !== null && this.unitWidth?.length > 0 && !isNaN(Number(this.unitWidth)) ? Number(this.unitWidth) : 1;
        var bgcolour = this.getAttribute("data-bgcolour");
        bgcolour = bgcolour !== null && bgcolour?.length > 0 ? bgcolour : 'grey';
        var thumb_colour = this.getAttribute("data-thumb-colour");
        thumb_colour = thumb_colour !== null && thumb_colour?.length > 0 ? thumb_colour : '#000000';
        style_el.textContent = `
            .range-el {
                --track-bgcolour:${bgcolour};
                --thumb-bgcolour:${thumb_colour};
            }
            .range-el * {
                --track-bgcolour:inherit;
                --thumb-bgcolour:inherit;
            }
            .range-el .track-el {
                width:${(this.max - this.min) * (this.unitWidth)}px;
                height:0.75em;
                background:var(--track-bgcolour);
            }
            .range-el .track-el>.thumb-el {
                width:0.75rem;
                height:inherit;
                background:var(--thumb-bgcolour);
                position:relative;
            }
            .range-el .moving-el {
                width:${(this.max - this.min) * (this.unitWidth)}px;
                display:block;
            }
        `;
        this.colour_style = this.getAttribute("colour-style");
        if (this.colour_style !== null && this.colour_style?.length > 1) {
            this.range_el.setAttribute("style", this.colour_style);
        }
        this.style_el = this.shadow.appendChild(style_el);
        //this.thumb_el.clientLeft = this.track_el.clientLeft + (this.track_el.clientWidth * this.value * (this.max - this.min));
        Object.defineProperty(this.thumb_el, 'clientLeft', { value: this.track_el.clientLeft + (this.track_el.clientWidth * this.value * (this.max - this.min)), writable: true, configurable: true, });
        this.thumb_el.style.left = (this.track_el.clientLeft + (this.track_el.clientWidth * this.value * (this.max - this.min))) + 'px';
        var change = (ev) => {
            this.max = Number(this.input_el.max);
            this.min = Number(this.input_el.min);
            this.value = Number(this.input_el.value);
            this.thumb_el.style.setProperty('left', this.track_el.clientWidth * (this.value - this.min) / (this.max - this.min) + 'px');
        }
        this.input_el.addEventListener("change", change);
        this.lastpos = {
            x: this.thumb_el.clientLeft + (this.thumb_el.clientWidth / 2),
        }
        this.range_el.addEventListener("click", (ev) => {
            var lastx = this.lastpos.x;
            var ev_clientX = ev.clientX;
            if (ev_clientX > this.track_el.clientLeft + this.track_el.clientWidth - (this.thumb_el.clientWidth / 2) || ev_clientX < this.track_el.clientLeft + (this.thumb_el.clientWidth / 2)) {
                lastx = (ev_clientX > this.track_el.clientLeft + this.track_el.clientWidth) ? this.track_el.clientLeft + this.track_el.clientWidth : (ev_clientX < this.track_el.clientLeft + (this.thumb_el.clientWidth / 2)) ? this.track_el.clientLeft : this.lastpos.x;
                //this.thumb_el.clientLeft = (ev_clientX > this.track_el.clientLeft + this.track_el.clientWidth - (this.thumb_el.clientWidth / 2)) ? lastx - (this.thumb_el.clientWidth / 2) : (ev_clientX < this.track_el.clientLeft + (this.thumb_el.clientWidth / 2)) ? lastx - (this.thumb_el.clientWidth / 2) : lastx;
                //Object.defineProperty(this.thumb_el, 'clientLeft', { value: (ev_clientX > this.track_el.clientLeft + this.track_el.clientWidth - (this.thumb_el.clientWidth / 2)) ? lastx - (this.thumb_el.clientWidth / 2) : (ev_clientX < this.track_el.clientLeft + (this.thumb_el.clientWidth / 2)) ? lastx - (this.thumb_el.clientWidth / 2) : lastx, writable: true, configurable: true });
                this.lastpos.x = lastx;
                return;
            }
            lastx = ev_clientX;
            /* this.thumb_el.clientLeft = lastx - (this.thumb_el.clientWidth / 2);
            this.input_el.value = ((lastx - this.track_el.clientLeft) / this.track_el.clientWidth) * (this.max - this.min);
            
            var lastx = this.lastpos.x;
            if (this.thumb_el.clientX > this.track_el.clientLeft + this.track_el.clientWidth - (this.thumb_el.clientWidth / 2) || this.thumb_el.clientX < this.track_el.clientLeft + (this.thumb_el.clientWidth / 2)) {
                lastx = (this.thumb_el.clientX > this.track_el.clientLeft + this.track_el.clientWidth) ? this.track_el.clientLeft + this.track_el.clientWidth : (this.thumb_el.clientX < this.track_el.clientLeft + (this.thumb_el.clientWidth / 2)) ? this.track_el.clientLeft : this.lastpos.x;
                this.thumb_el.clientLeft = (this.thumb_el.clientX > this.track_el.clientLeft + this.track_el.clientWidth - (this.thumb_el.clientWidth / 2)) ? lastx - (this.thumb_el.clientWidth / 2) : (this.thumb_el.clientX < this.track_el.clientLeft + (this.thumb_el.clientWidth / 2)) ? lastx - (this.thumb_el.clientWidth / 2) : lastx;
                this.lastpos.x = lastx;
                return;
            }
            lastx = this.thumb_el.clientX;
            */
            Object.defineProperty(this.thumb_el, 'clientLeft', { value: lastx - (this.thumb_el.clientWidth / 2), writable: true, configurable: true });
            this.thumb_el.style.setProperty('left', this.thumb_el.clientLeft + 'px');
            /* way 1 */
            this.input_el.value = ((lastx - this.track_el.clientLeft) / this.track_el.clientWidth) * (this.max - this.min) + this.min;
            /* or 
            way 2 */
            //this.input_el.value += (((lastx - this.track_el.clientLeft) / this.track_el.clientWidth) - this.lastpos.x) * (this.max - this.min);
            change(null);
            var new_event = new Event("change", { bubbles: ev.bubbles, composed: ev.composed, cancelable: ev.cancelable });
            //new_event.currentTarget = this.input_el;
            //new_event.target = this.input_el;
            this.input_el.dispatchEvent(new_event);
            new_event = null;
            this.lastpos.x = lastx;
            return;
        });
        this.track_el.addEventListener("mousedown", (ev) => {
            this.onmoving = true;
            var lastx = this.lastpos.x;
            var ev_clientX = ev.clientX;
            if (ev_clientX > this.track_el.clientLeft + this.track_el.clientWidth - (this.thumb_el.clientWidth / 2) || ev_clientX < this.track_el.clientLeft + (this.thumb_el.clientWidth / 2)) {
                lastx = (ev_clientX > this.track_el.clientLeft + this.track_el.clientWidth) ? this.track_el.clientLeft + this.track_el.clientWidth : (ev_clientX < this.track_el.clientLeft + (this.thumb_el.clientWidth / 2)) ? this.track_el.clientLeft : this.lastpos.x;
                //this.thumb_el.clientLeft = (ev_clientX > this.track_el.clientLeft + this.track_el.clientWidth - (this.thumb_el.clientWidth / 2)) ? lastx - (this.thumb_el.clientWidth / 2) : (ev_clientX < this.track_el.clientLeft + (this.thumb_el.clientWidth / 2)) ? lastx - (this.thumb_el.clientWidth / 2) : lastx;
                //Object.defineProperty(this.thumb_el, 'clientLeft', { value: (ev_clientX > this.track_el.clientLeft + this.track_el.clientWidth - (this.thumb_el.clientWidth / 2)) ? lastx - (this.thumb_el.clientWidth / 2) : (ev_clientX < this.track_el.clientLeft + (this.thumb_el.clientWidth / 2)) ? lastx - (this.thumb_el.clientWidth / 2) : lastx, writable: true, configurable: true });
                this.lastpos.x = lastx;
                return;
            }
            lastx = ev_clientX;
            /* this.thumb_el.clientLeft = lastx - (this.thumb_el.clientWidth / 2);
            this.input_el.value = ((lastx - this.track_el.clientLeft) / this.track_el.clientWidth) * (this.max - this.min);
            
            var lastx = this.lastpos.x;
            if (this.thumb_el.clientX > this.track_el.clientLeft + this.track_el.clientWidth - (this.thumb_el.clientWidth / 2) || this.thumb_el.clientX < this.track_el.clientLeft + (this.thumb_el.clientWidth / 2)) {
                lastx = (this.thumb_el.clientX > this.track_el.clientLeft + this.track_el.clientWidth) ? this.track_el.clientLeft + this.track_el.clientWidth : (this.thumb_el.clientX < this.track_el.clientLeft + (this.thumb_el.clientWidth / 2)) ? this.track_el.clientLeft : this.lastpos.x;
                this.thumb_el.clientLeft = (this.thumb_el.clientX > this.track_el.clientLeft + this.track_el.clientWidth - (this.thumb_el.clientWidth / 2)) ? lastx - (this.thumb_el.clientWidth / 2) : (this.thumb_el.clientX < this.track_el.clientLeft + (this.thumb_el.clientWidth / 2)) ? lastx - (this.thumb_el.clientWidth / 2) : lastx;
                this.lastpos.x = lastx;
                return;
            }
            lastx = this.thumb_el.clientX;
            */
            Object.defineProperty(this.thumb_el, 'clientLeft', { value: lastx - (this.thumb_el.clientWidth / 2), writable: true, configurable: true });
            this.thumb_el.style.setProperty('left', this.thumb_el.clientLeft + 'px');
            /* way 1 */
            this.input_el.value = ((lastx - this.track_el.clientLeft) / this.track_el.clientWidth) * (this.max - this.min) + this.min;
            /* or 
            way 2 */
            //this.input_el.value += (((lastx - this.track_el.clientLeft) / this.track_el.clientWidth) - this.lastpos.x) * (this.max - this.min);
            change(null);
            var new_event = new Event("change", { bubbles: ev.bubbles, composed: ev.composed, cancelable: ev.cancelable });
            //new_event.currentTarget = this.input_el;
            //new_event.target = this.input_el;
            this.input_el.dispatchEvent(new_event);
            new_event = null;
            this.lastpos.x = lastx;
            return;
        });
        window.addEventListener("mouseup", (ev) => {
            this.onmoving = false;
        });
        document.body.addEventListener("mouseup", (ev) => {
            this.onmoving = false;
        });
        this.thumb_el.addEventListener("touchmove", (ev) => {
            if (!this.onmoving) {
                return;
            }
            var lastx = this.lastpos.x;
            var ev_clientX = ev.touches[0].clientX;
            if (ev_clientX > this.track_el.clientLeft + this.track_el.clientWidth - (this.thumb_el.clientWidth / 2) || ev_clientX < this.track_el.clientLeft + (this.thumb_el.clientWidth / 2)) {
                lastx = (ev_clientX > this.track_el.clientLeft + this.track_el.clientWidth) ? this.track_el.clientLeft + this.track_el.clientWidth : (ev_clientX < this.track_el.clientLeft + (this.thumb_el.clientWidth / 2)) ? this.track_el.clientLeft : this.lastpos.x;
                //this.thumb_el.clientLeft = (ev_clientX > this.track_el.clientLeft + this.track_el.clientWidth - (this.thumb_el.clientWidth / 2)) ? lastx - (this.thumb_el.clientWidth / 2) : (ev_clientX < this.track_el.clientLeft + (this.thumb_el.clientWidth / 2)) ? lastx - (this.thumb_el.clientWidth / 2) : lastx;
                Object.defineProperty(this.thumb_el, 'clientLeft', { value: (ev_clientX > this.track_el.clientLeft + this.track_el.clientWidth - (this.thumb_el.clientWidth / 2)) ? lastx - (this.thumb_el.clientWidth / 2) : (ev_clientX < this.track_el.clientLeft + (this.thumb_el.clientWidth / 2)) ? lastx - (this.thumb_el.clientWidth / 2) : lastx, writable: true, configurable: true });
                this.thumb_el.style.setProperty('left', this.thumb_el.clientLeft + 'px');
                this.lastpos.x = lastx;
                return;
            }
            lastx = ev_clientX;
            /* this.thumb_el.clientLeft = lastx - (this.thumb_el.clientWidth / 2);
            this.input_el.value = ((lastx - this.track_el.clientLeft) / this.track_el.clientWidth) * (this.max - this.min);
            
            var lastx = this.lastpos.x;
            if (this.thumb_el.clientX > this.track_el.clientLeft + this.track_el.clientWidth - (this.thumb_el.clientWidth / 2) || this.thumb_el.clientX < this.track_el.clientLeft + (this.thumb_el.clientWidth / 2)) {
                lastx = (this.thumb_el.clientX > this.track_el.clientLeft + this.track_el.clientWidth) ? this.track_el.clientLeft + this.track_el.clientWidth : (this.thumb_el.clientX < this.track_el.clientLeft + (this.thumb_el.clientWidth / 2)) ? this.track_el.clientLeft : this.lastpos.x;
                this.thumb_el.clientLeft = (this.thumb_el.clientX > this.track_el.clientLeft + this.track_el.clientWidth - (this.thumb_el.clientWidth / 2)) ? lastx - (this.thumb_el.clientWidth / 2) : (this.thumb_el.clientX < this.track_el.clientLeft + (this.thumb_el.clientWidth / 2)) ? lastx - (this.thumb_el.clientWidth / 2) : lastx;
                this.lastpos.x = lastx;
                return;
            }
            lastx = this.thumb_el.clientX;
            */
            //this.thumb_el.clientLeft = lastx - (this.thumb_el.clientWidth / 2);
            Object.defineProperty(this.thumb_el, 'clientLeft', { value: lastx - (this.thumb_el.clientWidth / 2), writable: true, configurable: true });
            this.thumb_el.style.setProperty('left', this.thumb_el.clientLeft + 'px');
            /* way 1 */
            this.input_el.value = ((lastx - this.track_el.clientLeft) / this.track_el.clientWidth) * (this.max - this.min) + this.min;
            /* or 
            way 2 */
            //this.input_el.value += (((lastx - this.track_el.clientLeft) / this.track_el.clientWidth) - this.lastpos.x) * (this.max - this.min);
            change(null);
            var new_event = new Event("change", { bubbles: ev.bubbles, composed: ev.composed, cancelable: ev.cancelable });
            //new_event.currentTarget = this.input_el;
            //new_event.target = this.input_el;
            this.input_el.dispatchEvent(new_event);
            new_event = null;
            this.lastpos.x = lastx;
            return;
        });
        this.range_el.addEventListener("mousemove", (ev) => {
            if (!this.onmoving) {
                return;
            } else {
                this.onmoving = true;
            }
            var lastx = this.lastpos.x;
            var ev_clientX = ev.clientX;
            if (ev_clientX > this.track_el.clientLeft + this.track_el.clientWidth - (this.thumb_el.clientWidth / 2) || ev_clientX < this.track_el.clientLeft + (this.thumb_el.clientWidth / 2)) {
                console.log(ev_clientX < this.track_el.clientLeft + (this.thumb_el.clientWidth / 2));
                lastx = (ev_clientX > this.track_el.clientLeft + this.track_el.clientWidth) ? this.track_el.clientLeft + this.track_el.clientWidth : (ev_clientX < this.track_el.clientLeft + (this.thumb_el.clientWidth / 2)) ? this.track_el.clientLeft : this.lastpos.x;
                //this.thumb_el.clientLeft = (ev_clientX > this.track_el.clientLeft + this.track_el.clientWidth - (this.thumb_el.clientWidth / 2)) ? lastx - (this.thumb_el.clientWidth / 2) : (ev_clientX < this.track_el.clientLeft + (this.thumb_el.clientWidth / 2)) ? lastx - (this.thumb_el.clientWidth / 2) : lastx;
                Object.defineProperty(this.thumb_el, 'clientLeft', { value: (ev_clientX > this.track_el.clientLeft + this.track_el.clientWidth - (this.thumb_el.clientWidth / 2)) ? lastx - (this.thumb_el.clientWidth / 2) : (ev_clientX < this.track_el.clientLeft + (this.thumb_el.clientWidth / 2)) ? lastx - (this.thumb_el.clientWidth / 2) : lastx, writable: true, configurable: true });
                this.thumb_el.style.setProperty('left', this.thumb_el.clientLeft + 'px');
                this.lastpos.x = lastx;
                return;
            }
            lastx = ev_clientX;
            /* this.thumb_el.clientLeft = lastx - (this.thumb_el.clientWidth / 2);
            this.input_el.value = ((lastx - this.track_el.clientLeft) / this.track_el.clientWidth) * (this.max - this.min);
            
            var lastx = this.lastpos.x;
            if (this.thumb_el.clientX > this.track_el.clientLeft + this.track_el.clientWidth - (this.thumb_el.clientWidth / 2) || this.thumb_el.clientX < this.track_el.clientLeft + (this.thumb_el.clientWidth / 2)) {
                lastx = (this.thumb_el.clientX > this.track_el.clientLeft + this.track_el.clientWidth) ? this.track_el.clientLeft + this.track_el.clientWidth : (this.thumb_el.clientX < this.track_el.clientLeft + (this.thumb_el.clientWidth / 2)) ? this.track_el.clientLeft : this.lastpos.x;
                this.thumb_el.clientLeft = (this.thumb_el.clientX > this.track_el.clientLeft + this.track_el.clientWidth - (this.thumb_el.clientWidth / 2)) ? lastx - (this.thumb_el.clientWidth / 2) : (this.thumb_el.clientX < this.track_el.clientLeft + (this.thumb_el.clientWidth / 2)) ? lastx - (this.thumb_el.clientWidth / 2) : lastx;
                this.lastpos.x = lastx;
                return;
            }
            lastx = this.thumb_el.clientX;
            */
            //this.thumb_el.clientLeft = lastx - (this.thumb_el.clientWidth / 2);
            Object.defineProperty(this.thumb_el, 'clientLeft', { value: lastx - (this.thumb_el.clientWidth / 2), writable: true, configurable: true });
            console.log(this.thumb_el.clientLeft + 'px');
            this.thumb_el.style.setProperty('left', (lastx - (this.thumb_el.clientWidth / 2)) + 'px');
            /* way 1 */
            this.input_el.value = ((lastx - this.track_el.clientLeft) / this.track_el.clientWidth) * (this.max - this.min) + this.min;
            /* or 
            way 2 */
            //this.input_el.value += (((lastx - this.track_el.clientLeft) / this.track_el.clientWidth) - this.lastpos.x) * (this.max - this.min);
            change(null);
            var new_event = new Event("change", { bubbles: ev.bubbles, composed: ev.composed, cancelable: ev.cancelable });
            //new_event.currentTarget = this.input_el;
            //new_event.target = this.input_el;
            this.input_el.dispatchEvent(new_event);
            new_event = null;
            this.lastpos.x = lastx;
            return;
        });
    }
}
customElements.define("custom-input-range", HTMLCustomInputRangeElement);