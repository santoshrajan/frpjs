// Core FRP functions

const FRP = {}

FRP.map = function(valueTransform) {
    return function(eventStream) {
        return function(next) {
            eventStream(function(value) {
                next(valueTransform(value))
            })
        }
    }
}

FRP.bind = function(valueToEvent) {
    return function(eventStream) {
        return function(next) {
            eventStream(function(value) {
                valueToEvent(value)(next)
            })
        }
    }
}

FRP.filter = function(predicate) { 
    return function(eventStream) {
        return function(next) {
            eventStream(function(value) {
                if (predicate(value)) next(value)
            })
        }
    }
}

FRP.reject = function(predicate) {
    return function(eventStream) {
        return function(next) {
            eventStream(function(value) {
                if (!predicate(value)) next(value)
            })
        }
    }
}

FRP.fold = function(step, initial) {
    return function(eventStream) {
        return function(next) {
            let accumulated = initial
            eventStream(function (value) {
                next(accumulated = step(accumulated, value))
            })
        }
    }
}

FRP.merge = function(eventStreamA) {
    return function(eventStreamB) {
        return function(next) {
            eventStreamA(value => next(value))
            eventStreamB(value => next(value))
        }
    }
}

FRP.compose = function(eventStream, ...operations) {
    if (operations.length == 0) return eventStream

    let operation = operations.shift()
    return FRP.compose(operation(eventStream), ...operations)
}

FRP.stepper = function (eventStream, initial) {
    let valueAtLastStep = initial

    eventStream(function nextStep(value) {
        valueAtLastStep = value
    })

    return (function behaveAtLastStep() {
        return valueAtLastStep
    })
}


FRP.snapshot = function(behavior) {
    if (typeof behavior == "function")
        return behavior()
    return behavior
}

FRP.liftN = function(combine, ...behaviors) {
    return function() {
        const values = behaviors.map(FRP.snapshot)
        return combine(...values)
    }
}

FRP.throttle = function(eventStream, ms) {
    return (function(next) {
        let last = 0
        eventStream(function(value) {
            let now = performance.now()
            if (last == 0 || (now - last) > ms) {
                next(value)
                last = now
            }
        })
    })
}

export default FRP