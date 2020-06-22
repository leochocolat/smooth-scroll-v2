import EventDispatcher from '../events/EventDispatcher';
import ScrollManager from './ScrollManager';
import ResizeManager from './ResizeManager';

import bindAll from '../utils/bindAll';
import lerp from '../utils/lerp';
import transform from '../utils/transform';
import DeviceUtils from '../utils/DeviceUtils';

//TODO : 
//ADD STICKY OPTION

class ScrollTriggerManager extends EventDispatcher {
    constructor(options) {
        super(options);

        bindAll(
            this,
            '_scrollHandler',
            '_resizeEndHandler'
        );

        this.sections = [];
        this.triggers = [];
    }
    
    /**
     * Public
     */
    start(options) {
        this.el = options.el;
        this.className = options.className;
        this.smooth = options.smooth;

        this._resize();
        this._setupSections();
        this._setupTriggers();
        this._setupEventListeners();
    }

    setContentHeight(height) {
        this._contentHeight = height;
        this._updateElements();
        this._detectElements();
    }

    removeEventListeners() {
        ScrollManager.removeEventListeners('scroll', this._scrollHandler);
        ScrollManager.removeEventListeners('scroll:end', this._scrollEndHandler);
        ResizeManager.removeEventListeners('resize:end', this._resizeEndHandler);
    }

    /**
    * Private
    */
    _setupSections() {
        const sections = this.el.querySelectorAll('[data-scroll-section]');

        for (let i = 0; i < sections.length; i++) {
            const element = sections[i];

            let top = element.getBoundingClientRect().top + ScrollManager.getPosition().y;
            let bottom = top + element.offsetHeight;

            const section = {
                el: element,
                top: top,
                bottom: bottom,
                inView: false
            }

            this.sections.push(section);
        }
    }

    _detectSections() {
        const scrollTop = ScrollManager.getPosition().y;
        const scrollBottom = scrollTop + this._windowHeight;

        for (let i = 0; i < this.sections.length; i++) {
            const element = this.sections[i];

            if (!element.inView) {
                if ((scrollBottom >= element.top) && (scrollTop < element.bottom)) {
                    //set in view
                    element.inView = true;
                    element.el.style.visibility = 'visible';
                    element.el.style.pointerEvents = 'all';
                    element.el.style.opacity = 1;
                }
            }

            if (element.inView) {
                if ((scrollBottom < element.top) || (scrollTop > element.bottom)) {
                    //set out of view
                    element.inView = false;
                    element.el.style.visibility = 'hidden';
                    element.el.style.pointerEvents = 'none';
                    element.el.style.opacity = 0;
                }
            }
        }
    }

    _setupTriggers() {
        const elements = this.el.querySelectorAll('[data-scroll]');

        for (let i = 0; i < elements.length; i++) {
            const element = elements[i];
            let top = element.getBoundingClientRect().top + ScrollManager.getPosition().y;
            const offset = element.dataset.scrollOffset ? parseInt(element.dataset.scrollOffset) : 0;
            const offsetScreen = (element.dataset.scrollOffsetScreen ? parseFloat(element.dataset.scrollOffsetScreen) : 0) * this._windowHeight;
            let bottom = top + element.offsetHeight;
            const repeat = element.dataset.scrollRepeat;
            const call = element.dataset.scrollCall;
            const speed = element.dataset.scrollSpeed ? parseFloat(element.dataset.scrollSpeed) : undefined;
            const forceParallax = element.dataset.scrollForceParallax;
            const delay = element.dataset.scrollDelay ? parseFloat(element.dataset.scrollDelay) : undefined;
            const direction = element.dataset.scrollDirection || 'vertical';
            const target = element.dataset.scrollTarget;
            const position = element.dataset.scrollPosition;


            let targetEl;
            if (target) {
                targetEl = document.querySelector(`${target}`);
                if (targetEl) {
                    top = targetEl.getBoundingClientRect().top + ScrollManager.getPosition().y;
                    bottom = top + element.offsetHeight;
                }
            } else {
                targetEl = element;
            }

            const trigger = {
                el: element,
                top: top + (offset + offsetScreen),
                bottom: bottom - (offset + offsetScreen),
                offset: offset + offsetScreen,
                repeat: repeat,
                call: call,
                speed: speed,
                forceParallax: forceParallax,
                delay: delay,
                direction: direction,
                target: targetEl,
                position: position,
                inView: false
            }

            this.triggers.push(trigger);
        }
    }

