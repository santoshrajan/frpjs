# frpjs

## Functional Reactive Programming Library for JavaScript

### Wrapper functions for DOM, nodejs, socket.io

Functional Reactive Programming, is an evented programming model originally implemented in Haskell. The FRP model postulates Event Streams as continuous rather than descrete. Event streams have values that change over time. FRP allows you to modify those streams of values. The motivation for implementing FRP in JavaScript is the talk by Conal Elliot at Lambda Jam 2015. 
[The Essence and Origins of Functional Reactive Programming](https://www.youtube.com/watch?v=j3Q32brCUAI)

### Docs

No docs yet. See the FRP version of the [socket.io chat example](http://socket.io/get-started/chat/) in the examples folder.

#### Install

```
$ npm install frpjs --save
```

For browser, create 'frpjs-bundle.js'
```
$ browserify -r frpjs -i socket.io -i https -i fs -o frpjs-bundle.js
```


