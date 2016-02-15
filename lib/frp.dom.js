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

DOM.create = function (tagname, text) {
    var elem = document.createElement(tagname);
    if (text) elem.textContent = text;
    return elem;
};

DOM.on = function (element, name, useCapture) {
    return function (next) {
        element.addEventListener(name, next, !!useCapture);
    };
};

DOM.onClick = function (element, useCapture) {
    return DOM.on(element, 'click', !!useCapture);
};

DOM.onChange = function (element, useCapture) {
    return DOM.on(element, 'change', !!useCapture);
};

DOM.onSubmit = function (element, useCapture) {
    return DOM.on(element, 'submit', !!useCapture);
};

exports.default = DOM;