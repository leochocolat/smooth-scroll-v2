import EventDispatcher from '../events/EventDispatcher';

import bindAll from '../utils/bindAll';
import DeviceUtils from '../utils/DeviceUtils';
import lerp from '../utils/lerp';
import { gsap } from 'gsap';

import defaults from '../options/defaults';


class ScrollManager extends EventDispatcher {
    constructor(options = {}) {
        super(options);

        bindAll(
            this,
            '_scrollHandler',
            '_tickHandler',
            '_scrollEndHandler'
        );

        this.options = defaults;

        this._scrollPosition = { x: 0, y: 0 };
        this._smoothScrollPosition = { x: 0, y: 0 };
        this._isSmoothScrollEnabled = false;
        this._scrollDelta = 0;

        this._smoothScrollLerpFactor = this.options.smoothValue;

        this._setup();
    }

    _setup() {
        //nothing
    }

    /**
    * Public
    */
    start(options) {
        this.options = options;

        this._smoothScrollLerpFactor = this.options.smoothValue;

        if(this.options.smooth) {
            this.enableSmoothScroll();
        }

        this._updateValues();
        this._setupEventListeners();
    }

    enable() {
        if (document.body.classList.contains(this.options.scrollEnableClass)) return;
        document.body.classList.add(this.options.scrollEnableClass);
    }

    disable() {
        document.body.classList.remove(this.options.scrollEnableClass);
    }

    enableSmoothScroll() {
        if (DeviceUtils.isTouch()) return;

        if (!this._isSmoothScrollEnabled) {
            this._isSmoothScrollEnabled = true;
            this._setupSmoothScroll();
        }
    }

    disableSmoothScroll() {
        this._isSmoothScrollEnabled = false;
        gsap.ticker.remove(this._tickHandler);
    }

    setSmoothValue(value) {
        this._smoothScrollLerpFactor = value;
    }

    getDelta() {
        return this._scrollDelta;
    }

    getPosition() {
        return this._isSmoothScrollEnabled ? this._smoothScrollPosition : this._scrollPosition;
    }

    getScrollHeight() {
        return this._scrollheight;
    }

    //todo make it work on safari
    scrollTo(target, offset) {
        const offsetValue = offset || 0;
        let scrollDestination;

        switch (typeof target) {
            case 'string':
                const el = document.querySelector(`${target}`);
                if (el) {
                    scrollDestination = el.getBoundingClientRect().top + this.getPosition().y + offsetValue;
                }
            break;

            case 'number':
                scrollDestination = target + this.getPosition().y + offsetValue;
            break;

            case 'object':
                if (target.tagName) {
                    scrollDestination = target.getBoundingClientRect().top + this.getPosition().y + offsetValue;
                }
            break;

            default:
                console.error('ScrollTo Target is not valid, it has to be either a selector, an absolute position or a node element');
            break;
        }

        window.scrollTo({
            top: scrollDestination,
            behavior: 'smooth'
        });
    }

    scrollToTop(offset) {
        const offsetValue = offset || 0;
        window.scrollTo({
            top: offsetValue,
            behavior: 'smooth'
        });
    }

    scrollToBottom(offset) {
        const offsetValue = offset || 0;
        window.scrollTo({
            top: this._scrollheight + offsetValue,
            behavior: 'smooth'
        });
    }

    /**
    * Private
    */
    _updateValues() {
        this._updateScrollHeight();

        const scrollPosition = {
            x: document.body.scrollLeft || document.documentElement.scrollLeft,
            y: document.body.scrollTop || document.documentElement.scrollTop
        }

        this._deltaY = this._scrollPosition.y - scrollPosition.y;

        this._scrollPosition = {
            x: scrollPosition.x,
            y: scrollPosition.y
        };
    }

    _updateScrollHeight() {
        this._scrollheight = document.body.scrollHeight || document.documentElement.scrollHeight;
    }

    _setupSmoothScroll() {
        this._previousSmoothScrollPositionX = null;
        this._previousSmoothScrollPositionY = null;

        this._smoothScrollPosition.x = this._scrollPosition.x;
        this._smoothScrollPosition.y = this._scrollPosition.y;

        gsap.ticker.add(this._tickHandler);
    }

    _tick() {
        const x = lerp(this._smoothScrollPosition.x, this._scrollPosition.x, this._smoothScrollLerpFactor);
        const y = lerp(this._smoothScrollPosition.y, this._scrollPosition.y, this._smoothScrollLerpFactor);

        this._smoothScrollPosition.x = Math.round(x * 100) / 100;
        this._smoothScrollPosition.y = Math.round(y * 100) / 100;

        this._smoothDeltaY = this._previousSmoothScrollPositionX - this._smoothScrollPosition.x;
        this._smoothDeltaY = this._previousSmoothScrollPositionY - this._smoothScrollPosition.y;

        if (this._smoothDeltaY !== 0 || this._smoothDeltaX !== 0) {
            this._smoothScrollHandler();
        }

        this._previousSmoothScrollPositionX = this._smoothScrollPosition.x;
        this._previousSmoothScrollPositionY = this._smoothScrollPosition.y;
    }

    _setupEventListeners() {
        window.addEventListener('scroll', this._scrollHandler);
    }

    /**
     * Handler
     */
    _scrollHandler() {
        this._updateValues();

        if (!this._isSmoothScrollEnabled) {
            this.dispatchEvent('scroll', { 
                target: this, 
                x: this._scrollPosition.x, 
                y: this._scrollPosition.y,
                delta: this._deltaY,
                direction: this._deltaY > 0 ? 'up' : 'down'
            });

            clearTimeout(this._scrollTimeout);
            this._scrollTimeout = setTimeout(this._scrollEndHandler, this.options.throttleValue);
        }
    }

    _smoothScrollHandler() {
        this.dispatchEvent('scroll', {
            target: this, 
            x: this._smoothScrollPosition.x, 
            y: this._smoothScrollPosition.y, 
            delta: { x: this._smoothDeltaX, y: this._smoothDeltaY }, 
            direction: {
                x: this._smoothDeltaX > 0 ? 'left' : 'right',
                y: this._smoothDeltaY > 0 ? 'up' : 'down'
            }
        });

        clearTimeout(this._smoothScrollTimeout);
        this._smoothScrollTimeout = setTimeout(this._scrollEndHandler, this.options.throttleValue);
    }

    _scrollEndHandler() {
        this.dispatchEvent('scroll:end', { target: this, x: this._scrollPosition.x, y: this._scrollPosition.y });
    }

    _tickHandler() {
        this._tick();
    }
}

export default new ScrollManager();