# frpjs

## Functional Reactive Programming Library for JavaScript

Functional Reactive Programming, is an evented programming model originally implemented in Haskell. The FRP model postulates Event Streams as continuous rather than discrete. Event streams have values that change over time. FRP allows you to modify those streams of values. The motivation for implementing FRP in JavaScript is the talk by Conal Elliot at Lambda Jam 2015. 
[The Essence and Origins of Functional Reactive Programming](https://www.youtube.com/watch?v=j3Q32brCUAI)

#### Install

Install using npm

```
$ npm install frpjs --save
```

#### Example: swipeview

Swipeview.js is a library that uses frpjs for building smooth touch-based content sliders for mobile devices. See the [source code here](examples/swipeview/swipeview.js) or [try it out on a mobile browser](http://santoshrajan.com/frpjs/swipeview/).

**Usage**

Create a div structure as shown below. The `container` div is the visual container, `slider` holdes the individual `slides` and moves underneath the container.

```
<div id="container">
    <div id="slider">
        <div id="slide-1"></div>
        <div id="slide-2"></div>
        <div id="slide-3"></div>
        <div id="slide-4"></div>    
    </div>
</div>
```

Require the `swipeview` module and call it with a selector to the container element.

```
import swipeview from "swipeview"

swipeview("#container")
```

**How it works**

Swipeview composes touch events on the container element using various core frp primitives and activates the composed event stream through an activation function.

The core logic is placed inside a single `compose`:

```
let stream$ = frp.compose(
    dom.touchStart(container),
    frp.merge(dom.touchMove(container)),
    frp.merge(dom.touchEnd(container)),

    frp.map(event => ({
        type: event.type,
        pageX: getPageX(event),
        time: event.timeStamp
    })),

    frp.fold((prev, curr) => {
        curr.startX = (curr.type == "touchstart") ? curr.pageX : prev.startX
        curr.startTime = (curr.type == "touchstart") ? curr.time : prev.startTime
        curr.displacement = curr.pageX - curr.startX
        curr.slideIndex = prev.slideIndex

        return curr
    }, { slideIndex: 0 })
)
```

First, create touchstart, touchmove and touchend event streams on the container element and combine them into a single stream using merge.

```
...
    dom.touchStart(container),
    frp.merge(dom.touchMove(container)),
    frp.merge(dom.touchEnd(container)),
...
```

Then, map over the combined event stream and pick out the event type, x position and timestamp from each event.

```
...
    frp.map(event => ({
        type: event.type,
        pageX: getPageX(event),
        time: event.timeStamp
    })),
...
```

Finally, using fold, copy the start x position and start time from each touchstart to their corresponding touchmove and touchend events. Calculate the current displacement and add a `slideIndex` to hold the index of the current slide.

```
...
    frp.fold((prev, curr) => {
        curr.startX = (curr.type == "touchstart") ? curr.pageX : prev.startX
        curr.startTime = (curr.type == "touchstart") ? curr.time : prev.startTime
        curr.displacement = curr.pageX - curr.startX
        curr.slideIndex = prev.slideIndex

        return curr
    }, { slideIndex: 0 })
...
```

The composed event stream is then activated using an activation function. The activation function takes in a view object and handles the DOM updates. The view object holds references to the container, slider and individual slide elements.

```
const view = new SwipeView(container, slideWidth, slideHeight)
stream$(event => activateEventStream(event, view))
```

Inside the activation function, based on the event type, different scenarios -- such as swiping, flicking, pulling the slider edge -- are handled and appropriate changes are made to the DOM.

```
function activateEventStream(event, view) {
    if (event.type == "touchmove")
        handleTouchMove(event, view)
    else if (event.type == "touchend")
        handleTouchEnd(event, view)
}
```

### frpjs docs - Available functions

#### Core frpjs functions

```
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

```
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