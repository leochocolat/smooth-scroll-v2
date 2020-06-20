class BrowserUtils {
    isEdge() {
        return /Edge/.test(this._getUA());
    }

    isFirefox() {
        return /Mozilla/.test(this._getUA()) || /Firefox/.test(this._getUA());
    }

    _getUA() {
        return navigator.userAgent
    }
}

export default new BrowserUtils();
