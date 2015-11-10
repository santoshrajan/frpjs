var https = require('https'),
    fs = require('fs'),
    io = require('socket.io'),
    FRP = {
    	https: {},
    	fs: {},
        io: {},
        dom: {},
        node: {}
    }

// DOM functions

FRP.dom.on = function(element, name, useCapture) {
    return function(next) {
        element.addEventListener(name, next, !!useCapture)
    }
}

FRP.dom.onClick = function(element, useCapture) {
    return FRP.dom.on(element, 'click', !!useCapture)
}

FRP.dom.onChange = function(element, useCapture) {
    return FRP.dom.on(element, 'change', !!useCapture)
}

// Nodejs functions

FRP.https.get = function(url) {
    return function(next) {
        var data = ''
        https.get(url, function(res) {
            res.on('data', function(d) {
                data += d.toString()
            }).on('end', function() {
                next(data)
            })
        }).on('error', function(e) {
            console.log("Got error: " + e.message);
        })
    }
}

FRP.fs.readFile = function(filename) {
    return function(next) {
        fs.readFile(filename, function(err, data) {
            next(data, err)
        })
    }
}

// Socket.io functions

FRP.io.connectToServer = function(http) {
    io = io(http)
}

FRP.io.on = function(name) {
    return function(next) {
        io.on(name, next)
    }
}

// Core FRP Functions

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