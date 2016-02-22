# Swipeview

Swipeview.js is a library that uses frpjs for building smooth touch-based content sliders. See the [source code here](swipeview.js) or [try it out on a mobile browser](http://santoshrajan.com/frpjs/swipeview/).

**Usage**

Create a div structure as shown below. The `container` div is the visual container, `slider` holdes the individual `slides` and moves underneath the container.

```html
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

```js
import swipeview from "swipeview"

swipeview("#container")
```

**How it works**

Swipeview composes touch events on the container element using various core frp primitives and activates the composed event stream through an activation function.

The core logic is placed inside a single `compose`:

```js
let stream$ = frp.compose(
    dom.onTouchStart(selector),
    frp.merge(dom.onTouchMove(selector)),
    frp.merge(dom.onTouchEnd(selector)),

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

```js
...
    dom.onTouchStart(selector),
    frp.merge(dom.onTouchMove(selector)),
    frp.merge(dom.onTouchEnd(selector)),
...
```

Then, map over the combined event stream and pick out the event type, x position and timestamp from each event.

```js
...
    frp.map(event => ({
        type: event.type,
        pageX: getPageX(event),
        time: event.timeStamp
    })),
...
```

Finally, using fold, copy the start x position and start time from each touchstart to their corresponding touchmove and touchend events. Calculate the current displacement and add a `slideIndex` to hold the index of the current slide.

```js
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

```js
const view = new SwipeView(selector, slideWidth, slideHeight)
stream$(event => activateEventStream(event, view))
```

Inside the activation function, based on the event type, different scenarios -- such as swiping, flicking, pulling the slider edge -- are handled and appropriate changes are made to the DOM.

```js
function activateEventStream(event, view) {
    if (event.type == "touchmove")
        handleTouchMove(event, view)
    else if (event.type == "touchend")
        handleTouchEnd(event, view)
}
```