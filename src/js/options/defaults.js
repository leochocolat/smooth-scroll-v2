const defaults = {
    container: document.querySelector('[data-scroll-container]'),
    content: document.querySelector('[data-scroll-content]'),
    class: 'is-in-view',
    smoothClass: 'has-smooth-scroll',
    scrollEnableClass: 'is-scroll-enable',
    smooth: false,
    smoothValue: 0.15,
    throttleValue: 300
}

export default defaults;