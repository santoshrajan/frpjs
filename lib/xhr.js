"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

// XHR functions

var FRP = require("frp"),
    XHR = {};

XHR.request = function (next) {
    var request = new XMLHttpRequest();
    request.onload = function () {
        if (request.status == 200) {
            if (request.getResponseHeader("Content-Type") == "application/json") {
                next(JSON.parse(request.responseText));
            } else {
                next(request.responseText);
            }
        } else {
            next(new Error('Error: Connecting to ' + url + '. ' + request.statusText));
        }
    };
    return request;
};

XHR.get = function (url) {
    return function (next) {
        var request = XHR.request(next);
        request.open("GET", url);
        request.send();
    };
};

XHR.post = function (url, body) {
    return function (next) {
        var request = XHR.request(next);
        request.open("POST", url);
        if ((typeof body === "undefined" ? "undefined" : _typeof(body)) === 'object') {
            body = JSON.stringify(body);
            request.setRequestHeader('Content-Type', 'application/json');
        }
        request.send(body);
    };
};

module.exports = FRP;