    _detectElements() {
        const scrollTop = ScrollManager.getPosition().y;
        const scrollBottom = scrollTop + this._windowHeight;

        for (let i = 0; i < this.triggers.length; i++) {
            const element = this.triggers[i];

            if (!element.inView) {
                if ((scrollBottom >= element.top) && (scrollTop < element.bottom)) {
                    this._setInView(element);
                }
            }

            if (element.inView) {
                if ((scrollBottom < element.top) || (scrollTop > element.bottom)) {
                    this._setOutOfView(element);
                }
            }
            
            if (element.speed) {
                if ((!this.smooth || DeviceUtils.isTouch()) && !element.forceParallax) continue;
                this._transformElement(element);
            }
        }
    }

    _transformElement(element) {
        if (!element.inView) return;

        const scrollTop = ScrollManager.getPosition().y;
        const scrollMiddle = scrollTop + this._windowMiddle;
        const scrollBottom = scrollTop + this._windowHeight;
        const middle = element.top + (element.bottom - element.top);

        let transformDistance;

        switch (element.position) {
            case 'top':
                transformDistance = scrollTop * - element.speed;
            break;

            case 'elementTop':
                transformDistance = (scrollBottom - element.top) * - element.speed;
            break;

            case 'bottom':
                transformDistance = (this._contentHeight - scrollBottom + this._windowHeight) * element.speed;
            break;

            default:
                transformDistance = (scrollMiddle - middle) * - element.speed;
            break;
        }


        if (element.delay) {
            let start = this._getTransform(element.el);
            const lerpY = lerp(start.y, transformDistance, element.delay).toFixed(2);

            if (element.direction === 'horizontal') {
                transform(element.el, { x: lerpY, y: 0 });
            } else {
                transform(element.el, { x: 0, y: lerpY });
            }
        } else {
            if (element.direction === 'horizontal') {
                transform(element.el, { x: transformDistance, y: 0 });
            } else {
                transform(element.el, { x: 0, y: transformDistance });
            }
        }
    }

    _setInView(trigger) {
        trigger.inView = true;
        trigger.el.classList.add(this.className);

        if (trigger.call) {
            this._dispatchCallEvent(trigger, 'enter');

            if (trigger.repeat === undefined) {
                trigger.call = false;
            }
        }
    }

    _setOutOfView(trigger) {
        trigger.inView = false;

        if (trigger.call) {
            this._dispatchCallEvent(trigger, 'exit');
        }
        
        if (trigger.repeat) {
            trigger.el.classList.remove(this.className);
        }
    }

    _dispatchCallEvent(trigger, state) {
        const payload = {
            name: trigger.call,
            el: trigger.el,
            state: state
        }

        this.dispatchEvent('call', payload);
    }

    _resize() {
        this._windowHeight = window.innerHeight;
        this._windowMiddle = this._windowHeight / 2;
    }

    _updateElements() {
        for (let i = 0; i < this.triggers.length; i++) {
            const trigger = this.triggers[i];
            const top = trigger.target.getBoundingClientRect().top + ScrollManager.getPosition().y + trigger.offset;
            const bottom = top + trigger.target.offsetHeight - trigger.offset;

            trigger.top = top;
            trigger.bottom = bottom;
        }
    }

    _getTransform(el) {
        const translate = {};
        if(!window.getComputedStyle) return;
    
        const style = getComputedStyle(el);
        const transform = style.transform || style.webkitTransform || style.mozTransform;
    
        let mat = transform.match(/^matrix3d\((.+)\)$/);
        if(mat) return parseFloat(mat[1].split(', ')[13]);
    
        mat = transform.match(/^matrix\((.+)\)$/);
        translate.x = mat ? parseFloat(mat[1].split(', ')[4]) : 0;
        translate.y = mat ? parseFloat(mat[1].split(', ')[5]) : 0;
    
        return translate;
    }

    _setupEventListeners() {
        ScrollManager.addEventListener('scroll', this._scrollHandler);
        ScrollManager.addEventListener('scroll:end', this._scrollEndHandler);

        ResizeManager.addEventListener('resize:end', this._resizeEndHandler);
    }

    _scrollHandler() {
        this._detectSections();
        this._detectElements();
    }

    _scrollEndHandler() {
        //nothing
    }

    _resizeEndHandler() {
        this._resize()
        this._updateElements();
    }
}

export default new ScrollTriggerManager();