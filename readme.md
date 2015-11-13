# frpjs

## Functional Reactive Programming Library for JavaScript

### Wrapper functions for DOM, nodejs, socket.io

Functional Reactive Programming, is an evented programming model originally implemented in Haskell. The FRP model postulates Event Streams as continuous rather than descrete. Event streams have values that change over time. FRP allows you to modify those streams of values. The motivation for implementing FRP in JavaScript is the talk by Conal Elliot at Lambda Jam 2015. 
[The Essence and Origins of Functional Reactive Programming](https://www.youtube.com/watch?v=j3Q32brCUAI)

#### Install

You need socket.io and browserify installed globally.

```
$ npm install frpjs --save
```

For browser, create 'frpjs-bundle.js'
```
$ browserify -r frpjs -i socket.io -i https -i fs -o frpjs-bundle.js
```

#### The [socket.io chat example](http://socket.io/get-started/chat/) using frpjs

Compare the socket.io chat example to the code give below

```
// Node Server for socket.io chat example using frpjs

var express = require('express'),
    app = express(),
    http = require('http').Server(app),
    frp = require('frpjs')

app.use(express.static('public'))

frp.io.connectToServer(http)

var connectionEvent       = frp.io.on('connection'),
    connectionToSockEvent = socket => frp.socket.on(socket, 'chat message')
    msgEvent              = frp.bind(connectionEvent, connectionToSockEvent)

msgEvent(msg => frp.io.emit('chat message', msg))

http.listen(3000, function(){
  console.log('listening on *:3000')
})
```

First Connect socket.io to the http server.
```
frp.io.connectToServer(http)

```
Next, create a connection Event.
```
connectionEvent       = frp.io.on('connection')
```

frpjs Events are just functions that take a callback as their argument. The callbacks are called with the value of the Event, whenever an event occurs. Events are not activated when they are created. They are activated when you you call the Event with a callback.

We then create a function that takes a socket as argument and returns a 'chat message' Event.
```
connectionToSockEvent = socket => frp.socket.on(socket, 'chat message')

```

Now we bind the 'connection' Event to the 'chat message' Event.
```
msgEvent              = frp.bind(connectionEvent, connectionToSockEvent)
```

msgEvent is the new Event created by binding the above two Events. It is important to note here that none of the Events are activated yet. The Events get activated when msgEvent is called with the callback.

```
msgEvent(msg => frp.io.emit('chat message', msg))
```

