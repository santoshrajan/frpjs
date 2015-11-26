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

For browser, use 'frpjs-bundle.js' in the lib folder or create 'frpjs-bundle.js' using browserify.
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

frpjs Events are just functions that take a callback as their argument. The callbacks are called with the value of the Event, whenever an event occurs. Events are not activated when they are created. They are activated when you call the Event with a callback.

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

##### The client side code

```
<!doctype html>
<html>
  <head>
    <title>Socket.IO chat</title>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font: 13px Helvetica, Arial; }
      form { background: #000; padding: 3px; position: fixed; bottom: 0; width: 100%; }
      form input { border: 0; padding: 10px; width: 90%; margin-right: .5%; }
      form button { width: 9%; background: rgb(130, 224, 255); border: none; padding: 10px; }
      #messages { list-style-type: none; margin: 0; padding: 0; }
      #messages li { padding: 5px 10px; }
      #messages li:nth-child(odd) { background: #eee; }
    </style>
  </head>
  <body>
    <ul id="messages"></ul>
    <form action="">
      <input id="m" autocomplete="off" /><button>Send</button>
    </form>

<script src="https://cdn.socket.io/socket.io-1.2.0.js"></script>

<!-- $ browserify -r frpjs -i socket.io -i https -i fs -o frpjs-bundle.js -->
<script src="js/frpjs-bundle.js"></script>

<script>

var socket         = io(),
    frp            = require('frpjs'),
    input          = frp.dom.select('input'),
    submitEvents   = frp.dom.onSubmit(frp.dom.select('form')),
    filteredEvents = frp.filter(submitEvents, () => !!input.value.length)

filteredEvents(e => {
    socket.emit('chat message', input.value)
    input.value = ''
    e.preventDefault()
})

socket.on('chat message', msg =>
    frp.dom.select('ul').appendChild(frp.dom.create('li', msg))
)

</script>

  </body>
</html>
```

We create a submit Event first
```
submitEvents   = frp.dom.onSubmit(frp.dom.select('form'))
```

Next we apply a filter on the `submit` events, so that only valid submissions (input field is not empty) are allowed. The filter returns a new filtered Event.
```
filteredEvents = frp.filter(submitEvents, () => !!input.value.length)
```

Then we insert every chat message into the DOM.
```
socket.on('chat message', msg =>
    frp.dom.select('ul').appendChild(frp.dom.create('li', msg))
)
```

### frpjs docs - Available functions

#### Core frpjs functions

```
FRP.map(eventStream, valueTransform)
// Takes an eventStream and a function that transforms the value of the Event.
// Returns a new Event that emits the transformed Value

FRP.bind(eventStream, valueToEvent)
// Binds an eventStream to a new EventStream. Function valueToEvent is called
// with the event value. Returns a new Event Stream.

FRP.filter(eventStream, predicate)
// Filters an Event Stream. Predicate is called with every value.

FRP.reject(eventStream, predicate)
// Opposite of filter

FRP.foldp(eventStream, step, initial)
// Is the 'reduce' function for every event in the stream. step function
// is called accumulator and the current value.

FRP.hub(eventStream)
// Returns a new Event hub. Every time you call the hub with a listener, 
// the listener is added to the hub and called with the event value

FRP.stepper(eventStream, initial) 
// Returns a behaviour. Call the behaviour for the last value of the event.

FRP.throttle = function(eventStream, ms)
// Throttle an EventStream to every ms milliseconds
```

#### DOM functions

```
FRP.dom.select(selector)
// Same as document.querySelector

FRP.dom.selectAll(selector)
// Same as document.querySelectorAll

FRP.dom.create(tagname[, text])
// Creates an element with the given tagname. Optional text will be added
// to the textContent of created element

FRP.dom.on(element, name, useCapture)
// Return a new DOM Event Stream on the given element

FRP.dom.onClick(element, useCapture)
// Returns a new 'click' Event Stream on the given element

FRP.dom.onChange(element, useCapture)
// Returns a new 'change' Event Stream on the given element

FRP.dom.onSubmit(element, useCapture)
// Returns a new 'submit' Event Stream on the given element

FRP.dom.onResizeWindow = function([throttle])
// Returns a window resize event Stream. Optional throttle will throttle the 
// eventStream to every 'throttle' milliseconds.
```

#### XHR functions

```
FRP.xhr.get(url)
// Gets the url. Call the returned event with a callback
// Callback is called with value. Value can be on of following
// 1. responseText, 2. JSON Object if content type is application/json
// 3. Error Object (check instanceof Error)

FRP.xhr.post(url, body)
// if body is a JSON object type application/json is posted.
// response works like get above
```

#### Nodejs functions

```
FRP.https.get(url)
// Will return an 'end' event. Callback is called with data

FRP.fs.readFile(filename)
// Will return a an EventStream. Callback is called with data
```

#### Socket.io functions for Node

```
FRP.io.connectToServer(http)
// connect socket io to the http server. Returns 'io'

FRP.io.on = function(name)
// wrapper for io.on

FRP.io.emit(name, msg)
// wrapper for io.emit

FRP.socket.on(socket, name)
// wrapper for socket.on
```



