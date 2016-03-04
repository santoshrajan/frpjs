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

FRP.hub = function () {
    return function (eventStream) {
        var nexts = [];
        var isStarted = false;

        return function (next) {
            nexts.push(next);
            if (!isStarted) {
                eventStream(function (value) {
                    nexts.forEach(function (next) {
                        next(value);
                    });
                });
                isStarted = true;
            }
        };
    };
};

exports.default = FRP;