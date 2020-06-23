import ComponentFactory from './ComponentFactory';
import ScrollModule from './modules/ScrollModule';
import { gsap } from 'gsap';
import bindAll from './utils/bindAll';

class App {
    constructor() {
        bindAll(this, '_update');

        this._setup();
    }

    _setup() {
        this._setupSmoothScroll();
        gsap.ticker.add(this._update);
    }

    _setupSmoothScroll() {
        this._scrollModule = new ScrollModule({
            container: document.querySelector('.js-scroll-container'),
            content: document.querySelector('.js-scroll-content'),
            smooth: true,
            smoothValue: 0.15,
        });
    }

    start() {
        ComponentFactory.start();
    }

    _update() {
        ComponentFactory.update();
        this._scrollModule.update();
    }
}

export default App;