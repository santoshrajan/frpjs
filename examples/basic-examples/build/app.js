(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

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

FRP.snapshot = function (behavior) {
    if (typeof behavior == "function") return behavior();
    return behavior;
};

FRP.liftN = function (combine) {
    for (var _len2 = arguments.length, behaviors = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
        behaviors[_key2 - 1] = arguments[_key2];
    }

    return function () {
        var values = behaviors.map(FRP.snapshot);
        return combine.apply(undefined, _toConsumableArray(values));
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

},{}],3:[function(require,module,exports){
'use strict';

var _frpjs = require('frpjs');

var _frpjs2 = _interopRequireDefault(_frpjs);

var _dom = require('frpjs/dom');

var _dom2 = _interopRequireDefault(_dom);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Example 1: Clear
{
    var clear$ = _frpjs2.default.compose(_dom2.default.createEventStream('#ex1-button', 'click'), _frpjs2.default.map(function (event) {
        return '';
    }));

    clear$(function (text) {
        return _dom2.default.select('#ex1-input').value = text;
    });
}

// Example 2: Copy
{
    var copy$ = _frpjs2.default.compose(_dom2.default.createEventStream('#ex2-input', 'input'), _frpjs2.default.map(function (event) {
        return event.target.value;
    }));

    copy$(function (text) {
        return _dom2.default.select('#ex2-label').textContent = text;
    });
}

// Example 3: Reverse
{
    var copy$ = _frpjs2.default.compose(_dom2.default.createEventStream('#ex3-input', 'input'), _frpjs2.default.map(function (event) {
        return event.target.value;
    }), _frpjs2.default.map(function (text) {
        return text.split('').reverse().join('');
    }));

    copy$(function (text) {
        return _dom2.default.select('#ex3-label').textContent = text;
    });
}

// Example 4: Count
{
    var count$ = _frpjs2.default.compose(_dom2.default.createEventStream('#ex4-button', 'click'), _frpjs2.default.map(function (event) {
        return 1;
    }), _frpjs2.default.fold(function (accum, curr) {
        return accum + curr;
    }, 0));

    count$(function (count) {
        return _dom2.default.select('#ex4-label').textContent = count;
    });
}

// Example 5: Step
{
    var add$ = _frpjs2.default.compose(_dom2.default.createEventStream('#ex5-addBtn', 'click'), _frpjs2.default.map(function (event) {
        return +1;
    }));
    var sub$ = _frpjs2.default.compose(_dom2.default.createEventStream('#ex5-subBtn', 'click'), _frpjs2.default.map(function (event) {
        return -1;
    }));
    var count$ = _frpjs2.default.compose(add$, _frpjs2.default.merge(sub$), _frpjs2.default.fold(function (accum, curr) {
        return accum + curr;
    }, 0));

    count$(function (count) {
        return _dom2.default.select('#ex5-label').textContent = count;
    });
}

// Example 6: Hold
{
    (function () {
        var red$ = _frpjs2.default.compose(_dom2.default.createEventStream('#ex6-redBtn', 'click'), _frpjs2.default.map(function (event) {
            return 'red';
        }));
        var green$ = _frpjs2.default.compose(_dom2.default.createEventStream('#ex6-greenBtn', 'click'), _frpjs2.default.map(function (event) {
            return 'green';
        }));
        var color$ = _frpjs2.default.compose(red$, _frpjs2.default.merge(green$));

        var colorValue = _frpjs2.default.stepper(color$, null);
        color$(function (color) {
            return _dom2.default.select('#ex6-label').textContent = _frpjs2.default.snapshot(colorValue);
        });
    })();
}

// Example 7: Encrypt
{
    (function () {
        var rot13 = function rot13(string) {
            return string.replace(/[a-zA-Z]/g, function (c) {
                return String.fromCharCode((c <= "Z" ? 90 : 122) >= (c = c.charCodeAt(0) + 13) ? c : c - 26);
            });
        };

        var input$ = _frpjs2.default.compose(_dom2.default.createEventStream('#ex7-input', 'input'), _frpjs2.default.map(function (event) {
            return event.target.value;
        }));
        var inputValue = _frpjs2.default.stepper(input$, 'Hello');
        var click$ = _dom2.default.createEventStream('#ex7-button', 'click');

        click$(function (click) {
            return _dom2.default.select('#ex7-label').textContent = rot13(_frpjs2.default.snapshot(inputValue));
        });
    })();
}

// Example 8: Add
{
    (function () {
        var input1$ = _frpjs2.default.compose(_dom2.default.createEventStream('#ex8-input1', 'input'), _frpjs2.default.map(function (event) {
            return event.target.value;
        }), _frpjs2.default.map(function (value) {
            return parseInt(value);
        }));
        var input2$ = _frpjs2.default.compose(_dom2.default.createEventStream('#ex8-input2', 'input'), _frpjs2.default.map(function (event) {
            return event.target.value;
        }), _frpjs2.default.map(function (value) {
            return parseInt(value);
        }));
        var inputs$ = _frpjs2.default.compose(input1$, _frpjs2.default.merge(input2$));
        var totalValue = _frpjs2.default.liftN(function (a, b) {
            return a + b;
        }, _frpjs2.default.stepper(input1$, 5), _frpjs2.default.stepper(input2$, 10));

        inputs$(function (input) {
            return _dom2.default.select('#ex8-label').textContent = _frpjs2.default.snapshot(totalValue);
        });
    })();
}

},{"frpjs":1,"frpjs/dom":2}]},{},[3]);
