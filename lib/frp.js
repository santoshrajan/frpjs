/*
 *  Functional Reactive Programming Library for JavaScript. 
 *  Based on Minimal FRP Events and behaviours by Gordon Brander
 *  https://gist.github.com/gordonbrander/8920062
*/

var FRP = {}

FRP.stepper = function (events, initial) {
    var valueAtLastStep = initial

    events(function nextStep(value) {
        valueAtLastStep = value
    })

    return (function behaveAtLastStep() {
        return valueAtLastStep
    })
}

FRP.map = function(eventStream, valueTransform) {
    return function(next) {
        eventStream(function(value) {
            next(valueTransform(value))
        })
    }
}

FRP.bind = function(eventStream, valueToEvent) {
    return function(next) {
        eventStream(function(value) {
            valueToEvent(value)(next)
        })
    }
}

FRP.filter = function(eventStream, predicate) {
    return function(next) {
        eventStream(function(value) {
            if (predicate(value)) next(value)
        })
    }
}

FRP.reject = function(eventStream, predicate) {
    return function(next) {
        eventStream(function(value) {
            if (!predicate(value)) next(value)
        })
    }
}

FRP.foldp = function(events, step, initial) {
    return (function(next) {
        var accumulated = initial
        events(function (value) {
            next(accumulated = step(accumulated, value))
        })
    })
}

FRP.hub = function(events) {
    var nexts = []
    var isStarted = false

    return (function(next) {
        nexts.push(next);
        if (!isStarted) {
            events(function(value) {
                nexts.forEach(next => next(value))
            })
            isStarted = true
        }
    })
}

module.exports = FRP