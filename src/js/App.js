import ComponentFactory from './ComponentFactory';
import ScrollModule from './modules/ScrollModule';

class App {
    constructor() {
        this._setup();
    }

    _setup() {
        this._setupSmoothScroll();
        this._update();
    }

    _setupSmoothScroll() {
        this._smoothScrollModule = new ScrollModule({
            container: document.querySelector('.js-scroll-container'),
            content: document.querySelector('.js-scroll-content'),
            smooth: true,
            smoothValue: 0.15
        });
    }

    start() {
        ComponentFactory.start();
    }

    _update() {
        ComponentFactory.update();
        this._smoothScrollModule.update();

        requestAnimationFrame(this._update.bind(this));
    }
}

export default App;