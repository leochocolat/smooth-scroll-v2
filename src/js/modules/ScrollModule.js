import bindAll from '../utils/bindAll';
import transform from '../utils/transform';

import ScrollManager from '../managers/ScrollManager';
import ScrollTriggerManager from '../managers/ScrollTriggerManager';
import ResizeManager from '../managers/ResizeManager';

import { TweenLite } from 'gsap';

const HEIGHT_CHECK_INTERVAL = 2000;

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
        this.className = options.className;

        this._scroll = {};
        this._previousScroll = {};

        this.ui = {
            scrollTo: document.querySelectorAll('[data-scroll-to]')
        }

        setInterval(() => {
            this._allowContentHeightCheck = true;
        }, HEIGHT_CHECK_INTERVAL);

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
        ScrollManager.start();

        if (this.smooth) {
            ScrollManager.enableSmoothScroll();
            ScrollManager.setSmoothValue(this.smoothValue);
        }
        
        this._setupEventListeners();
        this._setupScrollTo();
        this._setStyleProps();
        this._resize();
        
        ScrollTriggerManager.start({
            el: this.container,
            className: this.className ? this.className : 'is-in-view'
        });
    }

    _setupScrollTo() {
        for (let i = 0; i < this.ui.scrollTo.length; i++) {
            this.ui.scrollTo[i].addEventListener('click', () => {
                const target = this.ui.scrollTo[i].dataset.scrollTo;
                const offset = this.ui.scrollTo[i].dataset.scrollToOffset;
                ScrollManager.scrollTo(target, offset);
            });
        }
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
        const y = - position.y;
        const x = - position.x;

        transform(this.content, { x: x, y: y });
        // TweenLite.set(this.content, { y: y, force3D: true });
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