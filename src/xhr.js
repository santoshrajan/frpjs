// XHR functions

const FRP = require("frp"),
      XHR = {}

XHR.request = function(next) {
    let request = new XMLHttpRequest()
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

XHR.get = url => {
    return next => {
        let request = XHR.request(next)
        request.open("GET", url)
        request.send()
    }
}

XHR.post = function(url, body) {
    return next => {
        let request = XHR.request(next)
        request.open("POST", url)
        if (typeof body === 'object') {
            body = JSON.stringify(body)
            request.setRequestHeader('Content-Type', 'application/json')
        }
        request.send(body)
    }
}

module.exports = XHR