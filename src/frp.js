var https = require('https'),
    fs = require('fs'),
    io = require('socket.io'),
    FRP = {}

// Core FRP Functions

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

FRP.foldp = function(eventStream, step, initial) {
    return (function(next) {
        var accumulated = initial
        eventStream(function (value) {
            next(accumulated = step(accumulated, value))
        })
    })
}

FRP.hub = function(eventStream) {
    var nexts = []
    var isStarted = false

    return (function(next) {
        nexts.push(next)
        if (!isStarted) {
            eventStream(function(value) {
                nexts.forEach(function(next) {next(value)})
            })
            isStarted = true
        }
    })
}

FRP.stepper = function (eventStream, initial) {
    var valueAtLastStep = initial

    eventStream(function nextStep(value) {
        valueAtLastStep = value
    })

    return (function behaveAtLastStep() {
        return valueAtLastStep
    })
}

FRP.throttle = function(eventStream, ms) {
    return (function(next) {
        var last = 0
        eventStream(function(value) {
            var now = performance.now()
            if (last == 0 || (now - last) > ms) {
                next(value)
                last = now
            }
        })
    })
}


// DOM functions

FRP.dom = {}

FRP.dom.select = function(selector) {
    return document.querySelector(selector)
}

FRP.dom.selectAll = function(selector) {
    return document.querySelectorAll(selector)
}

FRP.dom.create = function(tagname, text) {
    var elem = document.createElement(tagname)
    if (text) elem.textContent = text
    return elem
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

FRP.dom.onResizeWindow = function(throttle) {
    var resizeEvents = FRP.dom.on(window, 'resize')
    if (throttle) resizeEvents = FRP.throttle(resizeEvents, throttle)
    return function(next) {
        resizeEvents(function() {
            next({width: window.innerWidth, height: window.innerHeight})
        })
    }
}


// XHR functions

FRP.xhr = {}


FRP.xhr.request = function(next) {
    var request = new XMLHttpRequest()
    request.onload = function() {
        if (request.status == 200) {
            if (request.getResponseHeader("Content-Type") == "application/json") {
                next(JSON.parse(request.responseText))
            } else {
                next(request.responseText)
            }
        } else {
            next(new Error('Error: Connecting to ' + url + '. ' + request.statusText))
        }
    }
    return request
}


FRP.xhr.get = url => {
    return next => {
        var request = FRP.xhr.request(next)
        request.open("GET", url)
        request.send()
    }
}

FRP.xhr.post = function(url, body) {
    return next => {
        var request = FRP.xhr.request(next)
        request.open("POST", url)
        if (typeof body === 'object') {
            body = JSON.stringify(body)
            request.setRequestHeader('Content-Type', 'application/json')
        }
        request.send(body)
    }
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

// Socket.io functions for Node

FRP.io = {}
FRP.socket = {}

FRP.io.connectToServer = function(http) {
    io = io(http)
    return io
}

FRP.io.on = function(name) {
    return function(next) {
        io.on(name, next)
    }
}

FRP.io.emit = function(name, msg) {
    io.emit(name, msg)
}

FRP.socket.on = function(socket, name) {
    return function(next) {
        socket.on(name, next)
    }
}

module.exports = FRP