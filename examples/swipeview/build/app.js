(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
// Core FRP functions

var FRP = {};

FRP.map = function (valueTransform) {
    return function (eventStream) {
        return function (next) {
            eventStream(function (value) {
                next(valueTransform(value));
            });
        };
    };
};

FRP.bind = function (valueToEvent) {
    return function (eventStream) {
        return function (next) {
            eventStream(function (value) {
                valueToEvent(value)(next);
            });
        };
    };
};

FRP.filter = function (predicate) {
    return function (eventStream) {
        return function (next) {
            eventStream(function (value) {
                if (predicate(value)) next(value);
            });
        };
    };
};

FRP.reject = function (predicate) {
    return function (eventStream) {
        return function (next) {
            eventStream(function (value) {
                if (!predicate(value)) next(value);
            });
        };
    };
};

FRP.fold = function (step, initial) {
    return function (eventStream) {
        return function (next) {
            var accumulated = initial;
            eventStream(function (value) {
                next(accumulated = step(accumulated, value));
            });
        };
    };
};

FRP.merge = function (eventStreamA) {
    return function (eventStreamB) {
        return function (next) {
            eventStreamA(function (value) {
                return next(value);
            });
            eventStreamB(function (value) {
                return next(value);
            });
        };
    };
};

FRP.compose = function (eventStream) {
    for (var _len = arguments.length, operations = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        operations[_key - 1] = arguments[_key];
    }

    if (operations.length == 0) return eventStream;

    var operation = operations.shift();
    return FRP.compose.apply(FRP, [operation(eventStream)].concat(operations));
};

FRP.stepper = function (eventStream, initial) {
    var valueAtLastStep = initial;

    eventStream(function nextStep(value) {
        valueAtLastStep = value;
    });

    return function behaveAtLastStep() {
        return valueAtLastStep;
    };
};

FRP.throttle = function (eventStream, ms) {
    return function (next) {
        var last = 0;
        eventStream(function (value) {
            var now = performance.now();
            if (last == 0 || now - last > ms) {
                next(value);
                last = now;
            }
        });
    };
};

exports.default = FRP;

},{}],2:[function(require,module,exports){
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

DOM.touchStart = function (element, useCapture) {
    return DOM.on(element, 'touchstart', !!useCapture);
};

DOM.touchMove = function (element, useCapture) {
    return DOM.on(element, 'touchmove', !!useCapture);
};

DOM.touchEnd = function (element, useCapture) {
    return DOM.on(element, 'touchend', !!useCapture);
};

exports.default = DOM;

},{}],3:[function(require,module,exports){
"use strict";

var _swipeview = require("./swipeview");

var _swipeview2 = _interopRequireDefault(_swipeview);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var container = document.getElementById("container");
(0, _swipeview2.default)(container);

},{"./swipeview":4}],4:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function (container, slideWidth, slideHeight) {
    var stream$ = _frpjs2.default.compose(_dom2.default.touchStart(container), _frpjs2.default.merge(_dom2.default.touchMove(container)), _frpjs2.default.merge(_dom2.default.touchEnd(container)), _frpjs2.default.map(function (event) {
        return {
            type: event.type,
            pageX: getPageX(event),
            time: event.timeStamp
        };
    }), _frpjs2.default.fold(function (prev, curr) {
        curr.startX = curr.type == "touchstart" ? curr.pageX : prev.startX;
        curr.startTime = curr.type == "touchstart" ? curr.time : prev.startTime;
        curr.displacement = curr.pageX - curr.startX;
        curr.slideIndex = prev.slideIndex;

        return curr;
    }, { slideIndex: 0 }));

    var view = new SwipeView(container, slideWidth, slideHeight);
    stream$(function (event) {
        return activateEventStream(event, view);
    });
};

var _frpjs = require("frpjs");

var _frpjs2 = _interopRequireDefault(_frpjs);

var _dom = require("frpjs/dom");

var _dom2 = _interopRequireDefault(_dom);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function activateEventStream(event, view) {
    if (event.type == "touchmove") handleTouchMove(event, view);else if (event.type == "touchend") handleTouchEnd(event, view);
}

function handleTouchMove(event, view) {
    if (view.canSlideLeft(event) || view.canSlideRight(event)) {
        var distance = -(event.slideIndex * view.slideWidth) + event.displacement;
        view.move(distance);
    } else if (view.isPullingEdge(event)) {
        var distance = -(event.slideIndex * view.slideWidth) + view.edgePadding / view.slideWidth * event.displacement;
        view.move(distance);
    }
}

function handleTouchEnd(event, view) {
    if (view.hasCrossedMidPoint(event) || view.isFlicked(event)) {
        if (view.canSlideRight(event)) event.slideIndex++;else if (view.canSlideLeft(event)) event.slideIndex--;
    }

    var distance = -(event.slideIndex * view.slideWidth);
    var time = view.isFlicked(event) ? 150 : 300;
    view.animate(distance, time);
}

function SwipeView(container, slideWidth, slideHeight) {
    this.slideWidth = slideWidth || window.innerWidth;
    this.slideHeight = slideHeight || window.innerHeight;

    this.container = container;
    this.slider = this.container.firstElementChild;
    this.slides = this.slider.children;

    this.numSlides = this.slides.length;
    this.edgePadding = this.slideWidth / 10;

    this.setupStyles();
}

SwipeView.prototype.setupStyles = function () {
    this.container.style["width"] = this.slideWidth + "px";
    this.container.style["height"] = this.slideHeight + "px";
    this.container.style["overflow"] = "hidden";

    this.slider.style["width"] = this.numSlides * 100 + "%";
    this.slider.style["height"] = "100%";
    this.slider.style["transform"] = "translate3d(0, 0, 0)";

    var slideWidth = this.slideWidth,
        slideHeight = this.slideHeight;
    Array.prototype.forEach.call(this.slides, function (slide) {
        slide.style["width"] = slideWidth + "px";
        slide.style["height"] = slideHeight + "px";
        slide.style["float"] = "left";
    });
};

SwipeView.prototype.canSlideLeft = function (event) {
    return event.displacement > 0 && event.slideIndex > 0;
};

SwipeView.prototype.canSlideRight = function (event) {
    return event.displacement < 0 && event.slideIndex < this.numSlides - 1;
};

SwipeView.prototype.isPullingEdge = function (event) {
    var sliderPosition = this.slider.getBoundingClientRect().left;
    var nMinusOneSlides = (this.numSlides - 1) * this.slideWidth; // width of (n - 1) slides

    return 0 <= sliderPosition && sliderPosition < this.edgePadding || -nMinusOneSlides - this.edgePadding < sliderPosition && sliderPosition <= -nMinusOneSlides;
};

SwipeView.prototype.hasCrossedMidPoint = function (event) {
    return Math.abs(event.displacement) > this.slideWidth / 2;
};

SwipeView.prototype.isFlicked = function (event) {
    return getSpeed(event) > 1;
};

SwipeView.prototype.animate = function (translateX, ms) {
    this.slider.style["transition"] = "transform " + ms + "ms ease-out";
    this.slider.style["transform"] = "translate3d(" + translateX + "px, 0, 0)";
};

SwipeView.prototype.move = function (translateX) {
    this.slider.style["transition"] = "none";
    this.slider.style["transform"] = "translate3d(" + translateX + "px, 0, 0)";
};

function getSpeed(event) {
    return Math.abs(event.displacement) / (event.time - event.startTime);
}

function getPageX(event) {
    return event.type == "touchend" ? event.changedTouches[0].pageX : event.targetTouches[0].pageX;
}

},{"frpjs":1,"frpjs/dom":2}]},{},[3]);
