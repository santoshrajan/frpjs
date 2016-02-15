// DOM functions

const DOM = {}

DOM.select = function(selector) {
    return document.querySelector(selector)
}

DOM.selectAll = function(selector) {
    return document.querySelectorAll(selector)
}

DOM.create = function(tagname, text) {
    let elem = document.createElement(tagname)
    if (text) elem.textContent = text
    return elem
}

DOM.on = function(element, name, useCapture) {
    return function(next) {
        element.addEventListener(name, next, !!useCapture)
    }
}

DOM.onClick = function(element, useCapture) {
    return DOM.on(element, 'click', !!useCapture)
}

DOM.onChange = function(element, useCapture) {
    return DOM.on(element, 'change', !!useCapture)
}

DOM.onSubmit = function(element, useCapture) {
    return DOM.on(element, 'submit', !!useCapture)
}

DOM.touchStart = function(element, useCapture) {
    return DOM.on(element, 'touchstart', !!useCapture)
}

DOM.touchMove = function(element, useCature) {
    return DOM.on(element, 'touchmove', !!useCapture)
}

DOM.touchEnd = function(element, useCapture) {
    return DOM.on(element, 'touchend', !!useCapture)
}

export default DOM