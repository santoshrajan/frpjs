require=(function(e,t,n){function i(n,s){if(!t[n]){if(!e[n]){var o=typeof require=="function"&&require;if(!s&&o)return o(n,!0);if(r)return r(n,!0);throw new Error("Cannot find module '"+n+"'")}var u=t[n]={exports:{}};e[n][0].call(u.exports,function(t){var r=e[n][1][t];return i(r?r:t)},u,u.exports)}return t[n].exports}var r=typeof require=="function"&&require;for(var s=0;s<n.length;s++)i(n[s]);return i})({"frpjs":[function(require,module,exports){
module.exports=require('XLcxgT');
},{}],"XLcxgT":[function(require,module,exports){
var https = require('https'),
    fs = require('fs'),
    io = require('socket.io'),
    FRP = {}

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
                nexts.forEach(function(next) {next(value)})
            })
            isStarted = true
        }
    })
}

// DOM functions

FRP.dom = {}

FRP.dom.select = function(selector) {
    return document.querySelector(selector)
}

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

FRP.dom.onSubmit = function(element, useCapture) {
    return FRP.dom.on(element, 'submit', !!useCapture)
}

// Nodejs functions

FRP.https = {}
FRP.fs = {}

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

FRP.io = {}
FRP.socket = {}


FRP.io.connectToServer = function(http) {
    io = io(http)
}

FRP.io.on = function(name) {
    return function(next) {
        io.on(name, next)
    }
}

FRP.socket.on = function(socket, name) {
    return function(next) {
        socket.on(name, next)
    }
}



module.exports = FRP
},{"https":1,"fs":1,"socket.io":1}],1:[function(require,module,exports){

},{}]},{},[])
;