'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
// Nodejs functions

var https = require('https'),
    fs = require('fs'),
    Node = {};

Node.https.get = function (url) {
    return function (next) {
        var data = '';
        https.get(url, function (res) {
            res.on('data', function (d) {
                data += d.toString();
            }).on('end', function () {
                next(data);
            });
        }).on('error', function (e) {
            console.log("Got error: " + e.message);
        });
    };
};

Node.fs.readFile = function (filename) {
    return function (next) {
        fs.readFile(filename, function (err, data) {
            next(data, err);
        });
    };
};

exports.default = Node;