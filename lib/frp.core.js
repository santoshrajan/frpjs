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

    if (!operations) return eventStream;

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