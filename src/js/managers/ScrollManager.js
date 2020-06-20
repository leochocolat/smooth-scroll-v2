import EventDispatcher from '../events/EventDispatcher';

import bindAll from '../utils/bindAll';
import DeviceUtils from '../utils/DeviceUtils';
import lerp from '../utils/lerp';
import TweenLite from 'gsap';

const SMOOTH = 0.15;
const THROTTLE_VALUE = 300;

class ScrollManager extends EventDispatcher {
    constructor(options = {}) {
        super(options);

        bindAll(
            this,
            '_scrollHandler',
            '_tickHandler',
            '_scrollEndHandler'
        );

        this._scrollPosition = { x: 0, y: 0 };
        this._smoothScrollPosition = { x: 0, y: 0 };
        this._isSmoothScrollEnabled = false;
        this._smoothScrollLerpFactor = SMOOTH;
        this._scrollDelta = 0;

        this._setup();
    }

    _setup() {
        this._updateValues();
        this._setupEventListeners();
    }

    /**
    * Public
    */
    enable() {
        if (document.body.classList.contains('isScrollEnable')) return;
        document.body.classList.add('isScrollEnable');
    }

    disable() {
        document.body.classList.remove('isScrollEnable');
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
        TweenLite.ticker.removeEventListener('tick', this._tickHandler);
    }

    setSmoothValue(value) {
        this._smoothScrollLerpFactor = value || SMOOTH;
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

        TweenLite.ticker.addEventListener('tick', this._tickHandler);
    }

    _tick() {
        const x = lerp(this._smoothScrollPosition.x, this._scrollPosition.x, this._smoothScrollLerpFactor);
        const y = lerp(this._smoothScrollPosition.y, this._scrollPosition.y, this._smoothScrollLerpFactor);

        this._smoothScrollPosition.x = Math.round(x * 100) / 100;
        this._smoothScrollPosition.y = Math.round(y * 100) / 100;

        this._smoothDeltaY = this._previousSmoothScrollPositionY - this._smoothScrollPosition.y;

        if (this._smoothDeltaY !== 0) {
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
            this._scrollTimeout = setTimeout(this._scrollEndHandler, THROTTLE_VALUE);
        }
    }

    _smoothScrollHandler() {
        this.dispatchEvent('scroll', {
            target: this, 
            x: this._smoothScrollPosition.x, 
            y: this._smoothScrollPosition.y, 
            delta: this._smoothDeltaY, 
            direction: this._smoothDeltaY > 0 ? 'up' : 'down'  
        });

        clearTimeout(this._smoothScrollTimeout);
        this._smoothScrollTimeout = setTimeout(this._scrollEndHandler, THROTTLE_VALUE);
    }

    _scrollEndHandler() {
        this.dispatchEvent('scroll:end', { target: this, x: this._scrollPosition.x, y: this._scrollPosition.y });
    }

    _tickHandler() {
        this._tick();
    }
}

export default new ScrollManager();