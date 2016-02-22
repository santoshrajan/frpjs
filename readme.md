# frpjs

## Functional Reactive Programming Library for JavaScript

Functional Reactive Programming, is an evented programming model originally implemented in Haskell. The FRP model postulates Event Streams as continuous rather than discrete. Event streams have values that change over time. FRP allows you to modify those streams of values. The motivation for implementing FRP in JavaScript is the talk by Conal Elliot at Lambda Jam 2015. 
[The Essence and Origins of Functional Reactive Programming](https://www.youtube.com/watch?v=j3Q32brCUAI)

### Install

Install using npm

```
$ npm install frpjs --save
```

### Examples

- [Basic Examples](examples/basic-examples/readme.md)
- [Swipeview](examples/swipeview/readme.md)

### Documentation

#### Core frpjs functions

```js
import FRP from "frpjs"

FRP.map(valueTransform)(eventStream)
// Takes an eventStream and a function that transforms the value of the Event.
// Returns a new Event that emits the transformed Value

FRP.bind(valueToEvent)(eventStream)
// Binds an eventStream to a new EventStream. Function valueToEvent is called
// with the event value. Returns a new Event Stream.

FRP.filter(predicate)(eventStream)
// Filters an Event Stream. Predicate is called with every value.

FRP.reject(eventStream, predicate)
// Opposite of filter

FRP.fold(step, initial)(eventStream)
// Is the 'reduce' function for every event in the stream. The step function
// is called with the accumulator and the current value. The parameter initial
// is the initial value of the accumulator

FRP.merge(eventStreamA)(eventStreamB)
// Takes two eventStreams, combines them and returns a new eventStream

FRP.compose(eventStream, ...operations)
// Takes an eventStream, performs a series of operations on it and returns
// a modified stream. All FRP operations are curried by default.

FRP.stepper(initial)(eventStream)
// Returns a behaviour. Call the behaviour for the last value of the event.

FRP.throttle(ms)(eventStream)
// Throttle an EventStream to every ms milliseconds
```

#### DOM functions

```js
import DOM from "frpjs/dom"

DOM.select(selector)
// Same as document.querySelector

DOM.selectAll(selector)
// Same as document.querySelectorAll

DOM.createElement(tagname[, text])
// Creates an element with the given tagname. Optional text will be added
// to the textContent of created element

DOM.createEventStream(selector, name, useCapture)
// Return a new DOM Event Stream on the element matching the given selector

DOM.onClick(selector, useCapture)
// Returns a new 'click' Event Stream on the element matching the given selector

DOM.onChange(selector, useCapture)
// Returns a new 'change' Event Stream on the element matching the given selector

DOM.onSubmit(selector, useCapture)
// Returns a new 'submit' Event Stream on the element matching the given selector

DOM.onTouchStart(selector, useCapture)
// Returns a new 'touchstart' Event Stream on the element matching the given selector

DOM.onTouchMove(selector, useCapture)
// Returns a new 'touchmove' Event Stream on the element matching the given selector

DOM.onTouchEnd(selector, useCapture)
// Returns a new 'touchend' Event Stream on the element matching the given selector
```
