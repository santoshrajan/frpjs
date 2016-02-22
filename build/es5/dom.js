'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
// DOM functions

var DOM = {};

DOM.select = function (selector) {
    return document.querySelector(selector);
};

DOM.selectAll = function (selector) {
    return document.querySelectorAll(selector);
};

DOM.createElement = function (tagname, text) {
    var elem = document.createElement(tagname);
    if (text) elem.textContent = text;
    return elem;
};

DOM.createEventStream = function (selector, name, useCapture) {
    return function (next) {
        var element = DOM.select(selector);
        element.addEventListener(name, next, !!useCapture);
    };
};

DOM.onClick = function (selector, useCapture) {
    return DOM.createEventStream(selector, 'click', !!useCapture);
};

DOM.onChange = function (selector, useCapture) {
    return DOM.createEventStream(selector, 'change', !!useCapture);
};

DOM.onSubmit = function (selector, useCapture) {
    return DOM.createEventStream(selector, 'submit', !!useCapture);
};

DOM.onTouchStart = function (selector, useCapture) {
    return DOM.createEventStream(selector, 'touchstart', !!useCapture);
};

DOM.onTouchMove = function (selector, useCapture) {
    return DOM.createEventStream(selector, 'touchmove', !!useCapture);
};

DOM.onTouchEnd = function (selector, useCapture) {
    return DOM.createEventStream(selector, 'touchend', !!useCapture);
};

exports.default = DOM;