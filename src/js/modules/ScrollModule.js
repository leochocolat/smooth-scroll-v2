import bindAll from '../utils/bindAll';

import ScrollManager from '../managers/ScrollManager';
import ScrollTriggerManager from '../managers/ScrollTriggerManager';
import ResizeManager from '../managers/ResizeManager';

import { TweenLite, Power2, Power3, TimelineLite } from 'gsap';

class ScrollModule {
    constructor(options) {
        bindAll(
            this,
            '_scrollHandler',
            '_readyStateChangeHandler',
            '_resizeHandler',
            '_resizeEndHandler',
            '_callHandler'
        );

        this.container = options.container;
        this.content = options.content;
        this.smooth = options.smooth;
        this.smoothValue = options.smoothValue;

        this._scroll = {};
        this._previousScroll = {};
        this._offsetY = 0;

        setInterval(() => {
            this._allowContentHeightCheck = true;
        }, 2000);

        this._setup();
    }

    /**
    * Public
    */
    enable() {
        this._setupEventListeners();
        this._setStyleProps();
    }

    disable() {
        this._removeEventListeners();
        this._removeStyleProps();
    }

    /**
    * Private
    */
    _setup() {
        if (this.smooth) {
            ScrollManager.enableSmoothScroll();
            ScrollManager.setSmoothValue(this.smoothValue);
        }
        
        this._setupEventListeners();
        this._setStyleProps();
        this._resize();
        ScrollTriggerManager.start({ el: this.container });
    }

    _setStyleProps() {
        document.querySelector('html').classList.add('hasSmoothScroll');
        
        this.content.style.willChange = 'transform';
        this.content.style.position = 'fixed';
    }

    _removeStyleProps() {
        //TODO
    }

    _resize() {
        this._contentHeight = this.content.clientHeight;
        this.container.style.height =  `${this._contentHeight}px`;
        ScrollTriggerManager.setContentHeight(this._contentHeight);

        this._setOffset();
    }

    _setOffset() {
        const position = ScrollManager.getPosition();
        const y = this._offsetY + - position.y;

        TweenLite.set(this.content, { y: y });
    }

    _checkContentHeight() {
        const contentHeight = this.content.clientHeight;

        if (this._contentHeight != contentHeight) {
            this._resize();
        };
    }

    update() {
        if (this._allowContentHeightCheck) {
            this._allowContentHeightCheck = false;
            this._checkContentHeight();
        }
    }

    _setupEventListeners() {
        ScrollManager.addEventListener('scroll', this._scrollHandler);
        ScrollManager.addEventListener('scroll:end', this._scrollEndHandler);

        ScrollTriggerManager.addEventListener('call', this._callHandler);

        document.addEventListener('readystatechange', this._readyStateChangeHandler);
        ResizeManager.addEventListener('resize', this._resizeHandler);
        ResizeManager.addEventListener('resize:end', this._resizeEndHandler);
    }

    _removeEventListeners() {
        ScrollManager.removeEventListener('scroll', this._scrollHandler);
        ScrollManager.removeEventListener('scroll:end', this._scrollEndHandler);

        ScrollTriggerManager.removeEventListener('call', this._callHandler);
        ScrollTriggerManager.removeEventListeners();

        document.removeEventListener('readystatechange', this._readyStateChangeHandler);
        ResizeManager.removeEventListener('resize', this._resizeHandler);
        ResizeManager.removeEventListener('resize:end', this._resizeEndHandler);
    }

    _scrollHandler(e) {
        this._setOffset();
    }

    _scrollEndHandler(e) {
        this._setOffset();
    }

    _callHandler(e) {
        //EXAMPLE
        console.log('call', e);

        if (e.name === "stairs") {
            let tl = new TimelineLite();
            tl.staggerFromTo(e.el.querySelectorAll('span'), 1, { y: '100%' }, { y: '0%' }, 0.1);
        }

    }

    _readyStateChangeHandler() {
        this._resize();
    }

    _resizeHandler() {
        //nothing
    }

    _resizeEndHandler() {
        this._resize();
    }
}

export default ScrollModule;